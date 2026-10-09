import { useAuditoria } from "@/lib/use-auditoria";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, fmt } from "@/components/AppShell";
import { empresas, ranking, score, temDados, voce, type Empresa } from "@/lib/data";

export const Route = createFileRoute("/radar")({
  head: () => ({
    meta: [
      { title: "Radar de concorrência · Inove Local" },
      { name: "description", content: "Compare sua empresa lado a lado com os concorrentes." },
      { property: "og:title", content: "Radar de concorrência · Inove Local" },
      { property: "og:description", content: "Comparação detalhada e análise automática de concorrentes." },
    ],
  }),
  component: Radar,
});

const eixosBase: { k: keyof Empresa; label: string }[] = [
  { k: "nota", label: "Nota" }, { k: "avaliacoes", label: "Avaliações" }, { k: "fotos", label: "Fotos" }, { k: "categorias", label: "Categorias" },
];
let eixos: { k: keyof Empresa; label: string; max: number }[] = [];

function pts(e: Empresa) {
  return eixos.map((a, i) => {
    const v = Math.min(1, (e[a.k] as number) / a.max);
    const ang = (Math.PI * 2 * i) / eixos.length - Math.PI / 2;
    return `${100 + Math.cos(ang) * 80 * v},${100 + Math.sin(ang) * 80 * v}`;
  }).join(" ");
}

function Radar() {
  useAuditoria();
  const outros = ranking().filter((e) => !e.voce);
  const [idsSel, setIds] = useState<string[]>([]);
  if (!temDados() || outros.length === 0) return <AppShell title="Radar de concorrência" subtitle="" />;
  eixos = eixosBase.map((a) => ({ ...a, max: a.k === "nota" ? 5 : Math.max(1, ...empresas.map((e) => e[a.k] as number)) }));
  const ids = [idsSel[0] ?? outros[0]!.id, idsSel[1] ?? (outros[1] ?? outros[0]!).id];
  const sel = ids.map((id) => empresas.find((e) => e.id === id)!);
  const A = sel[0]!;
  const linhas: [string, (e: Empresa) => string][] = [
    ["Nota", (e) => fmt(e.nota, 1)], ["Avaliações", (e) => String(e.avaliacoes)], ["Fotos", (e) => String(e.fotos)],
    ["Categorias", (e) => String(e.categorias)], ["Site", (e) => (e.site ? "✓" : "—")], ["Presença local", (e) => String(score(e))],
  ];

  return (
    <AppShell title="Radar de concorrência" subtitle="Compare sua empresa com até dois concorrentes">
      <div className="grid grid-cols-12 gap-3">
        <section className="tile col-span-12 lg:col-span-5">
          <span className="eyebrow">Radar</span>
          <svg viewBox="0 0 200 200" className="mx-auto mt-4 w-full max-w-sm">
            {[0.25, 0.5, 0.75, 1].map((r) => <polygon key={r} points={pts({ ...voce, nota: 5 * r, avaliacoes: 842 * r, fotos: 312 * r, categorias: 4 * r })} className="fill-none stroke-ink/10" />)}
            {eixos.map((a, i) => { const ang = (Math.PI * 2 * i) / eixos.length - Math.PI / 2; return <text key={a.label} x={100 + Math.cos(ang) * 94} y={100 + Math.sin(ang) * 94} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[7px]">{a.label}</text>; })}
            <polygon points={pts(A)} className="fill-coral/15 stroke-coral" />
            <polygon points={pts(voce)} className="fill-mint/25 stroke-mint" strokeWidth={1.5} />
          </svg>
          <div className="mt-2 flex justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-mint" />Você</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-coral" />{A.nome}</span>
          </div>
        </section>
        <section className="tile col-span-12 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-2">Comparar com</span>
            {[0, 1].map((i) => (
              <select key={i} value={ids[i]} onChange={(e) => setIds(ids.map((x, j) => (j === i ? e.target.value : x)))} className="rounded-lg bg-paper px-3 py-2 text-sm ring-1 ring-border">
                {outros.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-border">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr><th className="px-4 py-3 text-left font-medium">Indicador</th><th className="px-4 py-3 text-right font-medium text-mint">Sua empresa</th>{sel.map((s) => <th key={s.id} className="px-4 py-3 text-right font-medium">{s.nome}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {linhas.map(([l, f]) => (
                  <tr key={l}><td className="px-4 py-3 font-sans">{l}</td><td className="bg-mint/5 px-4 py-3 text-right font-semibold">{f(voce)}</td>{sel.map((s) => <td key={s.id} className="px-4 py-3 text-right">{f(s)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="col-span-12 rounded-[14px] bg-ink p-6 text-surface">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-surface/60">Análise automática</span>
          <p className="mt-4 max-w-3xl font-display text-xl leading-snug">
            {A.nome} possui {Math.max(0, A.avaliacoes - voce.avaliacoes)} avaliações a mais que sua empresa e {Math.max(0, A.fotos - voce.fotos)} fotos a mais.
            {A.nota > voce.nota ? ` Porém, sua nota média é apenas ${fmt(A.nota - voce.nota, 1)} ponto inferior.` : " E sua nota é igual ou superior."}
          </p>
          <p className="mt-3 text-mint">Oportunidade: aumentar volume de avaliações mantendo a nota atual.</p>
        </section>
      </div>
    </AppShell>
  );
}
