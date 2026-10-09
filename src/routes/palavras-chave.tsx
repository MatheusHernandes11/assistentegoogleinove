import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell, fmt } from "@/components/AppShell";
import { empresa, sugerirTermos, temDados, voce } from "@/lib/data";
import { rankingPalavra } from "@/lib/places.functions";
import { useAuditoria } from "@/lib/use-auditoria";

export const Route = createFileRoute("/palavras-chave")({
  head: () => ({
    meta: [
      { title: "Ranking por palavra-chave · Inove Local" },
      { name: "description", content: "Veja quem aparece no Google Maps para cada busca da sua região." },
      { property: "og:title", content: "Ranking por palavra-chave · Inove Local" },
      { property: "og:description", content: "Quem aparece primeiro no Google para o que seus clientes procuram." },
    ],
  }),
  component: Keywords,
});

type Res = { placeId: string; nome: string; nota: number; avaliacoes: number }[];

function Keywords() {
  useAuditoria();
  const buscar = useServerFn(rankingPalavra);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<{ termo: string; lista: Res } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  if (!temDados()) return <AppShell title="Ranking por palavra-chave" subtitle="" />;

  async function pesquisar(termo: string) {
    if (!termo.trim() || !empresa.centro) return;
    setQ(termo); setCarregando(true); setErro(null);
    try { setRes({ termo, lista: await buscar({ data: { termo, ...empresa.centro } }) }); }
    catch (e) { setErro(e instanceof Error ? e.message : "Falha na busca."); }
    finally { setCarregando(false); }
  }
  const pos = res ? res.lista.findIndex((r) => r.placeId === voce.placeId) + 1 : 0;

  return (
    <AppShell title="Ranking por palavra-chave" subtitle={`Quem aparece no Google Maps em ${empresa.cidade} para cada busca`}>
      <form onSubmit={(e) => { e.preventDefault(); pesquisar(q); }} className="tile mb-3 flex gap-3 p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`ex: ${sugerirTermos(empresa.segmento, empresa.cidade)[0]}`} className="flex-1 rounded-lg bg-paper px-4 py-3 outline-none ring-1 ring-border focus:ring-mint" />
        <button disabled={carregando} className="rounded-lg bg-ink px-6 text-sm font-medium text-surface hover:bg-ink/90 disabled:opacity-60">{carregando ? "Buscando…" : "Pesquisar"}</button>
      </form>
      <div className="mb-3 flex flex-wrap gap-2">
        {sugerirTermos(empresa.segmento, empresa.cidade).map((t) => (
          <button key={t} onClick={() => pesquisar(t)} className="rounded-full bg-surface px-3 py-1 text-xs ring-1 ring-border hover:ring-ink/30">{t}</button>
        ))}
      </div>
      {erro && <p className="mb-3 rounded-lg bg-coral/10 p-3 text-sm text-coral">{erro}</p>}
      {res && (
        <div className="grid grid-cols-12 gap-3">
          <section className="tile col-span-12 lg:col-span-8">
            <span className="eyebrow">Top 10 no Google para "{res.termo}"</span>
            <ol className="mt-4 divide-y divide-border overflow-hidden rounded-lg ring-1 ring-border">
              {res.lista.map((r, i) => (
                <li key={r.placeId} className={`flex items-center gap-4 px-4 py-3 text-sm ${r.placeId === voce.placeId ? "bg-mint/10" : ""}`}>
                  <span className="w-6 font-mono text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 font-medium">{r.nome}</span>
                  <span className="font-mono text-muted-foreground">★ {fmt(r.nota, 1)} · {fmt(r.avaliacoes)}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="tile col-span-12 lg:col-span-4">
            <span className="eyebrow">Sua posição</span>
            <p className={`mt-4 font-display text-6xl font-semibold ${pos && pos <= 3 ? "text-mint" : "text-coral"}`}>{pos ? `${pos}º` : "Fora"}</p>
            <p className="mt-2 text-sm text-muted-foreground">{pos ? (pos <= 3 ? "Você está no Top 3 desta busca." : "Fora do Top 3 — onde está a maioria dos cliques.") : "Sua empresa não aparece no Top 10 desta busca."}</p>
            <p className="mt-6 text-xs text-muted-foreground">Volume mensal de buscas e CPC exigem um serviço pago de SEO (ex: DataForSEO) — ainda não conectado.</p>
          </section>
        </div>
      )}
    </AppShell>
  );
}
