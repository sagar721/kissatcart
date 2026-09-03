import { ContentPage } from '@/components/ContentPage';
export const metadata = { title: 'Size guide' };
const rows = [
  ['S',  '34–36', '28–30', '38–40'],
  ['M',  '38–40', '32–34', '40–42'],
  ['L',  '40–42', '34–36', '42–44'],
  ['XL', '42–44', '36–38', '44–46'],
  ['XXL','44–46', '38–40', '46–48']
];
export default function Page() {
  return (
    <ContentPage eyebrow="Fit made simple" title="Size guide">
      <p>All measurements are body measurements in inches. Our tees run oversized — size down for a boxy-but-fitted look, or stay on-size for the intended drop-shoulder silhouette.</p>
      <h2>Tops (Shirts, T-Shirts, Hoodies)</h2>
      <table className="w-full border-collapse text-sm my-4">
        <thead><tr className="bg-ground"><th className="text-left px-3 py-2">Size</th><th className="text-left px-3 py-2">Chest</th><th className="text-left px-3 py-2">Waist</th><th className="text-left px-3 py-2">Shoulder-to-shoulder + sleeve</th></tr></thead>
        <tbody>{rows.map(r => (<tr key={r[0]} className="border-t border-line"><td className="px-3 py-2 font-semibold">{r[0]}</td><td className="px-3 py-2">{r[1]}</td><td className="px-3 py-2">{r[2]}</td><td className="px-3 py-2">{r[3]}</td></tr>))}</tbody>
      </table>
      <h2>Bottoms (Jeans, Cargos)</h2>
      <p>We size by waist in inches (28, 30, 32, 34, 36, 38). Inseam is 32&ldquo; on regular fits; hem it locally if you&rsquo;re under 5&rsquo;8&rdquo;.</p>
      <h2>How to measure</h2>
      <p><strong>Chest:</strong> around the fullest part, arms relaxed. <strong>Waist:</strong> around your natural waistline. Take a favourite tee, lay it flat, and match it to the chest column.</p>
    </ContentPage>
  );
}
