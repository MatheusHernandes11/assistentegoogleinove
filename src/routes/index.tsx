import { useAuditoria } from "@/lib/use-auditoria";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Bar, fmt } from "@/components/AppShell";
import { empresa, empresas, lider, media, pesquisarKeywords, posicao, ranking, score, voce } from "@/lib/data";
import mapa from "@/assets/mapa-londrina.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel de presença local · Inove Local" },
      { name: "description", content: "Score de presença no Google, concorrentes e palavras-chave da sua região." },
      { property: "og:title", content: "Painel de presença local · Inove Local" },
      { property: "og:description", content: "Descubra quem aparece no Google na sua região e como ficar à frente." },
    ],
  }),
  component: Painel,
});

function Painel() {
  useAuditoria();
  const s = score(voce), L = lider(), sl = score(L), pos = posicao();
  const top = ranking().filter((e) => !e.voce).slice(0, 2);
  const mediaScore = Math.round(empresas.filter((e) => !e.voce).reduce((a, e) => a + score(e), 0) / (empresas.length - 1));
  const kws = pesquisarKeywords(`${empresa.segmento.split(" ")[0]} ${empresa.cidade}`.toLowerCase()).slice(0, 4);
  const conc = { Alta: "text-coral", Média: "text-amber", Baixa: "text-mint" };

  return (
    <AppShell title="Painel de presença local" subtitle={`Raio de ${empresa.raio} km em ${empresa.cidade} · ${empresa.segmento}`}>
      <div className="grid grid-cols-12 gap-3">
        <section className="tile col-span-12 md:col-span-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Score Inove</span>
            <span className="rounded-full bg-mint/10 px-2 py-0.5 text-xs font-medium text-mint ring-1 ring-mint/25">+6 / 30d</span>
          </div>
          <div className="mt-6 flex items-end gap-1.5">
            <span className="font-display text-6xl font-semibold leading-none tracking-tight">{s}</span>
            <span className="mb-1.5 text-lg text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-4"><Bar value={s} /></div>
          <p className="mt-3 text-sm text-muted-foreground">Média da região: {mediaScore}. {pos}º de {empresas.length} clínicas.</p>
        </section>

        <section className="tile col-span-12 md:col-span-6 lg:col-span-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Líder · {L.nome}</span>
            <span className="rounded-full bg-coral/10 px-2 py-0.5 text-xs font-medium text-coral ring-1 ring-coral/25">{L.distancia} km</span>
          </div>
          <div className="mt-6 flex items-end gap-1.5">
            <span className="font-display text-6xl font-semibold leading-none tracking-tight">{sl}</span>
            <span className="mb-1.5 text-lg text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-4"><Bar value={sl} tone="coral" /></div>
          <p className="mt-3 text-sm text-muted-foreground">{fmt(L.nota, 1)} · {L.avaliacoes} avaliações · lidera o raio.</p>
        </section>

        <Link to="/mapa" className="tile col-span-12 block transition hover:ring-mint/40 lg:col-span-5">
          <span className="eyebrow">Raio {empresa.raio} km · {empresa.cidade}</span>
          <div className="mt-4 flex gap-4">
            <img src={mapa} alt="Mapa de concorrentes em Londrina" width={960} height={720} className="aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-border" />
            <div className="flex w-32 shrink-0 flex-col justify-between text-sm">
              <div><p className="font-display text-xl font-semibold">{empresas.length}</p><p className="text-xs text-muted-foreground">clínicas no raio</p></div>
              <div><p className="font-display text-xl font-semibold text-mint">{pos}º</p><p className="text-xs text-muted-foreground">sua posição</p></div>
              <div><p className="font-display text-xl font-semibold text-coral">4</p><p className="text-xs text-muted-foreground">pontos críticos</p></div>
            </div>
          </div>
        </Link>

        <section className="tile col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Comparação de presença</span>
            <Link to="/radar" className="text-xs text-muted-foreground hover:text-ink">Ver radar →</Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-border">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr>{["Clínica", "Avaliações", "Nota", "Fotos", "Score"].map((h, i) => <th key={h} className={`px-4 py-3 font-medium ${i ? "text-right" : ""}`}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {[voce, ...top].map((e) => (
                  <tr key={e.id} className={e.voce ? "bg-mint/5" : ""}>
                    <td className="px-4 py-3 font-sans font-medium">{e.nome}</td>
                    <td className="px-4 py-3 text-right">{e.avaliacoes}</td>
                    <td className="px-4 py-3 text-right">{fmt(e.nota, 1)}</td>
                    <td className="px-4 py-3 text-right">{e.fotos}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${e.voce ? "text-mint" : ""}`}>{score(e)}</td>
                  </tr>
                ))}
                <tr className="bg-ink/[0.03] text-muted-foreground">
                  <td className="px-4 py-3 font-sans font-medium">Média da região</td>
                  <td className="px-4 py-3 text-right">{fmt(media("avaliacoes"))}</td>
                  <td className="px-4 py-3 text-right">{fmt(media("nota"), 1)}</td>
                  <td className="px-4 py-3 text-right">{fmt(media("fotos"))}</td>
                  <td className="px-4 py-3 text-right font-semibold">{mediaScore}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <Link to="/radar" className="tile col-span-12 block lg:col-span-4">
          <span className="eyebrow">Radar de concorrência</span>
          <div className="relative mx-auto mt-4 aspect-square w-[78%] max-w-[220px] rounded-full bg-ink/[0.04] ring-1 ring-border">
            {[18, 36, 54].map((i) => <div key={i} className="absolute rounded-full ring-1 ring-ink/10" style={{ inset: `${i}%` }} />)}
            <div className="absolute inset-0 grid place-items-center">
              <div className="size-[82%] animate-[spin_12s_linear_infinite] rounded-full ring-1 ring-mint/40" style={{ background: "conic-gradient(from 90deg, color-mix(in oklab, var(--mint) 35%, transparent), color-mix(in oklab, var(--mint) 7%, transparent), color-mix(in oklab, var(--mint) 35%, transparent))" }} />
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">Sua nota está perto do líder, mas você perde em avaliações e fotos.</p>
        </Link>

        <section className="tile col-span-12 lg:col-span-7">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Pesquisa de palavras-chave</span>
            <Link to="/palavras-chave" className="text-xs text-muted-foreground hover:text-ink">Pesquisar →</Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-border">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr><th className="px-4 py-3 font-medium">Termo</th><th className="px-4 py-3 text-right font-medium">Volume</th><th className="px-4 py-3 text-right font-medium">Concorrência</th><th className="px-4 py-3 text-right font-medium">Posição</th></tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {kws.map((k) => (
                  <tr key={k.termo}>
                    <td className="px-4 py-3 font-sans">{k.termo}</td>
                    <td className="px-4 py-3 text-right">{fmt(k.volume)}</td>
                    <td className={`px-4 py-3 text-right ${conc[k.concorrencia]}`}>{k.concorrencia}</td>
                    <td className="px-4 py-3 text-right font-semibold">{k.posicao ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="col-span-12 rounded-[14px] bg-ink p-6 text-surface lg:col-span-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-surface/60">Modo Reunião com Cliente</span>
            <span className="rounded-full bg-surface/10 px-2 py-0.5 text-xs font-medium text-surface/80 ring-1 ring-surface/15">Pitch</span>
          </div>
          <p className="mt-5 font-display text-xl font-semibold tracking-tight">{empresa.nome} · {s}/100</p>
          <p className="mt-1 text-sm text-surface/60">{pos}º de {empresas.length} clínicas · 4 pontos críticos · plano de 90 dias</p>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-surface/15"><div className="h-full rounded-full bg-mint" style={{ width: `${s}%` }} /></div>
          <Link to="/reuniao" className="mt-6 inline-flex rounded-lg bg-mint px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-mint/90">Abrir apresentação</Link>
        </section>
      </div>
    </AppShell>
  );
}
