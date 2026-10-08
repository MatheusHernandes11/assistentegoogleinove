import { useAuditoria } from "@/lib/use-auditoria";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, fmt } from "@/components/AppShell";
import { empresa, empresas, score } from "@/lib/data";
import mapa from "@/assets/mapa-londrina.jpg";

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

const raios = [1, 3, 5, 10];

function Mapa() {
  useAuditoria();
  const [raio, setRaio] = useState(5);
  const [sel, setSel] = useState("b");
  const visiveis = empresas.filter((e) => e.distancia <= raio);
  const e = empresas.find((x) => x.id === sel) ?? empresas[0]!;

  return (
    <AppShell title="Mapa de concorrentes" subtitle={`${visiveis.length} empresas num raio de ${raio} km de ${empresa.endereco}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-2">Raio</span>
        {raios.map((r) => (
          <button key={r} onClick={() => setRaio(r)} className={`rounded-lg px-4 py-2 text-sm ring-1 transition-colors ${raio === r ? "bg-ink text-surface ring-ink" : "bg-surface ring-border hover:ring-ink/30"}`}>{r} km</button>
        ))}
        <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
          Personalizado
          <input type="range" min={1} max={15} value={raio} onChange={(ev) => setRaio(+ev.target.value)} className="accent-mint" />
        </label>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <section className="tile col-span-12 p-3 lg:col-span-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img src={mapa} alt="Mapa de Londrina" className="absolute inset-0 size-full object-cover opacity-80" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint/10 ring-2 ring-mint/50 transition-all" style={{ width: `${Math.min(raio / 10, 1.4) * 80}%`, aspectRatio: "1" }} />
            {visiveis.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} style={{ left: `${x.x}%`, top: `${x.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 font-mono text-xs font-semibold shadow ring-2 transition ${x.voce ? "bg-mint text-ink ring-surface" : sel === x.id ? "bg-ink text-surface ring-mint" : "bg-surface text-ink ring-ink/20"}`}>
                {score(x)}
              </button>
            ))}
          </div>
        </section>
        <section className="tile col-span-12 lg:col-span-4">
          <span className="eyebrow">{e.voce ? "Sua empresa" : "Concorrente"}</span>
          <h2 className="mt-3 font-display text-2xl font-semibold">{e.nome}</h2>
          <p className="text-sm text-muted-foreground">{empresa.segmento} · {fmt(e.distancia, 1)} km</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 font-mono">
            {[["Nota", `★ ${fmt(e.nota, 1)}`], ["Avaliações", e.avaliacoes], ["Fotos", e.fotos], ["Serviços", e.servicos]].map(([k, v]) => (
              <div key={k}><dt className="eyebrow font-sans">{k}</dt><dd className="mt-1 text-xl">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-6 rounded-lg bg-ink/5 p-4">
            <p className="eyebrow">Score</p>
            <p className="font-display text-4xl font-semibold">{score(e)}<span className="text-lg text-muted-foreground">/100</span></p>
          </div>
          <Link to="/radar" className="mt-4 inline-block text-sm font-medium text-mint">Ver análise →</Link>
        </section>
      </div>
    </AppShell>
  );
}
