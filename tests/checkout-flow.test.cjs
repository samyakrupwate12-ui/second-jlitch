const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/checkout'});
for(const name of ['window','document','HTMLElement','HTMLInputElement'])global[name]=dom.window[name];
global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react');
const {createRoot}=require('react-dom/client');
let user=null,enabled=false,paymentOptions,pushed,requests=[];
const item={product_id:'00000000-0000-4000-8000-000000000001',quantity:1,kind:'cart'};
const modules=new Map();
global.fetch=async()=>Response.json({enabled,mode:'test'});
function load(file){const full=path.resolve(file);if(modules.has(full))return modules.get(full).exports;const module={exports:{}};modules.set(full,module);
 const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(name=>{
  if(name==='@/context/ShopContext')return {useShop:()=>({user,ready:true,items:[item]})};
  if(name==='next/navigation')return {useRouter:()=>({push:href=>{pushed=href;}})};
  if(name==='next/link')return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
  if(name==='next/script')return {__esModule:true,default:function Script({onReady}){React.useEffect(()=>{onReady();},[]);return null;}};
  if(name==='@/lib/checkout-client')return {checkoutRequestId:async()=> 'request-test',checkoutFetch:async(url,body)=>{
   requests.push({url,body});
   if(url.endsWith('/quote'))return {lines:[{...item,name:'Test dress',size:'M',unitPaise:134900,linePaise:134900}],subtotalPaise:134900,shippingPaise:5000,totalPaise:139900,currency:'INR'};
   if(url.endsWith('/orders'))return {id:'checkout-test',status:'pending',keyId:'rzp_test_example',razorpayOrderId:'order_test',totalPaise:139900};
   return {status:'paid'};
  }};
  if(name.startsWith('@/'))return load(`src/${name.slice(2)}.ts`);
  return require(name);
 },module,module.exports);return module.exports;
}
const Checkout=load('src/app/checkout/page.tsx').default;
let root;
async function render(key){await React.act(async()=>{root ||= createRoot(document.getElementById('root'));root.render(React.createElement(Checkout,{key}));});}
async function fill(){await React.act(async()=>{
 const values={name:'Test Shopper',phone:'9876543210',line1:'12 Test Road',city:'Nashik',state:'Maharashtra',pincode:'422001'};
 for(const [name,value] of Object.entries(values)){
  const input=document.querySelector(`[name="${name}"]`);
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,value);
  input.dispatchEvent(new window.Event('input',{bubbles:true}));
 }
});}
async function review(){await React.act(async()=>document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));}
test('checkout gates sign-in, reviews server totals and leaves unconfigured payments disabled',async()=>{
 await render('guest');assert.match(document.body.textContent,/Sign in to checkout/);
 user={id:'user-a',email:'test@example.test'};await render('signed-in');await fill();await review();
 assert.match(document.body.textContent,/1,399.00/);
 const pay=[...document.querySelectorAll('button')].find(button=>button.textContent==='Payments coming soon');assert.ok(pay);assert.equal(pay.disabled,true);
 assert.equal(requests.some(request=>request.url.endsWith('/orders')),false);
 await React.act(async()=>root.unmount());root=null;
});
test('test checkout opens with server order, verifies callback and routes to recoverable status page',async()=>{
 enabled=true;requests=[];window.Razorpay=class{constructor(options){paymentOptions=options;}on(){}open(){}};
 await render('configured');await fill();await review();
 await React.act(async()=>[...document.querySelectorAll('button')].find(button=>button.textContent==='Pay in test mode').click());
 assert.equal(paymentOptions.order_id,'order_test');assert.equal(paymentOptions.amount,139900);
 await React.act(async()=>paymentOptions.handler({razorpay_order_id:'order_test',razorpay_payment_id:'pay_test',razorpay_signature:'test-signature'}));
 assert.equal(pushed,'/checkout/orders/checkout-test');assert.ok(requests.some(request=>request.url.endsWith('/verify')));
 await React.act(async()=>root.unmount());root=null;
});
