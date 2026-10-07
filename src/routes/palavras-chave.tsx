import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, fmt } from "@/components/AppShell";
import { pesquisarKeywords } from "@/lib/data";

export const Route = createFileRoute("/palavras-chave")({
  head: () => ({
    meta: [
      { title: "Pesquisa de palavras-chave · Inove Local" },
      { name: "description", content: "Volume, CPC e concorrência das buscas locais." },
      { property: "og:title", content: "Pesquisa de palavras-chave · Inove Local" },
      { property: "og:description", content: "Descubra o que seus clientes pesquisam no Google." },
    ],
  }),
  component: Keywords,
});

function Keywords() {
  const [q, setQ] = useState("dentista londrina");
  const [busca, setBusca] = useState(q);
  const rows = pesquisarKeywords(busca);
  const conc = { Alta: "text-coral", Média: "text-amber", Baixa: "text-mint" };
  const total = rows.reduce((s, r) => s + r.volume, 0);
  const oport = rows.filter((r) => r.concorrencia !== "Alta" && (r.posicao === null || r.posicao > 3));

  return (
    <AppShell title="Pesquisa de palavras-chave" subtitle="Volumes mensais estimados na sua cidade">
      <form onSubmit={(e) => { e.preventDefault(); setBusca(q); }} className="tile mb-3 flex gap-3 p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ex: dentista londrina" className="flex-1 rounded-lg bg-paper px-4 py-3 outline-none ring-1 ring-border focus:ring-mint" />
        <button className="rounded-lg bg-ink px-6 text-sm font-medium text-surface hover:bg-ink/90">Pesquisar</button>
      </form>
      <div className="grid grid-cols-12 gap-3">
        <section className="tile col-span-12 lg:col-span-8">
          <span className="eyebrow">Resultados para "{busca}"</span>
          <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-border">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr>{["Palavra", "Volume", "CPC", "Concorrência", "Sua posição"].map((h, i) => <th key={h} className={`px-4 py-3 font-medium ${i ? "text-right" : ""}`}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {rows.map((k) => (
                  <tr key={k.termo}>
                    <td className="px-4 py-3 font-sans">{k.termo}</td>
                    <td className="px-4 py-3 text-right">{fmt(k.volume)}</td>
                    <td className="px-4 py-3 text-right">R$ {fmt(k.cpc, 2)}</td>
                    <td className={`px-4 py-3 text-right ${conc[k.concorrencia]}`}>{k.concorrencia}</td>
                    <td className="px-4 py-3 text-right font-semibold">{k.posicao ?? "Fora"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="col-span-12 flex flex-col gap-3 lg:col-span-4">
          <section className="tile">
            <span className="eyebrow">Buscas por mês</span>
            <p className="mt-4 font-display text-5xl font-semibold">{fmt(total)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Pessoas procurando esse serviço na região.</p>
          </section>
          <section className="tile">
            <span className="eyebrow">Oportunidades</span>
            <ul className="mt-4 space-y-3 text-sm">
              {oport.map((o) => <li key={o.termo} className="flex justify-between gap-2"><span>{o.termo}</span><span className="font-mono text-mint">{fmt(o.volume)}</span></li>)}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
