const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<div id="root"></div>', { url:'http://localhost/products' });
global.window=dom.window; global.document=dom.window.document;
global.IS_REACT_ACT_ENVIRONMENT=true;
const {createRoot}=require('react-dom/client');
let fail=true;
let preLovedRequested=false;
const rows=[
  {id:'a',name:'Blue dress',brand:'Zara',category:'Dresses',condition:'Excellent',size:'M',price:800,status:'active',is_catalog_visible:true,inventory_quantity:1,product_type:'pre-loved',product_images:[]},
  {id:'b',name:'Cream top',brand:'Vintage',category:'Tops',condition:'Good Condition',size:'S',price:1200,status:'sold',is_catalog_visible:true,inventory_quantity:0,product_type:'new',product_images:[]},
];
function load(file) {
  const module={exports:{}};
  const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',output)(name=>{
    if(name==='@/lib/products-db') return {getPublicProducts:async(preLoved)=>{preLovedRequested=preLoved;if(fail)throw new Error('Offline');return rows.filter(p=>!preLoved||p.product_type==='pre-loved');}};
    if(name==='@/components/product/ProductCard') return {__esModule:true,default:({product})=>React.createElement('div',{'data-product':product.id},product.name)};
    if(name==='@/components/ui/SkyBackground') return {__esModule:true,default:()=>null};
    if(name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
    return require(name);
  },module,module.exports);
  return module.exports;
}
const Catalogue=load('src/components/product/CatalogueView.tsx').default;
const click=async(text)=>React.act(async()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent===text);assert.ok(button,text);button.click();});
test('catalogue retries loading and applies visible filter controls on both collections',async()=>{
  const root=createRoot(document.getElementById('root'));
  await React.act(async()=>root.render(React.createElement(Catalogue)));
  assert.match(document.querySelector('[role="alert"]').textContent,/Unable to load/);
  fail=false;await click('Try again');
  assert.equal(document.querySelectorAll('[data-product]').length,2);
  await click('Filter');
  assert.equal(document.querySelector('[aria-controls="catalogue-filters"]').getAttribute('aria-expanded'),'true');
  await React.act(async()=>document.querySelector('input[type="checkbox"]').click());
  assert.equal(document.querySelectorAll('[data-product]').length,1);
  await click('Reset filters');await click('Dresses');
  assert.equal(document.querySelector('[data-product]').getAttribute('data-product'),'a');
  await React.act(async()=>root.render(React.createElement(Catalogue,{preLovedOnly:true,key:'pre-loved'})));
  assert.equal(preLovedRequested,true);
  assert.equal(document.querySelectorAll('[data-product]').length,1);
  await React.act(async()=>root.unmount());
});
