import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { empresa, temDados, lider, voce } from "@/lib/data";
import { useAuditoria } from "@/lib/use-auditoria";
import {
  diagnosticarSaudeFicha,
  calcularGapReputacao,
  obterDiagnosticoTrends,
  gerarQRCodeDataUrl,
  gerarMensagemWhatsAppProposta,
  gerarLinkWhatsAppEnvio,
  type ResultadoPageSpeed,
} from "@/lib/google-tools";
import { consultarPageSpeed } from "@/lib/places.functions";

export const Route = createFileRoute("/ferramentas")({
  head: () => ({
    meta: [
      { title: "Ferramentas & Raio-X Google · Inove Local" },
      { name: "description", content: "Auditoria de saúde da ficha, QR Code de avaliações, Google PageSpeed e tendências de busca." },
      { property: "og:title", content: "Ferramentas & Raio-X Google · Inove Local" },
      { property: "og:description", content: "Ferramentas comerciais para potencializar sua presença no Google." },
    ],
  }),
  component: FerramentasPage,
});

type AbaTipo = "raiox" | "qrcode" | "pagespeed" | "trends" | "whatsapp";

function FerramentasPage() {
  useAuditoria();
  const testarSpeed = useServerFn(consultarPageSpeed);

  const [aba, setAba] = useState<AbaTipo>("raiox");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [urlAvaliacaoCustom, setUrlAvaliacaoCustom] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [urlSite, setUrlSite] = useState("www.mpinvest.com.br");
  const [carregandoSpeed, setCarregandoSpeed] = useState(false);
  const [speedRes, setSpeedRes] = useState<ResultadoPageSpeed | null>(null);
  const [speedErro, setSpeedErro] = useState<string | null>(null);

  const saude = useMemo(() => diagnosticarSaudeFicha(), [empresa.nome, voce.avaliacoes, voce.fotos, empresa.ultimaAvaliacao]);
  const gap = useMemo(() => calcularGapReputacao(), [empresa.nome, voce.avaliacoes, lider().avaliacoes, voce.placeId, empresa.placeId]);
  const trends = useMemo(() => obterDiagnosticoTrends(empresa.segmento), [empresa.segmento]);

  useEffect(() => {
    const linkInicial = gap.linkDiretoAvaliacao;
    setUrlAvaliacaoCustom(linkInicial);
    if (linkInicial) {
      gerarQRCodeDataUrl(linkInicial).then((url) => setQrCodeUrl(url));
    }
  }, [gap.linkDiretoAvaliacao]);

  function atualizarLinkAvaliacao(novoLink: string) {
    setUrlAvaliacaoCustom(novoLink);
    if (novoLink.trim()) {
      gerarQRCodeDataUrl(novoLink.trim()).then((url) => setQrCodeUrl(url));
    }
  }

  if (!temDados()) {
    return <AppShell title="Ferramentas Google" subtitle="Analise uma empresa primeiro" />;
  }

  async function rodarTestePageSpeed() {
    if (!urlSite.trim()) return;
    setCarregandoSpeed(true);
    setSpeedErro(null);
    setSpeedRes(null);
    try {
      const res = await testarSpeed({ data: { url: urlSite } });
      if (res) {
        setSpeedRes(res);
      } else {
        setSpeedErro("O Google PageSpeed não conseguiu analisar esta URL. Verifique se o site está online e acessível publicamente.");
      }
    } catch (err) {
      setSpeedErro(err instanceof Error ? err.message : "Falha ao testar no Google PageSpeed.");
    } finally {
      setCarregandoSpeed(false);
    }
  }

  function copiarTexto(texto: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }

  return (
    <AppShell
      title="Ferramentas & Raio-X Google"
      subtitle={`Inteligência prática para ${empresa.nome || "a empresa"} · ${empresa.cidade}`}
    >
      {/* SELETOR DE ABAS */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: "raiox", label: "🏥 Raio-X da Ficha", badge: `${saude.scoreSaude}/100` },
          { id: "qrcode", label: "⭐ QR Code de Avaliações", badge: `Faltam ${gap.diferencaAvaliacoes}` },
          { id: "pagespeed", label: "⚡ Velocidade Mobile (PageSpeed)", badge: "Google API" },
          { id: "trends", label: "📈 Sazonalidade (Google Trends)", badge: trends.statusDemanda },
          { id: "whatsapp", label: "📲 Proposta no WhatsApp", badge: "1-Clique" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAba(item.id as AbaTipo)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              aba === item.id
                ? "bg-ink text-surface shadow-md"
                : "bg-surface text-muted-foreground ring-1 ring-border hover:text-ink hover:bg-paper"
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                aba === item.id ? "bg-mint text-ink font-bold" : "bg-paper text-muted-foreground"
              }`}
            >
              {item.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ABA 1: RAIO-X DA FICHA DO GOOGLE */}
      {aba === "raiox" && (
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="tile col-span-12 md:col-span-4 bg-surface p-6">
              <span className="eyebrow text-mint font-bold">Saúde da Ficha Google</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold leading-none">{saude.scoreSaude}</span>
                <span className="text-xl text-muted-foreground font-semibold">/ 100</span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Classificação: <strong className={saude.scoreSaude >= 70 ? "text-mint" : "text-coral"}>{saude.nivel}</strong>
              </p>
              <div className="mt-4 h-2.5 w-full rounded-full bg-paper overflow-hidden ring-1 ring-border">
                <div
                  className={`h-full rounded-full ${saude.scoreSaude >= 70 ? "bg-mint" : "bg-coral"}`}
                  style={{ width: `${saude.scoreSaude}%` }}
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Empresas com score abaixo de 70 perdem até 65% das chamadas e cliques orgânicos no Google Maps.
              </p>
            </div>

            <div className="tile col-span-12 md:col-span-4 bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-muted-foreground">Última Avaliação Recebida</span>
                <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[10px] font-bold text-mint ring-1 ring-mint/25">
                  🟢 Real Google Maps
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold leading-none text-ink">
                  {saude.diasUltimaAvaliacao !== null ? `Há ${saude.diasUltimaAvaliacao}` : "30+"}
                </span>
                <span className="text-sm text-muted-foreground">dias atrás</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Data real extraída via API do Google Places. Empresas ativas no Top 3 recebem avaliações toda semana.
              </p>
            </div>

            <div className="tile col-span-12 md:col-span-4 bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-muted-foreground">Website no Google Maps</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    voce.site
                      ? "bg-mint/15 text-mint ring-1 ring-mint/25"
                      : "bg-coral/15 text-coral ring-1 ring-coral/25"
                  }`}
                >
                  🟢 Dado Real Google
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span
                  className={`font-display text-3xl font-bold leading-none ${
                    voce.site ? "text-mint" : "text-coral"
                  }`}
                >
                  {voce.site ? "Site Cadastrado" : "Sem Website"}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                {voce.site
                  ? "Sua empresa possui link de website verificado no perfil do Google Maps."
                  : "Fichas sem website oficial perdem relevância e sofrem desvantagem no algoritmo do Google Maps."}
              </p>
            </div>
          </div>

          {/* Checklist de Atributos Críticos */}
          <div className="tile bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">Atributos & Recursos Críticos da Ficha</h3>
                <p className="text-xs text-muted-foreground">
                  Recursos que determinam se o cliente converte pelo Google Maps ou abandona para o vizinho.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {saude.atributos.map((at) => (
                <div
                  key={at.id}
                  className={`rounded-xl p-4 ring-1 ${
                    at.status === "presente"
                      ? "bg-mint/5 ring-mint/30"
                      : at.status === "critico"
                      ? "bg-coral/5 ring-coral/30"
                      : "bg-paper ring-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-ink">{at.nome}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        at.status === "presente"
                          ? "bg-mint/20 text-mint"
                          : at.status === "critico"
                          ? "bg-coral/20 text-coral"
                          : "bg-ink/10 text-muted-foreground"
                      }`}
                    >
                      {at.status === "presente" ? "Ativo" : at.status === "critico" ? "Crítico" : "Ausente"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{at.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: GERADOR DE QR CODE & REPUTAÇÃO */}
      {aba === "qrcode" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="tile col-span-12 lg:col-span-5 bg-surface p-6 text-center space-y-4">
            <span className="eyebrow text-mint font-bold">Placa de Balcão & Recepção</span>
            <h3 className="font-display text-xl font-bold">QR Code de Avaliação 5 Estrelas</h3>
            <p className="text-xs text-muted-foreground">
              Aponte a câmera do celular para testar: abre direto a tela do Google para o cliente avaliar em 5 segundos.
            </p>

            <div className="mx-auto my-4 flex justify-center rounded-2xl bg-white p-5 shadow-inner ring-1 ring-border max-w-[280px]">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code Google Review" className="size-56" />
              ) : (
                <div className="size-56 grid place-items-center text-xs text-muted-foreground">Gerando QR Code...</div>
              )}
            </div>

            <div className="text-left space-y-1.5 rounded-xl bg-paper p-3 ring-1 ring-border">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Link de Avaliação Vinculado ao QR Code:
              </label>
              <div className="flex gap-1.5">
                <input
                  value={urlAvaliacaoCustom}
                  onChange={(e) => atualizarLinkAvaliacao(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="flex-1 rounded-lg bg-surface px-3 py-1.5 text-xs font-mono ring-1 ring-border outline-none focus:ring-mint"
                />
                <a
                  href={urlAvaliacaoCustom}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-mint px-3 py-1.5 text-xs font-bold text-ink hover:bg-mint/90 transition flex items-center shrink-0 cursor-pointer shadow-xs"
                  title="Abrir no Google para conferir"
                >
                  Testar ↗
                </a>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Você pode colar o link curto oficial da ficha do cliente (ex: <code>g.page/r/.../review</code>) ou usar o link direto gerado pelo sistema.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={qrCodeUrl}
                download={`qrcode-avaliacao-${empresa.nome.toLowerCase().replace(/\s+/g, "-")}.png`}
                className="w-full rounded-xl bg-ink py-2.5 text-xs font-bold text-surface transition hover:bg-ink/90 shadow-sm"
              >
                📥 Baixar Imagem do QR Code para Imprimir
              </a>
              <button
                type="button"
                onClick={() => copiarTexto(urlAvaliacaoCustom)}
                className="w-full rounded-xl bg-paper py-2.5 text-xs font-semibold text-ink ring-1 ring-border hover:bg-surface transition cursor-pointer"
              >
                {copiado ? "✓ Link Copiado!" : "🔗 Copiar Link Direto do Google"}
              </button>
            </div>
          </div>

          <div className="tile col-span-12 lg:col-span-7 bg-surface p-6 space-y-6">
            <div>
              <span className="eyebrow text-coral font-bold">Comparativo de Reputação</span>
              <h3 className="mt-1 font-display text-xl font-bold">
                Gap para Passar o Líder da Região ({lider().nome})
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                O líder do raio de {empresa.raio} km possui {gap.avaliacoesLider} avaliações. Sua empresa possui {gap.avaliacoesVoce}.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-paper p-4 ring-1 ring-border text-center">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Você</span>
                <span className="font-display text-3xl font-bold text-ink mt-1 block">{gap.avaliacoesVoce}</span>
                <span className="text-xs text-muted-foreground">★ {voce.nota}</span>
              </div>

              <div className="rounded-xl bg-coral/10 p-4 ring-1 ring-coral/25 text-center">
                <span className="text-[10px] uppercase font-bold text-coral block">Diferença (Gap)</span>
                <span className="font-display text-3xl font-bold text-coral mt-1 block">+{gap.diferencaAvaliacoes}</span>
                <span className="text-xs text-coral font-medium">faltam para empatar</span>
              </div>

              <div className="rounded-xl bg-mint/15 p-4 ring-1 ring-mint/30 text-center">
                <span className="text-[10px] uppercase font-bold text-mint block">Líder Atual</span>
                <span className="font-display text-3xl font-bold text-ink mt-1 block">{gap.avaliacoesLider}</span>
                <span className="text-xs text-muted-foreground">★ {lider().nota}</span>
              </div>
            </div>

            {/* Plano de Ação Semanal */}
            <div className="rounded-xl bg-gradient-to-r from-mint/10 to-mint/5 p-5 ring-1 ring-mint/30 space-y-2">
              <h4 className="font-display text-sm font-bold text-ink">
                🎯 Plano Estratégico de Coleta de Avaliações:
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Com o QR Code no balcão e disparo pós-atendimento pelo WhatsApp, uma meta segura é coletar <strong>{gap.metaSemanalRecomendada} avaliações por semana</strong>.
              </p>
              <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-ink">
                <span className="size-2 rounded-full bg-mint" />
                <span>Previsão para ultrapassar o líder: <strong>{gap.semanasParaUltrapassar} semanas (~{Math.ceil(gap.semanasParaUltrapassar / 4)} meses)</strong>.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: VELOCIDADE MOBILE (PAGESPEED) */}
      {aba === "pagespeed" && (
        <div className="space-y-6">
          <div className="tile bg-surface p-6 space-y-4">
            <div>
              <span className="eyebrow text-mint font-bold">Google Core Web Vitals</span>
              <h3 className="font-display text-xl font-bold">Auditoria de Velocidade Mobile do Site</h3>
              <p className="text-xs text-muted-foreground">
                O Google Maps rebaixa no ranking perfis cujo site no celular demora mais de 3 segundos para carregar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={urlSite}
                onChange={(e) => setUrlSite(e.target.value)}
                placeholder="ex: www.suaempresa.com.br"
                className="flex-1 rounded-xl bg-paper px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-mint font-mono"
              />
              <button
                type="button"
                disabled={carregandoSpeed}
                onClick={rodarTestePageSpeed}
                className="rounded-xl bg-ink px-6 py-3 text-sm font-bold text-surface transition hover:bg-ink/90 disabled:opacity-60 shadow-sm cursor-pointer whitespace-nowrap"
              >
                {carregandoSpeed ? "Analisando com Google..." : "⚡ Testar Velocidade ao Vivo"}
              </button>
            </div>

            {speedErro && (
              <p className="rounded-xl bg-coral/10 p-3.5 text-xs text-coral ring-1 ring-coral/25">
                {speedErro}
              </p>
            )}
          </div>

          {speedRes && (
            <div className="grid grid-cols-12 gap-4">
              <div className="tile col-span-12 md:col-span-4 bg-surface p-6 text-center">
                <span className="eyebrow text-muted-foreground">Score Mobile Google</span>
                <div className="my-4 flex justify-center items-baseline gap-1">
                  <span
                    className={`font-display text-6xl font-bold leading-none ${
                      speedRes.scoreMobile >= 80 ? "text-mint" : speedRes.scoreMobile >= 50 ? "text-amber" : "text-coral"
                    }`}
                  >
                    {speedRes.scoreMobile}
                  </span>
                  <span className="text-xl text-muted-foreground font-semibold">/ 100</span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    speedRes.scoreMobile >= 80
                      ? "bg-mint/15 text-mint"
                      : speedRes.scoreMobile >= 50
                      ? "bg-amber/15 text-amber"
                      : "bg-coral/15 text-coral"
                  }`}
                >
                  Status: {speedRes.status}
                </span>
              </div>

              <div className="tile col-span-12 md:col-span-8 bg-surface p-6 space-y-4">
                <h4 className="font-display text-base font-bold">Métricas de Experiência do Usuário (Lighthouse)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-paper p-3.5 ring-1 ring-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Primeiro Conteúdo Visível (FCP)</span>
                    <span className="font-display text-2xl font-bold text-ink mt-1 block">{speedRes.fcpSegundos}s</span>
                    <span className="text-[11px] text-muted-foreground">Tempo até começar a abrir</span>
                  </div>
                  <div className="rounded-xl bg-paper p-3.5 ring-1 ring-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Carregamento Completo (LCP)</span>
                    <span className="font-display text-2xl font-bold text-ink mt-1 block">{speedRes.lcpSegundos}s</span>
                    <span className="text-[11px] text-muted-foreground">Tempo do maior bloco da tela</span>
                  </div>
                </div>
                <div className="rounded-xl bg-paper p-4 ring-1 ring-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Impacto Comercial:</strong> {speedRes.impactoGoogleMaps}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 4: SAZONALIDADE GOOGLE TRENDS */}
      {aba === "trends" && (
        <div className="tile bg-surface p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="eyebrow text-mint font-bold">Google Trends Oficial</span>
              <h3 className="font-display text-xl font-bold">
                Demanda Real de Buscas: {empresa.segmento || "Seu Segmento"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Consulte o volume de interesse em tempo real direto dos servidores do Google Trends Brasil.
              </p>
            </div>
            <a
              href={`https://trends.google.com.br/trends/explore?geo=BR&q=${encodeURIComponent(empresa.segmento || "Consórcios")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs sm:text-sm font-semibold text-surface transition hover:bg-ink/90 shadow-sm cursor-pointer"
            >
              <span>Abrir no Google Trends Oficial</span>
              <span>↗</span>
            </a>
          </div>

          <div className="rounded-xl bg-paper p-5 ring-1 ring-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              📈 Dados Oficiais do Google sem Estimativas
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O Google Trends exibe os dados reais de comportamento do consumidor brasileiro para <strong>"{empresa.segmento}"</strong>, mostrando se a demanda do seu setor está em alta, estável ou em época de pico no Brasil.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={`https://trends.google.com.br/trends/explore?geo=BR&q=${encodeURIComponent(empresa.segmento || "Consórcios")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-ink ring-1 ring-border hover:bg-paper transition"
              >
                🔍 Comparar com concorrentes no Google Trends ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: DISPARADOR WHATSAPP & PROPOSTA */}
      {aba === "whatsapp" && (
        <div className="tile bg-surface p-6 space-y-6">
          <div>
            <span className="eyebrow text-mint font-bold">Fechamento Comercial</span>
            <h3 className="font-display text-xl font-bold">Enviar Diagnóstico Executivo no WhatsApp do Cliente</h3>
            <p className="text-xs text-muted-foreground">
              Mensagem pré-formatada com o resumo do diagnóstico, link de avaliação e plano de ação.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-8">
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Mensagem Formatada:
              </label>
              <textarea
                rows={12}
                readOnly
                value={gerarMensagemWhatsAppProposta()}
                className="w-full rounded-xl bg-paper p-4 font-mono text-xs leading-relaxed outline-none ring-1 ring-border resize-none"
              />
            </div>

            <div className="col-span-12 md:col-span-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                  WhatsApp do Cliente (com DDD):
                </label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="ex: 43 99999-9999"
                  className="w-full rounded-xl bg-paper px-3.5 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-mint"
                />
              </div>

              <a
                href={gerarLinkWhatsAppEnvio(telefone)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white transition shadow-sm"
              >
                <span>📲 Abrir no WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => copiarTexto(gerarMensagemWhatsAppProposta())}
                className="w-full rounded-xl bg-paper py-3 text-xs font-semibold text-ink ring-1 ring-border hover:bg-surface transition cursor-pointer"
              >
                {copiado ? "✓ Texto Copiado!" : "📋 Copiar Texto Completo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
