import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell, fmt } from "@/components/AppShell";
import { empresa, temDados, lider, concorrentes } from "@/lib/data";
import { useAuditoria } from "@/lib/use-auditoria";
import {
  gerarLinkGoogleAdsTransparency,
  gerarAnunciosConcorrentes,
  obterBenchmarkNacional,
  type AnuncioConcorrente,
  type PlayerNacional,
} from "@/lib/ad-library";
import { ESTADOS_BRASIL } from "@/lib/geo-brasil";

export const Route = createFileRoute("/anuncios")({
  head: () => ({
    meta: [
      { title: "Espião de Concorrentes & Anúncios do Google Ads · Inove Local" },
      {
        name: "description",
        content:
          "Espione os anúncios do Google Ads dos seus concorrentes, acesse a Biblioteca de Anúncios do Google e descubra as palavras mais compradas no Brasil.",
      },
      { property: "og:title", content: "Espião de Ads & Biblioteca de Anúncios do Google" },
      {
        property: "og:description",
        content:
          "Descubra as palavras mais compradas no Google Ads e veja os anúncios que seus concorrentes estão veiculando agora.",
      },
    ],
  }),
  component: EspiaoAnunciosPage,
});

type AbaTipo = "anuncios" | "palavras" | "benchmarks" | "biblioteca-google";

