const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');

function load(file, overrides = {}) {
  const sandbox = { exports: {}, console, crypto, process, require(name) {
    if (name in overrides) return overrides[name];
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`, overrides);
    return require(name);
  }};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, sandbox);
  return sandbox.exports;
}
const { filterCatalogue, defaultFilters, statusAfterStockChange, validateProductImage } = load('src/lib/catalogue.ts');
test('catalogue combines brand search, size, condition, stock and price sorting', () => {
  const base = { name:'Dress', category:'Dresses', brand:'Zara', size:'M', condition:'Excellent', productType:'Pre-Loved', status:'active', isCatalogVisible:true, inventoryQuantity:1 };
  const products = [{...base,id:'1',price:800}, {...base,id:'2',price:1200}, {...base,id:'3',price:500,status:'sold'}, {...base,id:'4',price:600,size:'L'}];
  const filtered = filterCatalogue(products, {...defaultFilters,search:' zara ',category:'Dresses',size:'M',condition:'Excellent',type:'Pre-Loved',inStock:true,sort:'price-high'});
  assert.equal(filtered.map(p=>p.id).join(','),'2,1');
  assert.equal(filterCatalogue(products,{...defaultFilters,under999:true}).length,3);
  assert.equal(products[0].id,'1');
});
test('stock adjustments never publish drafts or archived products', () => {
  for (const status of ['draft','archived']) for (const qty of [0,1]) assert.equal(statusAfterStockChange(status,qty),status);
  assert.equal(statusAfterStockChange('active',0),'sold');
  assert.equal(statusAfterStockChange('sold',1),'active');
});
test('image validation rejects oversized, empty and unsupported files', () => {
  for (const file of [{type:'image/svg+xml',size:12},{type:'image/jpeg',size:0},{type:'image/png',size:10485761}]) assert.ok(validateProductImage(file));
  assert.equal(validateProductImage({type:'image/webp',size:10485760}),null);
});

function databaseMock(responses) {
  const calls=[];
  const client = { from(table) {
    calls.push(['from',table]);
    const query={ then(resolve,reject) { return Promise.resolve(responses.shift()).then(resolve,reject); } };
    for (const method of ['select','insert','update','delete','eq','in','order','single','maybeSingle']) query[method]=(...args)=>{calls.push([method,...args]);return query;};
    return query;
  }, rpc: async (...args)=>{calls.push(['rpc',...args]);return responses.shift();}, storage:{ from() {return {
    remove:async paths=>{calls.push(['remove',paths]);return {error:null};},
    upload:async()=>{throw new Error('Unexpected upload');},
  };} } };
  return {calls,api:load('src/lib/products-db.ts',{'@/lib/supabase':{supabase:client}})};
}
test('catalogue load failures are not reported as an empty collection', async () => {
  const {api}=databaseMock([{error:{message:'network'}}]);
  await assert.rejects(api.getPublicProducts(),/Unable to load/);
});
test('denied product changes cannot be reported as a successful save', async () => {
  const {api,calls}=databaseMock([{error:null,count:0}]);
  await assert.rejects(api.updateProduct('product',{inventory_quantity:1},[]),/not updated/);
  assert.equal(calls.some(call=>call[0]==='rpc'),false);
});
test('gallery failure preserves the created product ID for recovery and reports partial save', async () => {
  const {api,calls}=databaseMock([{data:{id:'new-product'},error:null},{error:{message:'permission denied'}}]);
  await assert.rejects(api.createProduct({name:'Dress',slug:'dress',price:500,inventory_quantity:1,status:'active',product_type:'pre-loved'},[{image_url:'image.jpg',is_primary:true}]),error=>error instanceof api.ProductSaveError && error.productId==='new-product');
  assert.equal(calls.some(call=>call[0]==='remove'),false);
});
test('gallery sends an ordered atomic save and cleans removed storage files only after success', async () => {
  const previous=process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';
  try {
    const old='https://example.supabase.co/storage/v1/object/public/product-images/products/product/old.jpg';
    const {api,calls}=databaseMock([{error:null,count:1},{data:[old],error:null},{data:{id:'product',product_images:[]},error:null}]);
    await api.updateProduct('product',{inventory_quantity:2},[{id:'b',image_url:'b.jpg',is_primary:true},{id:'a',image_url:'a.jpg',is_primary:false}]);
    const rpc=calls.find(call=>call[0]==='rpc');
    assert.equal(rpc[1],'save_product_images');
    assert.equal(rpc[2].p_images.map(image=>image.id).join(','),'b,a');
    assert.equal(calls.find(call=>call[0]==='remove')[1][0],'products/product/old.jpg');
    assert.ok(calls.findIndex(call=>call[0]==='remove')>calls.findIndex(call=>call[0]==='rpc'));
  } finally { if(previous===undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL=previous; }
});
