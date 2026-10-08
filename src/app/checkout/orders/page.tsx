'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useShop} from '@/context/ShopContext';
import {checkoutFetch} from '@/lib/checkout-client';
import {formatINR} from '@/lib/checkout';
export default function RecentCheckouts(){
  const {user,authReady}=useShop();
  if(!authReady)return <p className="p-12 text-center">Loading…</p>;
  if(!user)return <p className="p-12 text-center"><Link href="/account" className="underline">Sign in to view your checkouts</Link></p>;
  return <OrdersList key={user.id} />;
}
function OrdersList(){
  const [orders,setOrders]=useState<{id:string;status:string;total_paise:number;created_at:string}[]>([]);
  const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [attempt,setAttempt]=useState(0);
  useEffect(()=>{let active=true;checkoutFetch('/api/checkout/orders').then(data=>{if(active)setOrders(data.orders);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[attempt]);
  return <div className="max-w-3xl w-full mx-auto p-6 space-y-5"><h1 className="font-serif text-3xl">Recent test checkouts</h1><p className="text-sm text-slate-600">Test checkouts do not create real shipments.</p>{error?<p role="alert">{error} <button onClick={()=>{setError('');setLoading(true);setAttempt(n=>n+1);}} className="underline">Retry</button></p>:loading?<p>Loading…</p>:orders.length?orders.map(order=><Link key={order.id} href={`/checkout/orders/${order.id}`} className="block rounded-2xl bg-white border border-sky-100 p-5"><span className="font-medium">{formatINR(order.total_paise)} · {order.status==='paid'?'Test payment confirmed':order.status==='creating'?'Setup incomplete':'Payment pending'}</span><span className="block text-xs text-slate-500 mt-2">{new Date(order.created_at).toLocaleString('en-IN')} · {order.id.slice(0,8)}</span></Link>):<p>No checkouts yet.</p>}<Link href="/checkout" className="block underline text-sky-700">Back to checkout</Link></div>;
}
