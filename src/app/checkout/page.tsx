'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { checkoutFetch, checkoutRequestId } from '@/lib/checkout-client';
import { formatINR, parseAddress, type CheckoutQuote, type ShippingAddress } from '@/lib/checkout';

type PaymentCallback = { razorpay_payment_id:string; razorpay_order_id:string; razorpay_signature:string };
type RazorpayOptions = { key:string; amount:number; currency:string; order_id:string; name:string; description:string; prefill:{name:string;email?:string;contact:string}; theme:{color:string}; handler:(result:PaymentCallback)=>void; modal:{ondismiss:()=>void}; retry:{enabled:boolean} };
declare global { interface Window { Razorpay?: new(options:RazorpayOptions)=>{open:()=>void;on:(event:string,callback:()=>void)=>void} } }
const emptyAddress: ShippingAddress = {name:'',phone:'',line1:'',line2:'',city:'',state:'',pincode:'',country:'IN'};
const fields = [
  ['name','Full name','name',100], ['phone','Mobile number','tel',16], ['line1','Address line 1','address-line1',200],
  ['line2','Address line 2 (optional)','address-line2',200], ['city','City','address-level2',100], ['state','State / Union Territory','address-level1',100], ['pincode','PIN code','postal-code',6],
] as const;

export default function CheckoutPage() {
  const { user } = useShop();
  return <CheckoutSession key={user?.id || 'guest'} />;
}

