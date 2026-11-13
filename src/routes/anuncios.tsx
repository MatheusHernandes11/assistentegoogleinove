import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell, fmt } from "@/components/AppShell";
import { empresa, temDados, lider, concorrentes } from "@/lib/data";
import { useAuditoria } from "@/lib/use-auditoria";
import {
  gerarLinkGoogleAdsTransparency,
  gerarLinkBuscaGooglePatrocinados,
  obterConcorrentesReaisParaAds,
  type ConcorrenteRealAds,
} from "@/lib/ad-library";

export const Route = createFileRoute("/anuncios")({
  head: () => ({
    meta: [
      { title: "Espião de Concorrentes & Anúncios do Google Ads · Inove Local" },
      {
        name: "description",
        content:
          "Espione os anúncios do Google Ads dos seus concorrentes diretamente na Biblioteca Oficial do Google Ads Transparency Center.",
      },
      { property: "og:title", content: "Espião de Ads & Biblioteca de Anúncios do Google" },
      {
        property: "og:description",
        content:
          "Acesse a Biblioteca Oficial de Transparência do Google e veja os anúncios que seus concorrentes reais estão veiculando agora.",
      },
    ],
  }),
  component: EspiaoAnunciosPage,
});

function EspiaoAnunciosPage() {
  useAuditoria();

  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [avisoCopiadoId, setAvisoCopiadoId] = useState<string | null>(null);

  const topLider = lider();
  const concs = concorrentes();

  // Lista de concorrentes 100% REAIS auditados no Google Maps
  const concorrentesReais = useMemo(() => {
    return obterConcorrentesReaisParaAds(concs);
  }, [concs, empresa.nome]);

  // Alvo para busca livre na Biblioteca de Anúncios do Google
  const alvoBuscaAtual = termoPesquisa.trim() || topLider.nome || empresa.segmento || "";
  const linkTransparenciaOficial = gerarLinkGoogleAdsTransparency(alvoBuscaAtual);

  function abrirBibliotecaComCopia(nomeEmpresa: string, id?: string) {
    const nomeLimpo = nomeEmpresa.split("|")[0]?.split("-")[0]?.trim() || nomeEmpresa;
    if (nomeLimpo) {
      navigator.clipboard.writeText(nomeLimpo);
      if (id) {
        setAvisoCopiadoId(id);
        setTimeout(() => setAvisoCopiadoId(null), 3500);
      }
    }
    window.open("https://adstransparency.google.com/?region=BR", "_blank");
  }

  function copiarResumoComercial() {
    const texto = `🔍 *ESPIONAGEM DE ANÚNCIOS DOS CONCORRENTES NO GOOGLE ADS*
🏢 Cliente: ${empresa.nome || "Sua Empresa"} (${empresa.cidade || ""} - ${empresa.uf || ""})
📍 Endereço: ${empresa.endereco || "Região cadastrada"}
🎯 Segmento: ${empresa.segmento || "Local"}

🏆 *Líder Real do Google Maps:* ${topLider.nome}
⭐ Nota: ${fmt(topLider.nota, 1)} (${topLider.avaliacoes} avaliações reais no Google)

🔗 *Biblioteca Oficial de Anúncios do Google (Google Ads Transparency Center):*
${linkTransparenciaOficial}

📋 *Concorrentes do Raio para Espiar Anúncios:*
${concorrentesReais.slice(0, 5).map((c, i) => `${i + 1}. ${c.nome} (${c.avaliacoes} avaliações) ➔ ${c.linkTransparenciaGoogle}`).join("\n")}

_Relatório de dados reais gerado pelo Inove Local_`;

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  if (!temDados()) {
    return (
      <AppShell
        title="Espião de Concorrentes & Google Ads"
        subtitle="Analise uma empresa primeiro para identificar os concorrentes reais no Google Maps."
      />
    );
  }

  return (
    <AppShell
      title="Espião de Concorrentes & Google Ads"
      subtitle={`Acesse os anúncios ativos oficiais e as fichas dos concorrentes de ${empresa.nome} (${empresa.segmento}) em ${empresa.cidade}.`}
    >
      <div className="space-y-6">
        {/* BANNER PRINCIPAL COM ACESSO DIRETO AO GOOGLE ADS TRANSPARENCY CENTER */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink/95 to-ink/90 p-6 sm:p-8 text-surface shadow-xl">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-3 py-1 text-xs font-semibold text-mint ring-1 ring-mint/30">
              <span>🔎 Google Ads Transparency Center</span>
              <span className="text-surface/50">·</span>
              <span>100% Oficial & Dados Reais</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-surface">
              Biblioteca de Anúncios do Google: Anúncios Reais dos Concorrentes
            </h2>

            <p className="text-xs sm:text-sm text-surface/80 leading-relaxed max-w-2xl">
              O Google mantém publicamente todos os anúncios veiculados por qualquer empresa no Brasil na Pesquisa, no YouTube, no Maps e em Display.
              Clique nos concorrentes detectados no seu raio para inspecionar os criativos, ofertas e estratégias oficiais diretamente no Google.
            </p>

            {/* Barra de Busca Universal de Qualquer Concorrente ou Marca no Brasil */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <input
                type="text"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                placeholder={`Buscar qualquer empresa (ex: ${topLider.nome || "Nome do concorrente..."})`}
                className="flex-1 rounded-xl bg-surface/10 px-4 py-3 text-sm text-surface placeholder:text-surface/50 ring-1 ring-surface/20 outline-none focus:ring-2 focus:ring-mint backdrop-blur-sm"
              />
              <a
                href={`https://www.google.com.br/search?q=${encodeURIComponent(`${termoPesquisa.trim() || topLider.nome || empresa.segmento} ${empresa.cidade}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 text-xs sm:text-sm font-bold text-ink transition hover:bg-mint/90 shadow-md whitespace-nowrap cursor-pointer"
              >
                <span>Ver Anúncios no Google</span>
                <span className="text-xs font-mono">↗</span>
              </a>
              <button
                type="button"
                onClick={() => abrirBibliotecaComCopia(termoPesquisa.trim() || topLider.nome || empresa.segmento || "", "topo")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface/20 hover:bg-surface/30 text-surface px-4 py-3 text-xs font-semibold ring-1 ring-surface/30 transition whitespace-nowrap cursor-pointer"
                title="Copiar nome e abrir a Biblioteca de Transparência do Google"
              >
                <span>{avisoCopiadoId === "topo" ? "✓ Nome Copiado!" : "Biblioteca Ads"}</span>
                <span className="text-xs font-mono">↗</span>
              </button>
            </div>

            {/* Atalhos Rápidos dos Concorrentes Reais do Raio */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-surface/60 font-medium">⚡ Concorrentes reais do raio:</span>
              {concorrentesReais.slice(0, 4).map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTermoPesquisa(c.nome)}
                  className="rounded-lg bg-surface/15 px-2.5 py-1 text-surface hover:bg-surface/25 transition text-xs font-medium cursor-pointer truncate max-w-[220px]"
                >
                  {idx === 0 ? "🏆 " : ""}{c.nome}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BARRA DE AÇÕES */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Concorrentes Reais Detectados no Raio ({concorrentesReais.length} empresas no Google Maps)
            </h3>
            <p className="text-xs text-muted-foreground">
              Empresas reais mapeadas na busca do Google Maps para {empresa.segmento} em {empresa.cidade}.
            </p>
          </div>

          <button
            type="button"
            onClick={copiarResumoComercial}
            className="flex items-center gap-1.5 rounded-xl bg-surface px-3.5 py-2 text-xs font-semibold text-ink ring-1 ring-border hover:bg-paper transition shadow-2xs cursor-pointer"
          >
            {copiado ? (
              <>
                <span className="text-mint font-bold">✓</span>
                <span>Links Copiados para WhatsApp!</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>Copiar Links dos Anúncios</span>
              </>
            )}
          </button>
        </div>

        {/* LISTA DE CONCORRENTES REAIS COM BOTÕES DIRETOS PARA GOOGLE ADS TRANSPARENCY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {concorrentesReais.map((c, idx) => (
            <div
              key={c.id}
              className="rounded-2xl bg-surface p-5 ring-1 ring-border shadow-xs space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-paper text-xs font-bold text-ink ring-1 ring-border shrink-0">
                      #{idx + 1}
                    </span>
                    <h4 className="font-display text-base font-bold text-ink leading-snug">
                      {c.nome}
                    </h4>
                  </div>
                  {idx === 0 && (
                    <span className="rounded-full bg-coral/15 px-2.5 py-0.5 text-[10px] font-bold text-coral ring-1 ring-coral/25 shrink-0">
                      🏆 Líder do Raio
                    </span>
                  )}
                </div>

                {/* Métricas Reais do Google Maps */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 font-semibold text-ink">
                    <span className="text-amber-500">★</span>
                    <span>{fmt(c.nota, 1)}</span>
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-ink">{c.avaliacoes}</strong> avaliações reais
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-ink">{c.fotos}</strong> fotos no Google
                  </span>
                  <span>·</span>
                  <span>{c.distancia} km</span>
                </div>

                {c.endereco && (
                  <p className="text-xs text-muted-foreground truncate" title={c.endereco}>
                    📍 {c.endereco}
                  </p>
                )}
              </div>

              {/* Botões de Ação Oficial */}
              <div className="pt-3 border-t border-border/60 flex flex-wrap gap-2">
                <a
                  href={c.linkBuscaGoogleAds}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-surface hover:bg-ink/90 transition shadow-xs cursor-pointer text-center"
                  title="Abrir busca do Google com anúncios patrocinados ativos deste concorrente"
                >
                  <span>Ver Anúncios no Google</span>
                  <span className="text-xs font-mono">↗</span>
                </a>

                <button
                  type="button"
                  onClick={() => abrirBibliotecaComCopia(c.nome, c.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-paper px-3 py-2 text-xs font-medium text-ink ring-1 ring-border hover:bg-surface transition cursor-pointer"
                  title="Copiar nome do concorrente e abrir a Biblioteca Oficial de Transparência do Google"
                >
                  <span>{avisoCopiadoId === c.id ? "✓ Copiado!" : "Biblioteca Ads"}</span>
                  <span className="text-xs font-mono">↗</span>
                </button>

                <a
                  href={c.linkGoogleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-paper px-3 py-2 text-xs font-medium text-ink ring-1 ring-border hover:bg-surface transition cursor-pointer"
                >
                  <span>Maps</span>
                  <span className="text-xs font-mono">↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* STATUS DA API DE GOOGLE ADS (TRANSPARÊNCIA TOTAL) */}
        <div className="rounded-2xl bg-paper p-5 ring-1 ring-border space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-mint" />
            <span className="font-semibold text-xs uppercase tracking-wider text-ink">
              Transparência de Dados: Apenas Fontes Reais
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Nossa plataforma não inventa anúncios ou números simulados. Os links acima levam diretamente à <strong>Biblioteca Oficial de Anúncios do Google (Google Ads Transparency Center)</strong>, onde você confere 100% dos anúncios veiculados pelas empresas com autenticação oficial do Google.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={`https://www.google.com.br/search?q=${encodeURIComponent(`${empresa.segmento} em ${empresa.cidade}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-ink ring-1 ring-border hover:bg-paper transition"
            >
              <span>Ver leilão ao vivo de "{empresa.segmento} em {empresa.cidade}" no Google</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
