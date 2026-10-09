import { useEffect, useState, type ReactNode } from "react";
import { empresa, empresas } from "@/lib/data";

export const zoomPara = (raio: number) => (raio <= 1 ? 15 : raio <= 3 ? 13 : raio <= 6 ? 12 : raio <= 10 ? 11 : 10);
const W = 640, H = 480;

/** Posição (%) de um ponto sobre o mapa estático centrado na empresa. */
export function projetar(lat: number, lng: number, zoom: number) {
  const c = empresa.centro ?? { lat, lng };
  const escala = 256 * 2 ** zoom;
  const px = (l: number) => ((l + 180) / 360) * escala;
  const py = (la: number) => { const s = Math.sin((la * Math.PI) / 180); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * escala; };
  return { x: 50 + ((px(lng) - px(c.lng)) / W) * 100, y: 50 + ((py(lat) - py(c.lat)) / H) * 100 };
}

export function MapaGoogle({ zoom, children, className = "" }: { zoom: number; children?: ReactNode; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const c = empresa.centro;
    if (!c || window.location.hostname.endsWith("lovableproject.com")) return setUrl(null);
    const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
    const ch = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];
    const estilo = "&style=feature:poi|visibility:off&style=saturation:-80";
    setUrl(`https://maps.googleapis.com/maps/api/staticmap?center=${c.lat},${c.lng}&zoom=${zoom}&size=${W}x${H}&scale=2${estilo}&key=${key}&channel=${ch}`);
  }, [zoom, empresas.length, empresa.centro?.lat]);
  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-ink/5 ring-1 ring-border ${className}`}>
      {url ? (
        <img src={url} crossOrigin="anonymous" referrerPolicy="strict-origin-when-cross-origin" alt={`Mapa de ${empresa.cidade}`} className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">Mapa disponível no link publicado</div>
      )}
      {children}
    </div>
  );
}
