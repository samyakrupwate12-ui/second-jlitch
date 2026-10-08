const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const source = ts.transpileModule(fs.readFileSync('src/lib/shopping.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const sandbox = { exports: {} }; vm.runInNewContext(source, sandbox);
const { availableQuantity, parseSavedItems } = sandbox.exports;
test('sold, hidden and unknown-stock pieces cannot be purchased', () => {
 for (const product of [null, {}, {status:'sold',isCatalogVisible:true,inventoryQuantity:1}, {status:'active',isCatalogVisible:false,inventoryQuantity:3}]) assert.equal(availableQuantity(product),0);
 assert.equal(availableQuantity({status:'active',isCatalogVisible:true,inventoryQuantity:1}),1);
});
test('malformed saved data cannot inject prices or invalid quantities', () => {
 assert.equal(parseSavedItems('broken').length,0);
 const id='ff1e10de-36f1-4fb6-9d83-23a25d9a231e';
 const rows=parseSavedItems(JSON.stringify([{product_id:id,kind:'cart',quantity:1,price:0},{product_id:id,kind:'cart',quantity:2},{product_id:id,kind:'wishlist',quantity:99},{product_id:id,kind:'cart',quantity:-1}]));
 assert.equal(rows.length,2);assert.equal(rows[0].quantity,2);assert.equal(rows[1].quantity,1);assert.equal(rows[0].price,undefined);
});
