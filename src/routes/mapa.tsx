import { useAuditoria } from "@/lib/use-auditoria";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, fmt } from "@/components/AppShell";
import { MapaGoogle, projetar, zoomPara } from "@/components/MapaGoogle";
import { empresa, empresas, score, temDados, voce } from "@/lib/data";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de concorrentes · Inove Local" },
      { name: "description", content: "Veja cada concorrente no mapa dentro do raio escolhido." },
      { property: "og:title", content: "Mapa de concorrentes · Inove Local" },
      { property: "og:description", content: "Concorrentes no Google Maps por raio de distância." },
    ],
  }),
  component: Mapa,
});

const raios = [1, 3, 5, 10, 15];

function Mapa() {
  useAuditoria();
  const [raioSel, setRaio] = useState<number | null>(null);
  const [sel, setSel] = useState("voce");
  if (!temDados()) return <AppShell title="Mapa de concorrentes" subtitle="" />;
  const raio = Math.min(raioSel ?? empresa.raio, empresa.raio);
  const zoom = zoomPara(raio);
  const visiveis = empresas.filter((e) => e.distancia <= raio);
  const e = empresas.find((x) => x.id === sel) ?? voce;
  const r = projetar(empresa.centro!.lat + raio / 111, empresa.centro!.lng, zoom);

  return (
    <AppShell title="Mapa de concorrentes" subtitle={`${visiveis.length - 1} concorrentes num raio de ${raio} km · dados do Google`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-2">Raio</span>
        {raios.filter((x) => x <= empresa.raio).map((x) => (
          <button key={x} onClick={() => setRaio(x)} className={`rounded-lg px-4 py-2 text-sm ring-1 transition-colors ${raio === x ? "bg-ink text-surface ring-ink" : "bg-surface ring-border hover:ring-ink/30"}`}>{x} km</button>
        ))}
        <span className="text-xs text-muted-foreground">Para um raio maior, faça nova auditoria.</span>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <section className="tile col-span-12 p-3 lg:col-span-8">
          <MapaGoogle zoom={zoom}>
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint/10 ring-2 ring-mint/50"
              style={{ left: "50%", top: "50%", width: `${(50 - r.y) * 2 * 0.75}%`, aspectRatio: "1" }} />
            {visiveis.map((x) => {
              const p = projetar(x.lat, x.lng, zoom);
              return (
                <button key={x.id} onClick={() => setSel(x.id)} title={x.nome} style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 font-mono text-xs font-semibold shadow ring-2 transition ${x.voce ? "z-10 bg-mint text-ink ring-surface" : sel === x.id ? "z-10 bg-ink text-surface ring-mint" : "bg-surface text-ink ring-ink/20"}`}>
                  {score(x)}
                </button>
              );
            })}
          </MapaGoogle>
        </section>
        <section className="tile col-span-12 lg:col-span-4">
          <span className="eyebrow">{e.voce ? "Sua empresa" : "Concorrente"}</span>
          <h2 className="mt-3 font-display text-2xl font-semibold">{e.nome}</h2>
          <p className="text-sm text-muted-foreground">{fmt(e.distancia, 1)} km · {e.site ? "tem site" : "sem site"}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 font-mono">
            {[["Nota", e.nota ? `★ ${fmt(e.nota, 1)}` : "—"], ["Avaliações", e.avaliacoes], ["Fotos*", e.fotos], ["Categorias", e.categorias]].map(([k, v]) => (
              <div key={k}><dt className="eyebrow font-sans">{k}</dt><dd className="mt-1 text-xl">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-6 rounded-lg bg-ink/5 p-4">
            <p className="eyebrow">Score</p>
            <p className="font-display text-4xl font-semibold">{score(e)}<span className="text-lg text-muted-foreground">/100</span></p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">*O Google informa no máximo 10 fotos por empresa.</p>
          <Link to="/radar" className="mt-4 inline-block text-sm font-medium text-mint">Ver análise →</Link>
        </section>
      </div>
    </AppShell>
  );
}
