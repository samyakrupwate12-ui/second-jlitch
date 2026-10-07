// Runs the real provider and account forms against a simulated Auth/Data API.
// Live PostgreSQL owner isolation is verified separately with rollback-only SQL.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const React = require('react');
const { act } = React;

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/account' });
for (const key of ['window', 'document', 'localStorage', 'FormData', 'HTMLElement']) global[key] = dom.window[key];
global.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = require('react-dom/client');
const id = 'ff1e10de-36f1-4fb6-9d83-23a25d9a231e';
const userA = { id: '00000000-0000-4000-8000-000000000001', email: 'shopper@example.test', user_metadata: { full_name: 'Shopper' } };
const userB = { ...userA, id: '00000000-0000-4000-8000-000000000002', email: 'other@example.test' };
let currentUser = null;
let rows = [];
let failWrites = false;
let stock = 1;
let resetRedirect;
let signupRedirect;
const listeners = new Set();
function emit(event, user) {
  currentUser = user;
  for (const callback of listeners) callback(event, user ? { user } : null);
}
const product = () => ({ id, name:'White dress', slug:'white-dress', price:1349, status:'active', is_catalog_visible:true, inventory_quantity:stock, product_images:[] });
const supabase = {
  auth: {
    onAuthStateChange(callback) { listeners.add(callback); queueMicrotask(() => { if (listeners.has(callback)) callback('INITIAL_SESSION', currentUser ? {user:currentUser} : null); }); return {data:{subscription:{unsubscribe:()=>listeners.delete(callback)}}}; },
    async signInWithPassword({email}) { if (email !== userA.email) return {error:new Error('Invalid login credentials')}; emit('SIGNED_IN',userA); return {data:{user:userA},error:null}; },
    async signUp({options}) { signupRedirect=options.emailRedirectTo; return {data:{session:null,user:userA},error:null}; },
    async resetPasswordForEmail(email,options) { resetRedirect=options.redirectTo; return {data:{},error:null}; },
    async updateUser(values) { if(values.data) emit('USER_UPDATED',{...currentUser,user_metadata:values.data}); return {data:{user:currentUser},error:null}; },
    async signOut() { emit('SIGNED_OUT',null); return {error:null}; }
  },
  from(table) {
    let mode='select', payload, options={}, filters=[];
    const query = {
      select(){return query;}, in(){return query;},
      eq(key,value){filters.push([key,value]);return query;},
      upsert(data,opts={}){mode='upsert';payload=data;options=opts;return query;},
      delete(){mode='delete';return query;},
      async maybeSingle(){return {data:product(),error:null};},
      then(resolve,reject) {
        return Promise.resolve().then(()=>{
          if(table==='products') return {data:[product()],error:null};
          assert.equal(table,'customer_items');
          if(failWrites && mode!=='select') return {data:null,error:{message:'Network unavailable'}};
          const match=row=>filters.every(([key,value])=>row[key]===value);
          if(mode==='delete') rows=rows.filter(row=>!match(row));
          if(mode==='upsert') for(const item of Array.isArray(payload)?payload:[payload]) {
            const idx=rows.findIndex(row=>row.user_id===item.user_id && row.product_id===item.product_id && row.kind===item.kind);
            if(idx<0) rows.push({...item}); else if(!options.ignoreDuplicates) rows[idx]={...item};
          }
          return {data:rows.filter(match).map(row=>({...row})),error:null};
        }).then(resolve,reject);
      }
    };return query;
  }
};
const modules=new Map();
function load(filename) {
  const full=path.resolve(filename);
  if(modules.has(full)) return modules.get(full).exports;
  const module={exports:{}}; modules.set(full,module);
  const output=ts.transpileModule(fs.readFileSync(full,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  function mockedRequire(name) {
    if(name==='@/lib/supabase') return {supabase};
    if(name==='next/navigation') return {usePathname:()=>window.location.pathname};
    if(name==='next/link') return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
    if(name.startsWith('@/')) { const base=path.join('src',name.slice(2)); return load(fs.existsSync(base+'.tsx')?base+'.tsx':base+'.ts'); }
    return require(name);
  }
  new Function('require','module','exports',output)(mockedRequire,module,module.exports);
  return module.exports;
}
const {ShopProvider,useShop}=load('src/context/ShopContext.tsx');
const Account=load('src/app/account/page.tsx').default;
let shop;
function Probe(){shop=useShop();return null;}
let root;
async function render(){await act(async()=>{if(!root)root=createRoot(document.getElementById('root'));root.render(React.createElement(ShopProvider,null,React.createElement(Probe),React.createElement(Account)));});}
async function change(fn){await act(async()=>{await fn();});}
async function remount(){await change(()=>root.unmount());root=null;await render();}
function button(text){const result=[...document.querySelectorAll('button')].find(el=>el.textContent===text);assert.ok(result,`Missing button ${text}`);return result;}
async function click(text){await change(()=>button(text).click());}
async function submit(values){await change(()=>{for(const [name,value] of Object.entries(values))document.querySelector(`[name="${name}"]`).value=value;document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));});}

test('guest persistence, stock cap, sign-in import, server failures and sign-out isolation',async()=>{
 await render();assert.equal(shop.ready,true);assert.equal(shop.cartCount,0);
 await change(()=>shop.save(id,'cart',1));await change(()=>shop.save(id,'wishlist',1));
 assert.equal(shop.cartCount,1);assert.equal(shop.items.length,2);
 await remount();assert.equal(shop.cartCount,1);assert.equal(shop.items.length,2);
 await change(()=>shop.save(id,'cart',2));assert.equal(shop.cartCount,1);assert.match(shop.error,/Only 1/);
 await submit({email:userA.email,password:'test-password-only'});
 assert.equal(shop.user.id,userA.id);assert.equal(rows.length,2);assert.equal(localStorage.getItem('second-jlitch:guest:v1'),null);
 await remount();assert.equal(shop.cartCount,1);
 failWrites=true;await change(()=>shop.save(id,'cart',0));assert.equal(shop.cartCount,1);assert.match(shop.error,/Couldn’t save/);failWrites=false;
 await change(()=>shop.save(id,'cart',0));assert.equal(shop.cartCount,0);
 await click('Sign out');assert.equal(shop.user,null);assert.equal(shop.items.length,0);
 await change(()=>emit('SIGNED_IN',userB));assert.equal(shop.items.length,0);
 await click('Sign out');await change(()=>root.unmount());root=null;
});

test('signup confirmation, reset link, recovery after reload, profile update and invalid login',async()=>{
 await render();
 await submit({email:'wrong@example.test',password:'test-password-only'});assert.match(document.body.textContent,/Invalid login credentials/);
 await click('Create an account');await submit({name:'Customer',email:userA.email,password:'test-password-only'});
 assert.match(document.body.textContent,/Check your email/);assert.equal(signupRedirect,'http://localhost/account');
 await click('Forgot password?');await submit({email:userA.email});assert.equal(resetRedirect,'http://localhost/account?reset=1');
 window.history.replaceState({},'','/account?reset=1');await change(()=>emit('PASSWORD_RECOVERY',userA));await remount();
 assert.match(document.body.textContent,/Choose a new password/);
 await submit({password:'changed-test-password'});assert.equal(window.location.search,'');assert.equal(shop.recovery,false);
 await submit({name:'Updated Customer'});assert.equal(shop.user.user_metadata.full_name,'Updated Customer');
 await click('Sign out');assert.match(document.body.textContent,/Welcome back/);
 await change(()=>root.unmount());root=null;
});
