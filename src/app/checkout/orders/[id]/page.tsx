'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useShop} from '@/context/ShopContext';
import {checkoutFetch} from '@/lib/checkout-client';
import {formatINR,type QuoteLine} from '@/lib/checkout';
type Order={id:string;status:string;lines:QuoteLine[];subtotal_paise:number;shipping_paise:number;total_paise:number};
export default function CheckoutStatus(){
  const {id}=useParams<{id:string}>();const {user,authReady}=useShop();
  if(!authReady)return <p className="p-12 text-center">Loading…</p>;
  if(!user)return <p className="p-12 text-center"><Link href="/account" className="underline">Sign in to view this checkout</Link></p>;
  return <OrderStatus key={`${user.id}:${id}`} id={id} />;
}
function OrderStatus({id}:{id:string}){
  const [order,setOrder]=useState<Order|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [attempt,setAttempt]=useState(0);
  useEffect(()=>{let active=true;checkoutFetch(`/api/checkout/orders/${id}`).then(data=>{if(active)setOrder(data);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[id,attempt]);
  async function check(){if(busy)return;setBusy(true);setError('');try{const result=await checkoutFetch('/api/checkout/verify',{id});setOrder(previous=>previous?{...previous,status:result.status}:null);}catch(e){setError(e instanceof Error?e.message:'Could not check payment.');}finally{setBusy(false);}}
  return <div className="max-w-2xl mx-auto w-full p-6 sm:py-12 space-y-5"><h1 className="font-serif text-3xl">{order?.status==='paid'?'Test payment confirmed':'Your test checkout'}</h1><p className="text-sm text-slate-600">No real payment or shipment. Your bag and inventory remain unchanged.</p>{error&&<p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-800">{error} <button onClick={()=>{setError('');setOrder(null);setAttempt(n=>n+1);}} className="underline">Reload</button></p>}{!order&&!error?<p>Loading…</p>:order&&<section className="bg-white border border-sky-100 rounded-3xl p-6 space-y-4"><p className="text-xs text-slate-500 break-all">Reference: {order.id}</p><p role="status">{order.status==='paid'?'Your test payment has been verified.':order.status==='creating'?'Setup is incomplete. No payment window was confirmed. Contact the store before starting another checkout.':'Payment is not confirmed yet. If you completed payment or closed the window, check its status below.'}</p><ul className="space-y-2">{order.lines.map(line=><li key={line.product_id} className="flex justify-between gap-3 text-sm"><span>{line.name} × {line.quantity}</span><span>{formatINR(line.linePaise)}</span></li>)}</ul><p className="flex justify-between text-sm"><span>Shipping</span><span>{formatINR(order.shipping_paise)}</span></p><p className="flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>{formatINR(order.total_paise)}</span></p>{order.status!=='paid'&&<button disabled={busy} onClick={()=>void check()} className="rounded-full bg-slate-900 text-white px-6 py-3 disabled:opacity-50">{busy?'Checking…':'Check payment status'}</button>}</section>}<Link href="/checkout" className="inline-block text-sky-700 underline">Back to checkout</Link><Link href="/checkout/orders" className="block underline text-sm">Recent checkouts</Link></div>;
}
