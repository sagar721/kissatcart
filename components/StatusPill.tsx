export function StatusPill({ status }: { status: string }) {
  const tone = ({
    pending:'bg-amber-100 text-amber-800', confirmed:'bg-blue-100 text-blue-800',
    processing:'bg-blue-100 text-blue-800', packed:'bg-indigo-100 text-indigo-800',
    shipped:'bg-indigo-100 text-indigo-800', out_for_delivery:'bg-purple-100 text-purple-800',
    delivered:'bg-emerald-100 text-emerald-800', cancelled:'bg-red-100 text-red-800',
    return_requested:'bg-orange-100 text-orange-800', returned:'bg-orange-100 text-orange-800',
    refunded:'bg-gray-100 text-gray-800'
  } as any)[status] ?? 'bg-gray-100 text-gray-800';
  return <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-widest ${tone}`}>{status.replace('_',' ')}</span>;
}
