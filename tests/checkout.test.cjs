const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const crypto=require('node:crypto');
const productId='00000000-0000-4000-8000-000000000001';
const userA='00000000-0000-4000-8000-000000000002';
const userB='00000000-0000-4000-8000-000000000003';
const requestId='00000000-0000-4000-8000-000000000004';
const orderId='00000000-0000-4000-8000-000000000005';
const address={name:'Test Shopper',phone:'9876543210',line1:'12 Test Lane',line2:'',city:'Nashik',state:'Maharashtra',pincode:'422001',country:'IN'};
let orders=[],products=[],providerCalls=0,providerFail=false,paymentStatus='captured',wrongAmount=false;
process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='public-test-key';
process.env.SUPABASE_SECRET_KEY='server-secret-for-test';
process.env.RAZORPAY_KEY_ID='rzp_test_example';
process.env.RAZORPAY_KEY_SECRET='synthetic-test-secret';
process.env.CHECKOUT_SHIPPING_PAISE='5000';
process.env.ENABLE_TEST_CHECKOUT='true';

function mockClient(url,key,options){
  const token=options?.global?.headers?.Authorization?.slice(7);
  const user=token==='user-a'?userA:token==='user-b'?userB:null;
  const service=key==='server-secret-for-test';
  return {auth:{getUser:async()=>({data:{user:user?{id:user}:null},error:user?null:{message:'invalid'}})},from(table){
    let mode='select',payload,filters=[],single=false,head=false;
    const query={
      select(fields,options){head=options?.head;return query;},eq(k,v){filters.push(row=>row[k]===v);return query;},in(k,values){filters.push(row=>values.includes(row[k]));return query;},gte(k,v){filters.push(row=>row[k]>=v);return query;},order(){return query;},limit(){return query;},single(){single=true;return query;},maybeSingle(){single=true;return query;},insert(value){mode='insert';payload=value;return query;},update(value){mode='update';payload=value;return query;},
      then(resolve,reject){return Promise.resolve().then(()=>{
        if(table==='products')return {data:products.filter(row=>filters.every(filter=>filter(row))),error:null};
        assert.equal(table,'checkout_orders');
        if(mode!=='select'&&!service)return {error:{code:'42501'}};
        if(mode==='insert'){
          if(orders.some(order=>order.user_id===payload.user_id&&order.request_id===payload.request_id))return {error:{code:'23505'}};
          const row={id:orderId,status:'creating',is_test:true,created_at:new Date().toISOString(),...payload};orders.push(row);return {data:{...row},error:null};
        }
        let result=orders.filter(row=>(service||row.user_id===user)&&filters.every(filter=>filter(row)));
        if(mode==='update')result.forEach(row=>Object.assign(row,payload));
        return {data:head?null:single?(result[0]?{...result[0]}:null):result.map(row=>({...row})),count:result.length,error:null};
      }).then(resolve,reject);}
    };return query;
  }};
}
const modules=new Map();
function load(filename){const full=path.resolve(filename);if(modules.has(full))return modules.get(full).exports;
 const module={exports:{}};modules.set(full,module);
 const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(name=>{
  if(name==='server-only')return {};
  if(name==='@supabase/supabase-js')return {createClient:mockClient};
  if(name.startsWith('@/'))return load(`src/${name.slice(2)}.ts`);
  return require(name);
 },module,module.exports);return module.exports;
}
global.fetch=async(url,options)=>{
 assert.ok(url.startsWith('https://api.razorpay.com/v1/'));
 assert.ok(options.headers.Authorization.startsWith('Basic '));
 if(options.method==='POST'){
  providerCalls++;if(providerFail)throw new Error('timeout');
  const body=JSON.parse(options.body);assert.equal(body.amount,5499);assert.equal(body.partial_payment,false);
  return Response.json({id:'order_test1',amount:body.amount,currency:'INR'});
 }
 const payment={id:'pay_test1',order_id:'order_test1',amount:wrongAmount?1:5499,currency:'INR',status:paymentStatus,captured:paymentStatus==='captured',amount_refunded:0};
 if(url.endsWith('/payments'))return Response.json({items:[payment]});
 if(url.includes('/payments/'))return Response.json(payment);
 return Response.json({id:'order_test1',amount:5499,amount_paid:paymentStatus==='captured'?5499:0,currency:'INR',status:paymentStatus==='captured'?'paid':'attempted'});
};
const shared=load('src/lib/checkout.ts');
const server=load('src/lib/checkout-server.ts');
const create=load('src/app/api/checkout/orders/route.ts').POST;
const verify=load('src/app/api/checkout/verify/route.ts').POST;
const quote=load('src/app/api/checkout/quote/route.ts').POST;
const details=load('src/app/api/checkout/orders/[id]/route.ts').GET;
const config=load('src/app/api/checkout/route.ts').GET;
function request(body,token='user-a'){return new Request('http://localhost/api/checkout',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});}
function reset(){orders=[];products=[{id:productId,name:'Test garment',size:'M',price:'4.99',status:'active',is_catalog_visible:true,inventory_quantity:1}];providerCalls=0;providerFail=false;paymentStatus='captured';wrongAmount=false;}
const payload=()=>({items:[{product_id:productId,quantity:1,price:0}],address,requestId,expectedTotalPaise:5499});