function EspiaoAnunciosPage() {
  useAuditoria();

  const [abaAtiva, setAbaAtiva] = useState<AbaTipo>("anuncios");
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [ufFiltro, setUfFiltro] = useState(empresa.uf || "PR");
  const [copiado, setCopiado] = useState(false);

  const topLider = lider();
  const concs = concorrentes();

  // Anúncios de concorrentes gerados dinamicamente para o nicho e região
  const anunciosConcorrentes = useMemo(() => {
    return gerarAnunciosConcorrentes(concs);
  }, [concs, empresa.segmento, empresa.cidade]);

  // Benchmarks nacionais de grandes referências do setor
  const benchmarksNacionais = useMemo(() => {
    return obterBenchmarkNacional(empresa.segmento);
  }, [empresa.segmento]);

  // Lista consolidada de palavras mais compradas pelos concorrentes e líderes
  const palavrasMaisCompradas = useMemo(() => {
    const mapa = new Map<string, { termo: string; cpcMedio: number; volume: number; intencao: string; quemUsa: string }>();

    // Palavras dos líderes nacionais
    benchmarksNacionais.forEach((player) => {
      player.palavrasMaisCompradas.forEach((p) => {
        if (!mapa.has(p.termo.toLowerCase())) {
          mapa.set(p.termo.toLowerCase(), {
            termo: p.termo,
            cpcMedio: p.cpcMedio,
            volume: p.volume,
            intencao: p.intencao,
            quemUsa: player.nome,
          });
        }
      });
    });

    // Palavras dos concorrentes locais
    anunciosConcorrentes.forEach((ad) => {
      ad.palavrasAlvo.forEach((termo) => {
        if (!mapa.has(termo.toLowerCase())) {
          mapa.set(termo.toLowerCase(), {
            termo,
            cpcMedio: ad.cpcEstimado,
            volume: Math.round(1800 + Math.random() * 4500),
            intencao: "Fundo de Funil 🔥",
            quemUsa: ad.anunciante,
          });
        }
      });
    });

    const lista = Array.from(mapa.values());
    if (!termoPesquisa.trim()) return lista;

    const filtro = termoPesquisa.toLowerCase();
    return lista.filter(
      (item) => item.termo.toLowerCase().includes(filtro) || item.quemUsa.toLowerCase().includes(filtro)
    );
  }, [benchmarksNacionais, anunciosConcorrentes, termoPesquisa]);

  // Alvo selecionado para a busca no Google Ads Transparency
  const alvoBuscaAtual = termoPesquisa.trim() || topLider.nome || empresa.segmento || "Consórcios";
  const linkTransparenciaOficial = gerarLinkGoogleAdsTransparency(alvoBuscaAtual);

  function copiarResumoComercial() {
    const texto = `🔍 *RELATÓRIO DE INTELIGÊNCIA DE ADS & CONCORRENTES*
🏢 Cliente: ${empresa.nome || "Sua Empresa"} (${empresa.cidade || "Londrina"} - ${empresa.uf || "PR"})
🎯 Nicho: ${empresa.segmento || "Consórcios"}

🏆 *Líder do Raio:* ${topLider.nome} (${topLider.avaliacoes} avaliações)
📊 *Link Oficial da Biblioteca de Anúncios do Google:*
${linkTransparenciaOficial}

💎 *Palavras mais compradas no Google Ads pelos líderes:*
${palavrasMaisCompradas.slice(0, 5).map((p, i) => `${i + 1}. "${p.termo}" — R$ ${p.cpcMedio.toFixed(2)}/clique (Vol: ${p.volume.toLocaleString("pt-BR")}/mês)`).join("\n")}

💡 *Estratégia Recomendada:*
Criar campanhas no Google Ads focando nas palavras de Fundo de Funil com extensões de chamada e WhatsApp para capturar leads que hoje estão indo para o líder local.

_Gerado pelo Inove Local · Inteligência de Google Maps & Ads_`;

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  if (!temDados()) {
    return (
      <AppShell
        title="Espião de Concorrentes & Anúncios do Google Ads"
        subtitle="Carregue ou analise uma empresa primeiro para rastrear os concorrentes."
      />
    );
  }

  return (
    <AppShell
      title="Espião de Concorrentes & Google Ads"
      subtitle={`Rastreamento de anúncios ativos, palavras mais compradas e Biblioteca de Transparência do Google para ${empresa.segmento || "seu segmento"} em ${empresa.cidade || "sua região"}.`}
    >
      <div className="space-y-6">
        {/* BANNER PRINCIPAL COM ACESSO À BIBLIOTECA DO GOOGLE */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink/95 to-ink/90 p-6 sm:p-8 text-surface shadow-xl">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-3 py-1 text-xs font-semibold text-mint ring-1 ring-mint/30">
              <span>🔎 Google Ads Transparency Center</span>
              <span className="text-surface/50">·</span>
              <span>100% Oficial & Público</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-surface">
              Biblioteca de Anúncios do Google: Veja o que seus concorrentes estão veiculando
            </h2>

            <p className="text-xs sm:text-sm text-surface/80 leading-relaxed max-w-2xl">
              O Google disponibiliza publicamente todos os anúncios ativos de qualquer empresa no Brasil.
              Use nossa ferramenta para espiar os criativos, títulos e estratégias dos maiores players do seu mercado e aplicar no seu negócio.
            </p>

            {/* Barra de Busca Universal de Concorrente ou Marca */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <input
                type="text"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                placeholder={`Buscar concorrente (ex: ${topLider.nome || "Rodobens, Oral Sin, Barbearia..."})`}
                className="flex-1 rounded-xl bg-surface/10 px-4 py-3 text-sm text-surface placeholder:text-surface/50 ring-1 ring-surface/20 outline-none focus:ring-2 focus:ring-mint backdrop-blur-sm"
              />
              <a
                href={linkTransparenciaOficial}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 text-xs sm:text-sm font-bold text-ink transition hover:bg-mint/90 shadow-md whitespace-nowrap cursor-pointer"
              >
                <span>Abrir na Biblioteca do Google</span>
                <span className="text-xs font-mono">↗</span>
              </a>
            </div>

            {/* Sugestões rápidas de concorrentes detectados no raio */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-surface/60 font-medium">⚡ Concorrentes do seu raio:</span>
              <button
                type="button"
                onClick={() => setTermoPesquisa(topLider.nome)}
                className="rounded-lg bg-surface/15 px-2.5 py-1 text-surface hover:bg-surface/25 transition text-xs font-medium cursor-pointer"
              >
                🏆 Líder: {topLider.nome.slice(0, 25)}
              </button>
              {concs.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTermoPesquisa(c.nome)}
                  className="rounded-lg bg-surface/10 px-2.5 py-1 text-surface/80 hover:bg-surface/20 transition text-xs cursor-pointer truncate max-w-[200px]"
                >
                  {c.nome}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAbaAtiva("anuncios")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                abaAtiva === "anuncios"
                  ? "bg-ink text-surface shadow-sm"
                  : "bg-surface text-muted-foreground ring-1 ring-border hover:text-ink"
              }`}
            >
              🎯 Prévia de Anúncios dos Concorrentes ({anunciosConcorrentes.length})
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("palavras")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                abaAtiva === "palavras"
                  ? "bg-ink text-surface shadow-sm"
                  : "bg-surface text-muted-foreground ring-1 ring-border hover:text-ink"
              }`}
            >
              💰 Palavras Mais Compradas no Ads ({palavrasMaisCompradas.length})
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("benchmarks")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                abaAtiva === "benchmarks"
                  ? "bg-ink text-surface shadow-sm"
                  : "bg-surface text-muted-foreground ring-1 ring-border hover:text-ink"
              }`}
            >
              🏆 Benchmarks Nacionais ({benchmarksNacionais.length} Grandes Players)
            </button>
          </div>

          <button
            type="button"
            onClick={copiarResumoComercial}
            className="flex items-center gap-1.5 rounded-xl bg-surface px-3.5 py-2 text-xs font-semibold text-ink ring-1 ring-border hover:bg-paper transition shadow-2xs cursor-pointer"
          >
            {copiado ? (
              <>
                <span className="text-mint font-bold">✓</span>
                <span>Copiado para WhatsApp!</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>Copiar Resumo Comercial</span>
              </>
            )}
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: PRÉVIA DE ANÚNCIOS DOS CONCORRENTES */}
        {abaAtiva === "anuncios" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Estrutura de Anúncios que Concorrentes Utilizam no Google
                </h3>
                <p className="text-xs text-muted-foreground">
                  Veja a anatomia dos anúncios: títulos com alta taxa de clique (CTR), extensões de sitelinks e gatilhos comerciais.
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-paper px-3 py-1 rounded-lg ring-1 ring-border">
                Baseado no raio de {empresa.raio} km em {empresa.cidade}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {anunciosConcorrentes.map((ad, idx) => (
                <div
                  key={ad.id}
                  className="rounded-2xl bg-surface p-5 ring-1 ring-border shadow-xs space-y-4 hover:shadow-md transition"
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ring-1 ring-border">
                          {idx === 0 ? "🏆 Top 1 do Raio" : `Concorrente #${idx + 1}`}
                        </span>
                        <span className="text-xs font-bold text-ink">{ad.anunciante}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block">
                        Gatilho: <strong className="text-ink">{ad.gatilhoPrincipal}</strong>
                      </span>
                    </div>

                    <a
                      href={ad.linkTransparenciaGoogle}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-paper px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-border hover:bg-mint/10 hover:text-ink hover:ring-mint/30 transition cursor-pointer shrink-0"
                    >
                      <span>Ver no Google</span>
                      <span>↗</span>
                    </a>
                  </div>

                  {/* PREVIEW IDÊNTICO AO GOOGLE SEARCH ADS */}
                  <div className="rounded-xl bg-paper/70 p-4 ring-1 ring-border/80 space-y-2 font-sans">
                    {/* Header do Anúncio Google */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-ink text-[11px]">Patrocinado</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-[12px] text-muted-foreground truncate">{ad.urlFinal}</span>
                    </div>

                    {/* Título do Anúncio (Azul Google) */}
                    <h4 className="text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
                      {ad.titulo1} | {ad.titulo2}
                    </h4>

                    {/* Descrição */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {ad.descricao}
                    </p>

                    {/* Sitelinks Extensões */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      {ad.sitelinks.map((link, lidx) => (
                        <div
                          key={lidx}
                          className="rounded-lg bg-surface px-2.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 ring-1 ring-border/80 flex items-center justify-between"
                        >
                          <span className="truncate">{link}</span>
                          <span className="text-[10px] text-muted-foreground">›</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detalhes de Leilão do Anúncio */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>Custo por clique estimado:</span>
                      <span className="font-bold text-ink">R$ {ad.cpcEstimado.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span>Palavras-chave atreladas:</span>
                      <span className="font-mono text-ink font-semibold">{ad.palavrasAlvo.length} termos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: PALAVRAS MAIS COMPRADAS NO ADS */}
        {abaAtiva === "palavras" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Palavras Mais Compradas no Google Ads ({empresa.segmento || "Consórcios"})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Termos que os grandes anunciantes compram no leilão do Google para gerar ligações e WhatsApp de clientes prontos para fechar.
                </p>
              </div>

              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={termoPesquisa}
                  onChange={(e) => setTermoPesquisa(e.target.value)}
                  placeholder="Filtrar palavra ou concorrente..."
                  className="w-full rounded-xl bg-surface px-3.5 py-2 text-xs ring-1 ring-border outline-none focus:ring-mint"
                />
              </div>
            </div>

            {/* TABELA DE PALAVRAS MAIS COMPRADAS */}
            <div className="overflow-x-auto rounded-2xl bg-surface ring-1 ring-border shadow-xs">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-paper/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">Palavra-Chave / Termo de Busca</th>
                    <th className="py-3 px-4">Intenção de Compra</th>
                    <th className="py-3 px-4 text-right">Volume Mensal (Brasil)</th>
                    <th className="py-3 px-4 text-right">CPC Médio Estimado</th>
                    <th className="py-3 px-4">Quem mais compra</th>
                    <th className="py-3 px-4 text-center">Biblioteca Google</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {palavrasMaisCompradas.map((item, idx) => (
                    <tr key={idx} className="hover:bg-paper/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground text-[11px]">#{idx + 1}</span>
                          <span>{item.termo}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-medium text-ink ring-1 ring-border">
                          {item.intencao}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-muted-foreground">
                        {item.volume.toLocaleString("pt-BR")}/mês
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-ink">
                        R$ {item.cpcMedio.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <span className="truncate max-w-[180px] block font-medium text-ink">
                          {item.quemUsa}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={gerarLinkGoogleAdsTransparency(item.termo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-paper px-2 py-1 text-[11px] font-medium text-ink ring-1 ring-border hover:bg-mint/10 hover:text-ink transition cursor-pointer"
                        >
                          <span>Espiar</span>
                          <span>↗</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dica Estratégica para o Cliente */}
            <div className="rounded-xl bg-paper p-4 ring-1 ring-border space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                <span>💡 Como usar isso na venda para o cliente:</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mostre ao cliente que termos de <strong>Fundo de Funil 🔥</strong> (como &quot;consórcio contemplado tabela&quot; ou &quot;implante dentário preço&quot;) possuem clientes com dinheiro na mão prontos para comprar hoje. Quando ele não anuncia no Google Ads e não tem a ficha do Maps no Top 3, 100% dessas pessoas ligam para os concorrentes da lista acima.
              </p>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: BENCHMARKS DOS GRANDES PLAYERS NACIONAIS */}
        {abaAtiva === "benchmarks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Estratégias dos Líderes Nacionais ({empresa.segmento || "Consórcios"})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Grandes empresas que investem milhões de reais no Google Ads todos os meses. Veja o que elas compram para modelar na sua cidade.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {benchmarksNacionais.map((player, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-surface p-6 ring-1 ring-border shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-ink text-surface flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="font-display text-base font-bold text-ink">{player.nome}</h4>
                      </div>
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        Domínio: <strong className="font-mono text-ink">{player.dominio}</strong>
                      </span>
                    </div>

                    <a
                      href={gerarLinkGoogleAdsTransparency(player.nome)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-mint/15 px-3 py-1.5 text-xs font-bold text-mint ring-1 ring-mint/30 hover:bg-mint/25 transition cursor-pointer"
                    >
                      Ver Anúncios Oficiais ↗
                    </a>
                  </div>

                  {/* Resumo da Estratégia */}
                  <div className="rounded-xl bg-paper p-3 text-xs space-y-1">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                      🎯 Estratégia Principal no Google:
                    </span>
                    <p className="text-ink leading-relaxed font-medium">{player.estrategiaAds}</p>
                  </div>

                  {/* Tabela de Palavras que esse Player mais Compra */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Principais Palavras do Leilão:
                    </span>
                    <div className="divide-y divide-border/60 rounded-xl bg-paper/60 ring-1 ring-border">
                      {player.palavrasMaisCompradas.map((p, pidx) => (
                        <div key={pidx} className="flex items-center justify-between p-2.5 text-xs">
                          <div>
                            <span className="font-semibold text-ink block">{p.termo}</span>
                            <span className="text-[10px] text-muted-foreground">{p.intencao}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-ink block">R$ {p.cpcMedio.toFixed(2)}</span>
                            <span className="text-[10px] text-muted-foreground">{p.volume.toLocaleString("pt-BR")}/mês</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
