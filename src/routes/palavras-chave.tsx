import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { AppShell, fmt } from "@/components/AppShell";
import { empresa, empresas, temDados, voce, lider, concorrentes, posicao } from "@/lib/data";
import { rankingPalavra } from "@/lib/places.functions";
import { useAuditoria } from "@/lib/use-auditoria";
import { analisarKeywordsConcorrentes, type IntencaoBusca, type KeywordAnalise } from "@/lib/seo-keywords";

export const Route = createFileRoute("/palavras-chave")({
  head: () => ({
    meta: [
      { title: "SEO de Ads & Palavras-Chave dos Concorrentes · Inove Local" },
      { name: "description", content: "Análise competitiva de palavras-chave, CPC de Google Ads e termos mais usados pelos concorrentes." },
      { property: "og:title", content: "SEO de Ads & Palavras-Chave dos Concorrentes · Inove Local" },
      { property: "og:description", content: "Descubra os termos que seus concorrentes mais usam e os clientes que você está perdendo." },
    ],
  }),
  component: KeywordsPage,
});

type FiltroTipo =
  | "todas"
  | "urgencia"
  | "preco"
  | "alto_ticket"
  | "hiperlocal"
  | "confianca";

function KeywordsPage() {
  useAuditoria();
  const buscarAoVivo = useServerFn(rankingPalavra);

  const [filtro, setFiltro] = useState<FiltroTipo>("todas");
  const [buscaCustomizada, setBuscaCustomizada] = useState("");
  const [termosExtras, setTermosExtras] = useState<KeywordAnalise[]>([]);
  const [carregandoAoVivo, setCarregandoAoVivo] = useState(false);
  const [pesquisaAoVivoRes, setPesquisaAoVivoRes] = useState<{ termo: string; lista: { placeId: string; nome: string; nota: number; avaliacoes: number }[] } | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Análise competitiva gerada dinamicamente com base na empresa e concorrentes atuais
  const { keywords: keywordsBase, diagnostico } = useMemo(() => {
    try {
      return analisarKeywordsConcorrentes();
    } catch (e) {
      console.error("Erro ao analisar keywords:", e);
      return {
        keywords: [] as KeywordAnalise[],
        diagnostico: {
          scoreSEOAds: 0,
          totalVolumeBuscas: 0,
          buscasPerdidasParaConcorrentes: 0,
          custoOportunidadeAds: 0,
          taxaInvisibilidade: 0,
          palavrasMaisDisputadas: [] as KeywordAnalise[],
          oportunidadesOuro: [] as KeywordAnalise[],
          pontosVendaComercial: [] as string[],
        },
      };
    }
  }, [empresa.segmento, empresa.cidade, empresa.raio, voce.avaliacoes]);

  const todasKeywords = useMemo(() => {
    return [...termosExtras, ...keywordsBase];
  }, [termosExtras, keywordsBase]);

  const keywordsFiltradas = useMemo(() => {
    return todasKeywords.filter((k) => {
      if (filtro === "urgencia") return k.gatilho === "urgencia";
      if (filtro === "preco") return k.gatilho === "preco_parcelamento";
      if (filtro === "alto_ticket") return k.gatilho === "alto_ticket";
      if (filtro === "hiperlocal") return k.gatilho === "hiperlocal";
      if (filtro === "confianca") return k.gatilho === "confianca";
      return true;
    });
  }, [todasKeywords, filtro]);

  if (!temDados()) {
    return <AppShell title="SEO de Ads & Palavras-Chave dos Concorrentes" subtitle="Carregue ou analise uma empresa primeiro" />;
  }

  const topLider = lider();
  const listaConcs = concorrentes();

  async function pesquisarPalavraAoVivo(termo: string) {
    if (!termo.trim() || !empresa.centro) return;
    setCarregandoAoVivo(true);
    try {
      const res = await buscarAoVivo({ data: { termo, ...empresa.centro } });
      setPesquisaAoVivoRes({ termo, lista: res });

      // Adiciona como termo extra na tabela se ainda não existir
      const jaExiste = todasKeywords.some((k) => k.termo.toLowerCase() === termo.toLowerCase());
      if (!jaExiste) {
        const novo: KeywordAnalise = {
          id: `custom-${Date.now()}`,
          termo,
          categoria: empresa.segmento || "Geral",
          intencao: "fundo",
          gatilho: "urgencia",
          rotuloGatilho: "🔥 Pesquisa ao Vivo",
          visaoGestorTrafego: "Termo pesquisado ao vivo para verificar posicionamento real no Google Maps.",
          volumeMensal: 0,
          cpcMedio: 0,
          concorrenciaAds: "Alta",
          concorrentesQueUsam: res.map((r) => r.nome),
          taxaConcorrentes: res.length > 0 ? 100 : 0,
          posicaoSua: null,
          status: "invisivel",
          perdaMensalCliques: 0,
          argumentoVenda: `Busca pesquisada ao vivo no Google Maps: concorrentes reais detectados.`,
        };
        setTermosExtras((prev) => [novo, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarregandoAoVivo(false);
    }
  }

  function copiarArgumentoVenda() {
    const texto = `DIAGNÓSTICO COMERCIAL - INOVE LOCAL:
Empresa: ${empresa.nome} (${empresa.cidade})
Segmento: ${empresa.segmento}

${diagnostico.pontosVendaComercial.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Líder da Região: ${topLider.nome} (${topLider.avaliacoes} avaliações · Nota ${topLider.nota.toFixed(1)})
Volume de Buscas Perdido p/ Mês: ~${diagnostico.buscasPerdidasParaConcorrentes.toLocaleString("pt-BR")} cliques
Equivalente em Google Ads: R$ ${diagnostico.custoOportunidadeAds.toLocaleString("pt-BR")}/mês`;

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  return (
    <AppShell
      title="SEO de Ads & Palavras-Chave dos Concorrentes"
      subtitle={`Mineração de termos de busca, leilão do Google Ads e presença comercial em ${empresa.cidade}`}
    >
      {/* 1. CARDS DE DADOS REAIS DO GOOGLE MAPS */}
      <div className="grid grid-cols-12 gap-3.5 mb-6">
        <section className="tile col-span-12 sm:col-span-6 lg:col-span-3">
          <span className="eyebrow">Posição no Google Maps</span>
          <div className="mt-4 flex items-end gap-1.5">
            <span className={`font-display text-5xl font-semibold leading-none ${posicao() <= 3 ? "text-mint" : "text-coral"}`}>
              {posicao()}º
            </span>
            <span className="text-muted-foreground text-sm">/ {empresas.length}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {posicao() <= 3 ? "🟢 No Top 3 do Google Maps." : "🔴 Fora do Top 3: concorrentes recebem os primeiros contatos."}
          </p>
        </section>

        <section className="tile col-span-12 sm:col-span-6 lg:col-span-3">
          <span className="eyebrow">Líder Atual do Raio</span>
          <div className="mt-4">
            <p className="font-display text-lg font-bold text-ink truncate" title={topLider.nome}>
              {topLider.nome}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ★ {fmt(topLider.nota, 1)} · <strong className="text-ink">{topLider.avaliacoes}</strong> avaliações reais
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Leva a maioria das chamadas orgânicas na região.
          </p>
        </section>

        <section className="tile col-span-12 sm:col-span-6 lg:col-span-3">
          <span className="eyebrow">Diferença de Avaliações</span>
          <div className="mt-4 flex items-end gap-1.5">
            <span className="font-display text-5xl font-semibold leading-none text-ink">
              {Math.max(0, topLider.avaliacoes - voce.avaliacoes)}
            </span>
            <span className="text-muted-foreground text-xs">para o líder</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Você tem {voce.avaliacoes} avaliações contra {topLider.avaliacoes} do líder no Google Maps.
          </p>
        </section>

        <section className="tile col-span-12 sm:col-span-6 lg:col-span-3">
          <span className="eyebrow">Termos do Segmento</span>
          <div className="mt-4 flex items-end gap-1.5">
            <span className="font-display text-5xl font-semibold leading-none text-mint">
              {todasKeywords.length}
            </span>
            <span className="text-muted-foreground text-xs">buscas</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Termos estratégicos que clientes buscam para {empresa.segmento} em {empresa.cidade}.
          </p>
        </section>
      </div>

      {/* 2. BOX DE FECHAMENTO COMERCIAL (PONTUAR NA HORA DA VENDA) */}
      <section className="tile mb-6 border-l-4 border-l-mint bg-surface p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="rounded-full bg-mint/15 px-2.5 py-0.5 text-xs font-semibold text-mint">
              Argumentário de Vendas · Para Pontuar com o Cliente
            </span>
            <h3 className="mt-1 font-display text-xl font-semibold">
              O que mostrar e falar para {empresa.nome} fechar o contrato:
            </h3>
          </div>
          <button
            onClick={copiarArgumentoVenda}
            className="flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-xs font-medium text-surface transition hover:bg-ink/90"
          >
            {copiado ? "✓ Argumento Copiado!" : "Copiar Script de Fechamento"}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {diagnostico.pontosVendaComercial.map((ponto, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg bg-paper p-3 ring-1 ring-border/70">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-coral/15 text-xs font-bold text-coral">
                !
              </span>
              <p className="text-sm leading-snug">{ponto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. O QUE AS PESSOAS MAIS BUSCAM NO GOOGLE NESSE NEGÓCIO */}
      <section className="tile mb-6 border-l-4 border-l-amber bg-surface p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="rounded-full bg-amber/15 px-2.5 py-0.5 text-xs font-semibold text-amber">
              🧠 Comportamento Real do Consumidor · O que as Pessoas Digitam no Google
            </span>
            <h3 className="mt-1 font-display text-xl font-semibold">
              O que as pessoas buscam no Google para {empresa.segmento} em {empresa.cidade}:
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Expressões reais digitadas por clientes que estão com dúvida, urgência imediata ou dinheiro na mão querendo contratar.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            Líder que hoje absorve essas buscas: <strong className="text-ink">{topLider.nome}</strong> ({topLider.avaliacoes} avaliações)
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {todasKeywords.slice(0, 6).map((k) => (
            <div
              key={k.id}
              className="flex flex-col justify-between rounded-lg bg-paper p-3.5 ring-1 ring-border/80 transition hover:ring-mint"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-ink ring-1 ring-border">
                    {k.rotuloGatilho}
                  </span>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${k.termo} ${empresa.cidade}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-mint hover:underline"
                    title="Ver resultado real no Google"
                  >
                    <span>Ver no Google</span>
                    <span>↗</span>
                  </a>
                </div>

                <p className="mt-2.5 font-display text-sm font-bold text-ink leading-snug">
                  "{k.termo}"
                </p>
              </div>

              <div className="mt-3 border-t border-border/60 pt-2">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-ink font-medium">Por que buscam:</strong> {k.visaoGestorTrafego}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BUSCA DINÂMICA AO VIVO E FILTROS */}
      <div className="tile mb-4 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pesquisarPalavraAoVivo(buscaCustomizada);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            value={buscaCustomizada}
            onChange={(e) => setBuscaCustomizada(e.target.value)}
            placeholder={`Testar qualquer palavra ao vivo (ex: ${todasKeywords[0]?.termo || "dentista urgente"})...`}
            className="flex-1 rounded-lg bg-paper px-4 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-mint"
          />
          <button
            disabled={carregandoAoVivo || !buscaCustomizada.trim()}
            className="rounded-lg bg-ink px-6 py-2.5 text-sm font-medium text-surface transition hover:bg-ink/90 disabled:opacity-50"
          >
            {carregandoAoVivo ? "Consultando..." : "Pesquisar Palavra"}
          </button>
        </form>

        {/* Abas de Filtros de Tráfego & Comportamento do Consumidor */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            onClick={() => setFiltro("todas")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtro === "todas" ? "bg-ink text-surface" : "bg-paper text-muted-foreground hover:text-ink ring-1 ring-border"
            }`}
          >
            Todas as Buscas ({todasKeywords.length})
          </button>
          <button
            onClick={() => setFiltro("urgencia")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtro === "urgencia" ? "bg-coral text-surface shadow-xs" : "bg-paper text-muted-foreground hover:text-ink ring-1 ring-border"
            }`}
          >
            🔥 Urgência & Fundo de Funil ({todasKeywords.filter((k) => k.gatilho === "urgencia").length})
          </button>
          <button
            onClick={() => setFiltro("preco")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtro === "preco" ? "bg-amber text-surface shadow-xs" : "bg-paper text-muted-foreground hover:text-ink ring-1 ring-border"
            }`}
          >
            💰 Cotação & Preço ({todasKeywords.filter((k) => k.gatilho === "preco_parcelamento").length})
          </button>
          <button
            onClick={() => setFiltro("alto_ticket")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtro === "alto_ticket" ? "bg-mint text-ink shadow-xs" : "bg-paper text-muted-foreground hover:text-ink ring-1 ring-border"
            }`}
          >
            💎 Alto Ticket & Especialidades ({todasKeywords.filter((k) => k.gatilho === "alto_ticket").length})
          </button>
          <button
            onClick={() => setFiltro("hiperlocal")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtro === "hiperlocal" ? "bg-ink text-surface shadow-xs" : "bg-paper text-muted-foreground hover:text-ink ring-1 ring-border"
            }`}
          >
            📍 Hiperlocal no Bairro ({todasKeywords.filter((k) => k.gatilho === "hiperlocal").length})
          </button>
          <button
            onClick={() => setFiltro("confianca")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtro === "confianca" ? "bg-purple-600 text-surface shadow-xs" : "bg-paper text-muted-foreground hover:text-ink ring-1 ring-border"
            }`}
          >
            🏆 Prova Social & Avaliações ({todasKeywords.filter((k) => k.gatilho === "confianca").length})
          </button>
        </div>
      </div>

      {/* 5. TABELA DE PALAVRAS-CHAVE, CONCORRENTES & GOOGLE ADS */}
      <section className="tile overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Palavra-Chave / Termo do Consumidor</th>
                <th className="px-4 py-3.5">Comportamento de Compra</th>
                <th className="px-4 py-3.5">Quem Domina no Maps</th>
                <th className="px-4 py-3.5">Sua Ficha no Maps</th>
                <th className="px-4 py-3.5 text-center">Verificação Oficial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keywordsFiltradas.map((k) => {
                const queryGoogleMaps = encodeURIComponent(`${k.termo} ${empresa.cidade}`);
                return (
                  <tr key={k.id} className="transition hover:bg-paper/60">
                    <td className="px-5 py-4 max-w-md">
                      <p className="font-semibold text-ink text-sm leading-snug">
                        {k.termo}
                      </p>
                      {k.visaoGestorTrafego && (
                        <div className="mt-1.5 rounded-lg bg-paper p-2.5 ring-1 ring-border/80">
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            <strong className="text-ink">🧠 Psicologia de Compra:</strong> {k.visaoGestorTrafego}
                          </p>
                        </div>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">{k.argumentoVenda}</p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-block rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-border whitespace-nowrap">
                        {k.rotuloGatilho || "Intenção Comercial"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-xs text-ink truncate max-w-[200px]" title={k.concorrentesQueUsam[0] || topLider.nome}>
                          {k.concorrentesQueUsam[0] || topLider.nome}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Líder da região em {empresa.cidade}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {k.status === "invisivel" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-medium text-coral ring-1 ring-coral/25 whitespace-nowrap">
                          <span className="size-1.5 rounded-full bg-coral" />
                          Fora do Top 3
                        </span>
                      ) : k.status === "fora_top3" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2.5 py-0.5 text-xs font-medium text-amber ring-1 ring-amber/25 whitespace-nowrap">
                          {k.posicaoSua}º lugar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-0.5 text-xs font-medium text-mint ring-1 ring-mint/25 whitespace-nowrap">
                          ✓ Top 3 da Região
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${queryGoogleMaps}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-paper px-2.5 py-1 text-xs font-medium text-ink ring-1 ring-border hover:bg-mint/10 hover:text-ink transition cursor-pointer whitespace-nowrap"
                      >
                        <span>Abrir Maps</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. RESULTADO DA PESQUISA AO VIVO (SE HOUVER) */}
      {pesquisaAoVivoRes && (
        <section className="tile mt-6">
          <span className="eyebrow">Resultado da Verificação ao Vivo no Google</span>
          <h4 className="mt-1 font-display text-base font-semibold">
            Top 10 no Google Maps para "{pesquisaAoVivoRes.termo}" em {empresa.cidade}:
          </h4>
          <ol className="mt-3 divide-y divide-border overflow-hidden rounded-lg ring-1 ring-border">
            {pesquisaAoVivoRes.lista.map((r, i) => (
              <li
                key={r.placeId}
                className={`flex items-center gap-4 px-4 py-2.5 text-sm ${
                  r.placeId === voce.placeId ? "bg-mint/10 font-semibold" : ""
                }`}
              >
                <span className="w-6 font-mono text-muted-foreground">{i + 1}º</span>
                <span className="flex-1">{r.nome}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  ★ {fmt(r.nota, 1)} · {fmt(r.avaliacoes)} avaliações
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </AppShell>
  );
}