function CheckoutSession() {
  const {user,ready,items} = useShop();
  const router = useRouter();
  const [address,setAddress] = useState<ShippingAddress>(emptyAddress);
  const [config,setConfig] = useState<{enabled:boolean;mode:string}|null>(null);
  const [reviewed,setReviewed] = useState<{cartKey:string;quote:CheckoutQuote}|null>(null);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [scriptReady,setScriptReady] = useState(false);
  const locked=useRef(false);
  const cart=items.filter(item=>item.kind==='cart').map(({product_id,quantity})=>({product_id,quantity}));
  const cartKey=JSON.stringify(cart);
  const quote=reviewed?.cartKey===cartKey?reviewed.quote:null;
  useEffect(()=>{let active=true;fetch('/api/checkout',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{if(active)setConfig(data);}).catch(()=>{if(active)setError('Could not load checkout. Please refresh this page.');});return()=>{active=false;};},[]);

  async function review(event:React.FormEvent) {
    event.preventDefault();if(locked.current)return;locked.current=true;setBusy(true);setError('');setReviewed(null);
    try { parseAddress(address);setReviewed({cartKey,quote:await checkoutFetch('/api/checkout/quote',{items:cart})}); }
    catch(e){setError(e instanceof Error?e.message:'Could not review your order.');}
    finally{locked.current=false;setBusy(false);}
  }
  async function pay() {
    if(locked.current||!quote||quote.totalPaise===null||!user||!window.Razorpay)return;
    locked.current=true;setBusy(true);setError('');
    try {
      const delivery=parseAddress(address);
      const payload={items:cart,address:delivery,expectedTotalPaise:quote.totalPaise};
      const requestId=await checkoutRequestId(user.id,payload);
      const order=await checkoutFetch('/api/checkout/orders',{...payload,requestId});
      const orderPage=`/checkout/orders/${order.id}`;
      if(order.status==='paid'){router.push(orderPage);return;}
      let confirming=false;
      const gateway=new window.Razorpay({key:order.keyId,amount:order.totalPaise,currency:'INR',order_id:order.razorpayOrderId,name:'SECOND JLITCH',description:'Test checkout — no shipment',prefill:{name:delivery.name,email:user.email,contact:`+91${delivery.phone}`},theme:{color:'#0284c7'},retry:{enabled:true},
        handler: async result=>{
          confirming=true;
          try { await checkoutFetch('/api/checkout/verify',{id:order.id,...result}); }
          catch { /* Order page checks authoritative status again, including lost callbacks. */ }
          finally{locked.current=false;setBusy(false);router.push(orderPage);}
        },
        modal:{ondismiss:()=>{if(!confirming){locked.current=false;setBusy(false);router.push(orderPage);}}},
      });
      gateway.on('payment.failed',()=>setError('That payment attempt failed. You can retry in the payment window or close it and check your order status.'));
      gateway.open();
    } catch(e){setError(e instanceof Error?e.message:'Could not open payment.');locked.current=false;setBusy(false);}
  }

  if(!ready)return <div className="p-16 text-center" role="status">Loading checkout…</div>;
  if(!user)return <div className="max-w-lg mx-auto p-12 text-center space-y-4"><h1 className="font-serif text-3xl">Sign in to checkout</h1><p>Your bag will be saved when you sign in.</p><Link href="/account" className="inline-block rounded-full bg-slate-900 text-white px-6 py-3">Sign in / create account</Link><p><Link href="/cart" className="text-sky-700 underline">Back to bag</Link></p></div>;
  if(!cart.length)return <div className="p-16 text-center"><h1 className="font-serif text-3xl">Your bag is empty</h1><Link href="/products" className="block mt-4 text-sky-700 underline">Explore the collection</Link><Link href="/checkout/orders" className="block mt-4 underline">Recent checkouts</Link></div>;
  return <div className="max-w-5xl w-full mx-auto px-4 py-10 space-y-6">
    {config?.enabled&&<Script src="https://checkout.razorpay.com/v1/checkout.js" onReady={()=>setScriptReady(true)} onError={()=>setError('The payment window could not load. Please refresh or try another browser.')} />}
    <div><Link href="/cart" className="text-sm text-sky-700">← Back to bag</Link><h1 className="font-serif text-4xl mt-3">Checkout</h1></div>
    <p role="status" className="rounded-2xl bg-sky-50 border border-sky-200 p-4 text-sm">{config?.enabled?'Test checkout only. No real money is collected and no shipment will be created.':'Checkout preview. Payments are not available yet.'}</p>
    {error&&<p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">{error}</p>}
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <form onSubmit={review} className="bg-white border border-sky-100 rounded-3xl p-6 space-y-4">
        <h2 className="font-serif text-2xl">Delivery address</h2>
        <fieldset disabled={busy} className="grid sm:grid-cols-2 gap-4 disabled:opacity-70">
          {fields.map(([name,label,autoComplete,maxLength])=><label key={name} className={`text-sm space-y-1 ${['name','line1','line2'].includes(name)?'sm:col-span-2':''}`}><span>{label}</span><input name={name} autoComplete={autoComplete} required={name!=='line2'} maxLength={maxLength} type={name==='phone'?'tel':'text'} inputMode={['phone','pincode'].includes(name)?'numeric':undefined} value={address[name]} onChange={e=>{setAddress(previous=>({...previous,[name]:e.target.value}));setReviewed(null);}} className="block w-full rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400" /></label>)}
          <p className="sm:col-span-2 text-xs text-slate-500">India · Prepaid only</p>
        </fieldset>
        <button disabled={busy} className="rounded-full bg-slate-900 text-white px-6 py-3 w-full disabled:opacity-50">{busy?'Please wait…':'Review order'}</button>
      </form>
      <section className="bg-white rounded-3xl border border-sky-100 p-6 space-y-5">
        <h2 className="font-serif text-2xl">Order summary</h2>
        {!quote?<p className="text-sm text-slate-600">Enter your address and review your order to check current prices and availability.</p>:<>
          <ul className="space-y-3">{quote.lines.map(line=><li key={line.product_id} className="flex justify-between gap-3 text-sm"><span>{line.name}{line.size?` · ${line.size}`:''} × {line.quantity}</span><span className="whitespace-nowrap">{formatINR(line.linePaise)}</span></li>)}</ul>
          <dl className="space-y-3 border-t pt-4 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(quote.subtotalPaise)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{quote.shippingPaise===null?'Not yet available':formatINR(quote.shippingPaise)}</dd></div><div className="flex justify-between font-semibold text-lg"><dt>Total</dt><dd>{quote.totalPaise===null?'—':formatINR(quote.totalPaise)}</dd></div></dl>
          <button type="button" disabled={busy||!config?.enabled||!scriptReady||quote.totalPaise===null} onClick={()=>void pay()} className="rounded-full bg-sky-600 text-white w-full px-6 py-3 disabled:opacity-40">{busy?'Processing…':config?.enabled?'Pay in test mode':'Payments coming soon'}</button>
        </>}
        <p className="text-xs text-slate-500">Items are not reserved during this test checkout. Your real bag and inventory remain unchanged.</p>
        <Link href="/checkout/orders" className="block text-sm text-sky-700 underline">View recent checkouts</Link>
      </section>
    </div>
  </div>;
}