test('address, item and paise validation reject malformed or forged inputs',()=>{
 assert.equal(shared.toPaise('4.99'),499);assert.equal(shared.toPaise('0.29'),29);
 for(const price of ['NaN','-1','1.001','Infinity'])assert.throws(()=>shared.toPaise(price));
 assert.throws(()=>shared.parseCheckoutItems([{product_id:productId,quantity:1.5}]));
 assert.throws(()=>shared.parseCheckoutItems([{product_id:productId,quantity:1},{product_id:productId,quantity:1}]));
 assert.throws(()=>shared.parseAddress({...address,pincode:'000000'}));
 assert.throws(()=>shared.parseAddress({...address,country:'US'}));
 assert.equal(shared.parseAddress({...address,phone:'+919876543210'}).phone,address.phone);
});
test('quote uses server prices and denies hidden, sold or insufficient-stock items',async()=>{
 reset();let response=await quote(request(payload()));assert.equal(response.status,200);assert.equal((await response.json()).totalPaise,5499);
 for(const patch of [{status:'sold'},{is_catalog_visible:false},{inventory_quantity:0}]){reset();Object.assign(products[0],patch);assert.equal((await quote(request(payload()))).status,409);}
});
test('live keys and missing shipping fail closed; config never returns secrets',async()=>{
 reset();const oldKey=process.env.RAZORPAY_KEY_ID;process.env.RAZORPAY_KEY_ID='rzp_live_example';
 assert.equal((await create(request(payload()))).status,503);assert.equal(providerCalls,0);process.env.RAZORPAY_KEY_ID=oldKey;
 const fee=process.env.CHECKOUT_SHIPPING_PAISE;delete process.env.CHECKOUT_SHIPPING_PAISE;
 assert.equal(server.paymentConfig().enabled,false);process.env.CHECKOUT_SHIPPING_PAISE=fee;
 const output=await (await config()).json();assert.deepEqual(Object.keys(output).sort(),['enabled','mode','shippingPaise']);
});
test('checkout requires verified authentication and reviewed current totals',async()=>{
 reset();assert.equal((await create(request(payload(),null))).status,401);assert.equal((await create(request(payload(),'forged-token'))).status,401);
 assert.equal((await create(request({...payload(),expectedTotalPaise:1}))).status,409);assert.equal(orders.length,0);assert.equal(providerCalls,0);
});
test('duplicate retries create one provider order and another user cannot read or verify it',async()=>{
 reset();assert.equal((await create(request(payload()))).status,200);assert.equal((await create(request(payload()))).status,200);assert.equal(providerCalls,1);assert.equal(orders.length,1);
 assert.equal((await create(request({...payload(),address:{...address,city:'Pune'}}))).status,409);
 assert.equal((await verify(request({id:orderId},'user-b'))).status,404);
 const response=await details(new Request('http://localhost/api/checkout/orders/'+orderId,{headers:{Authorization:'Bearer user-b'}}),{params:Promise.resolve({id:orderId})});assert.equal(response.status,404);
});
test('provider timeout keeps an ambiguous order from being created twice',async()=>{
 reset();providerFail=true;assert.equal((await create(request(payload()))).status,502);
 assert.equal((await create(request(payload()))).status,409);assert.equal(providerCalls,1);assert.equal(orders[0].status,'creating');
});
test('forged signatures, authorized-only payments and amount mismatches never mark paid',async()=>{
 reset();await create(request(payload()));
 assert.equal((await verify(request({id:orderId,razorpay_order_id:'order_test1',razorpay_payment_id:'pay_test1',razorpay_signature:'0'.repeat(64)}))).status,400);
 assert.equal(orders[0].status,'pending');paymentStatus='authorized';
 assert.equal((await (await verify(request({id:orderId}))).json()).status,'pending');
 paymentStatus='captured';wrongAmount=true;assert.equal((await verify(request({id:orderId}))).status,409);assert.equal(orders[0].status,'pending');
});
test('captured payment confirms once, repeated verification is safe, and real stock stays unchanged',async()=>{
 reset();await create(request(payload()));const signature=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update('order_test1|pay_test1').digest('hex');
 assert.equal(server.validPaymentSignature('order_test1','pay_test1',signature,process.env.RAZORPAY_KEY_SECRET),true);
 assert.equal((await verify(request({id:orderId,razorpay_order_id:'order_test1',razorpay_payment_id:'pay_test1',razorpay_signature:signature}))).status,200);
 assert.equal(orders[0].status,'paid');const paidAt=orders[0].paid_at;
 assert.equal((await verify(request({id:orderId}))).status,200);assert.equal(orders[0].paid_at,paidAt);assert.equal(products[0].inventory_quantity,1);
});
