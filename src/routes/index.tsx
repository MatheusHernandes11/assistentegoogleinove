import { useAuditoria, abrirModalAuditoria } from "@/lib/use-auditoria";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell, Bar, fmt } from "@/components/AppShell";
import { empresa, empresas, lider, media, mediaScore as calcMedia, pontosCriticos, posicao, ranking, score, temDados, voce } from "@/lib/data";
import { MapaGoogle, projetar, zoomPara } from "@/components/MapaGoogle";
import { analisarKeywordsConcorrentes } from "@/lib/seo-keywords";

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
  const { versao } = useAuditoria();
  const tem = temDados();
  const analise = useMemo(() => (tem ? analisarKeywordsConcorrentes() : null), [tem, versao]);
  if (!tem || !analise) return <AppShell title="Painel de presença local" subtitle="Dados reais do Google Maps" />;
  const { keywords, diagnostico } = analise;
  const s = score(voce), L = lider(), sl = score(L), pos = posicao();
  const top = ranking().filter((e) => !e.voce).slice(0, 2);
  const mediaScore = calcMedia();

  return (
    <AppShell
      title="Painel de presença local"
      subtitle={`${empresa.endereco ? `${empresa.endereco}, ` : ""}${empresa.cidade} ${empresa.uf ? `(${empresa.uf})` : ""} · Raio de ${empresa.raio} km · ${empresa.segmento}`}
    >
      {/* BANNER DE AÇÃO EM LARGURA TOTAL: COMEÇAR NOVO CLIENTE */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-ink via-ink/95 to-ink p-5 sm:p-6 text-surface shadow-xl ring-1 ring-border">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/20 px-3 py-1 text-xs font-semibold text-mint ring-1 ring-mint/30">
              📍 Diagnóstico Comercial Hiperlocal
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-surface">
              Avaliar um novo cliente agora?
            </h2>
            <p className="text-xs sm:text-sm text-surface/70 max-w-2xl">
              Colete a localização exata do cliente (Estado, Cidade, Rua e Bairro) para identificar concorrentes vizinhos e as palavras mais buscadas no Google Ads da região.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirModalAuditoria}
            className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-mint px-6 py-3.5 text-sm font-bold text-ink transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:bg-mint/90 cursor-pointer"
          >
            <span className="text-base">🎯</span>
            <span className="uppercase tracking-wide">Começar Novo Cliente / Analisar Empresa</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3.5">
        <section className="tile col-span-12 md:col-span-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Score Inove</span>
          </div>
          <div className="mt-6 flex items-end gap-1.5">
            <span className="font-display text-6xl font-semibold leading-none tracking-tight">{s}</span>
            <span className="mb-1.5 text-lg text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-4"><Bar value={s} /></div>
          <p className="mt-3 text-sm text-muted-foreground">Média da região: {mediaScore}. {pos}º de {empresas.length} empresas.</p>
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
            <MapaGoogle zoom={zoomPara(empresa.raio)} className="w-full">
              {empresas.map((x) => { const p = projetar(x.lat, x.lng, zoomPara(empresa.raio)); return <span key={x.id} className={`absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface ${x.voce ? "bg-mint" : "bg-coral"}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} />; })}
            </MapaGoogle>
            <div className="flex w-32 shrink-0 flex-col justify-between text-sm">
              <div><p className="font-display text-xl font-semibold">{empresas.length}</p><p className="text-xs text-muted-foreground">empresas no raio</p></div>
              <div><p className="font-display text-xl font-semibold text-mint">{pos}º</p><p className="text-xs text-muted-foreground">sua posição</p></div>
              <div><p className="font-display text-xl font-semibold text-coral">4</p><p className="text-xs text-muted-foreground">pontos críticos</p></div>
            </div>
          </div>
        </Link>

        {/* NOVO: BANNER DE PALAVRAS-CHAVE DOS CONCORRENTES & GOOGLE ADS */}
        <section className="tile col-span-12 border-l-4 border-l-mint bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="eyebrow text-mint">SEO de Ads & Palavras-Chave dos Concorrentes</span>
              <h2 className="mt-1 font-display text-xl font-semibold">
                Seus concorrentes dominam {diagnostico.taxaInvisibilidade}% das buscas mais rentáveis
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Termos como <strong>"{keywords[0]?.termo}"</strong> geram {diagnostico.buscasPerdidasParaConcorrentes.toLocaleString("pt-BR")} buscas/mês captadas por {L.nome}. Equivalente a <strong>R$ {diagnostico.custoOportunidadeAds.toLocaleString("pt-BR")}/mês</strong> em Google Ads.
              </p>
            </div>
            <Link
              to="/palavras-chave"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-surface transition hover:bg-ink/90"
            >
              <span>Ver Palavras dos Concorrentes</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* NOVO: BANNER DE FERRAMENTAS GOOGLE & RAIO-X */}
        <section className="tile col-span-12 bg-gradient-to-r from-surface via-surface to-paper p-5 ring-1 ring-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-mint/15 font-bold text-mint text-xl shrink-0">
                ⚡
              </span>
              <div>
                <span className="eyebrow text-muted-foreground">Novas Ferramentas Comerciais Google</span>
                <h3 className="font-display text-lg font-bold">
                  Raio-X da Ficha, QR Code de Balcão, Google PageSpeed e Sazonalidade
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gere a placa de balcão para avaliações, teste a velocidade mobile do site e envie a proposta formatada no WhatsApp em 1 clique.
                </p>
              </div>
            </div>
            <Link
              to="/ferramentas"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs sm:text-sm font-semibold text-surface transition hover:bg-ink/90 shadow-sm"
            >
              <span>Abrir Ferramentas Google</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        <section className="tile col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Comparação de presença</span>
            <Link to="/radar" className="text-xs text-muted-foreground hover:text-ink">Ver radar →</Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-border">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr>{[empresa.segmento || "Empresa", "Avaliações", "Nota", "Fotos", "Score"].map((h, i) => <th key={h} className={`px-4 py-3 font-medium ${i ? "text-right" : ""}`}>{h}</th>)}</tr>
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
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {L.avaliacoes > voce.avaliacoes ? `O líder tem ${L.avaliacoes - voce.avaliacoes} avaliações a mais que você.` : "Você tem mais avaliações que o líder."}{" "}
            {voce.nota >= L.nota ? "Sua nota é igual ou maior." : `Sua nota é ${fmt(L.nota - voce.nota, 1)} menor.`}
          </p>
        </Link>

        <section className="tile col-span-12 lg:col-span-7">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Ranking da região · Inove Score</span>
            <Link to="/palavras-chave" className="text-xs text-muted-foreground hover:text-ink">Ranking por busca →</Link>
          </div>
          <ol className="mt-4 max-h-72 divide-y divide-border overflow-auto rounded-lg ring-1 ring-border">
            {ranking().map((e, i) => (
              <li key={e.id} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${e.voce ? "bg-mint/10" : ""}`}>
                <span className="w-6 font-mono text-muted-foreground">{i + 1}</span>
                <span className="flex-1 truncate font-medium">{e.nome}</span>
                <span className="font-mono text-xs text-muted-foreground">★ {fmt(e.nota, 1)} · {e.avaliacoes} · {fmt(e.distancia, 1)} km</span>
                <span className="w-8 text-right font-mono font-semibold">{score(e)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="col-span-12 rounded-[14px] bg-ink p-6 text-surface lg:col-span-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-surface/60">Modo Reunião com Cliente</span>
            <span className="rounded-full bg-surface/10 px-2 py-0.5 text-xs font-medium text-surface/80 ring-1 ring-surface/15">Pitch</span>
          </div>
          <p className="mt-5 font-display text-xl font-semibold tracking-tight">{empresa.nome} · {s}/100</p>
          <p className="mt-1 text-sm text-surface/60">{pos}º de {empresas.length} empresas · {pontosCriticos().length} pontos críticos · plano de 90 dias</p>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-surface/15"><div className="h-full rounded-full bg-mint" style={{ width: `${s}%` }} /></div>
          <Link to="/reuniao" className="mt-6 inline-flex rounded-lg bg-mint px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-mint/90">Abrir apresentação</Link>
        </section>
      </div>
    </AppShell>
  );
}
