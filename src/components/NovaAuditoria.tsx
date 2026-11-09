import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { aplicarAuditoria, empresa, gerarAuditoriaNacional } from "@/lib/data";
import { ESTADOS_BRASIL } from "@/lib/geo-brasil";
import { auditarEmpresa } from "@/lib/places.functions";
import { useUsuario, useModalAuditoria, abrirModalAuditoria } from "@/lib/use-auditoria";

export { abrirModalAuditoria };
export function useAbrirAuditoria() {
  return abrirModalAuditoria;
}

const PRESETS_CLIENTES = [
  { nome: "Clínica Odonto Prime", cidade: "São Paulo", uf: "SP", endereco: "Av. Paulista, 1000 - Bela Vista", segmento: "Clínica Odontológica", raio: "3" },
  { nome: "Barbearia Dom Carioca", cidade: "Rio de Janeiro", uf: "RJ", endereco: "Av. Olegário Maciel, 400 - Barra da Tijuca", segmento: "Barbearia", raio: "3" },
  { nome: "Instituto Sorriso & Arte", cidade: "Curitiba", uf: "PR", endereco: "Rua Bispo Dom José, 2100 - Batel", segmento: "Odontologia", raio: "3" },
  { nome: "Silva & Associados Advocacia", cidade: "Belo Horizonte", uf: "MG", endereco: "Praça da Savassi, 100 - Savassi", segmento: "Escritório de Advocacia", raio: "5" },
  { nome: "Auto Center Ilha Prime", cidade: "Florianópolis", uf: "SC", endereco: "Rua Bocaiúva, 650 - Centro", segmento: "Oficina Mecânica", raio: "5" },
  { nome: "Bistrô Salvador Gourmet", cidade: "Salvador", uf: "BA", endereco: "Rua das Hortênsias - Pituba", segmento: "Restaurante", raio: "3" },
  { nome: "Clínica Harmonize Estética", cidade: "Brasília", uf: "DF", endereco: "CLS 405 Bloco B - Asa Sul", segmento: "Clínica de Estética", raio: "3" },
  { nome: "London Barber Shop", cidade: "Londrina", uf: "PR", endereco: "Av. Ayrton Senna, 500 - Gleba Palhano", segmento: "Barbearia", raio: "3" },
];

const NICHOS_RAPIDOS = [
  "Odontologia",
  "Barbearia",
  "Advocacia",
  "Oficina Mecânica",
  "Estética & Laser",
  "Restaurante",
  "Imobiliária",
  "Academia / CrossFit",
  "Pet Shop & Vet",
];

export function NovaAuditoria() {
  const user = useUsuario();
  const auditar = useServerFn(auditarEmpresa);
  const { aberto, abrir, fechar } = useModalAuditoria();
  const [carregando, setCarregando] = useState(false);
  const [etapaStatus, setEtapaStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (aberto && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, [aberto]);

  const [f, setF] = useState({
    nome: "",
    cidade: "",
    uf: "SP",
    endereco: "",
    segmento: "",
    raio: "3",
  });

  function carregarPreset(p: typeof PRESETS_CLIENTES[number]) {
    setF(p);
  }

  const modalJSX = aberto ? (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-md overflow-y-auto"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
      onClick={() => !carregando && fechar()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-xl max-h-[92vh] overflow-y-auto space-y-5 rounded-[20px] bg-surface p-6 sm:p-8 shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-150 relative z-[100000]"
      >
        {/* Header da Ficha */}
        <div className="flex items-start justify-between border-b border-border/80 pb-4">
          <div>
            <span className="eyebrow text-mint font-bold tracking-wider">
              Dinâmica de Atendimento & Vendas
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
              Diagnóstico Local do Cliente
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Primeiro colete a localização exata (região, cidade e rua). Em seguida, iniciamos a busca de concorrentes do raio e palavras-chave de Google Ads.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fechar()}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-paper hover:text-ink transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Presets Rápidos */}
        <div className="rounded-xl bg-paper p-3.5 ring-1 ring-border/70">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            ⚡ Ou teste agora com clientes de exemplo:
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS_CLIENTES.map((p) => (
              <button
                key={`${p.cidade}-${p.segmento}`}
                type="button"
                onClick={() => carregarPreset(p)}
                className="rounded-md bg-surface px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border transition hover:bg-mint/10 hover:text-ink hover:ring-mint/30"
              >
                {p.cidade} ({p.uf}) · {p.segmento}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setErro(null);
            setCarregando(true);
            setEtapaStatus("Mapeando endereço e coordenadas da rua...");

            const perfil = {
              nome: f.nome.trim(),
              cidade: f.cidade.trim(),
              uf: f.uf,
              endereco: f.endereco.trim(),
              segmento: f.segmento.trim(),
              raio: Number(f.raio),
            };

            try {
              let resultado;
              try {
                setEtapaStatus(`Buscando concorrentes no raio de ${f.raio} km...`);
                resultado = await auditar({ data: perfil });
              } catch (serverErr) {
                console.warn("Usando inteligência analítica direta:", serverErr);
                setEtapaStatus("Calculando palavras-chave, CPC de Google Ads e gap comercial...");
                const gerada = gerarAuditoriaNacional(perfil);
                resultado = gerada.resultado;
              }
              aplicarAuditoria({ perfil, resultado });
              fechar();
            } catch (err) {
              setErro(err instanceof Error ? err.message : "Não foi possível analisar no momento.");
            } finally {
              setCarregando(false);
              setEtapaStatus(null);
            }
          }}
          className="space-y-4"
        >
          {/* ETAPA 1: ONDE O CLIENTE ATENDE (REGIÃO, CIDADE, RUA) */}
          <div className="rounded-xl bg-paper/60 p-4 ring-1 ring-border/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-mint text-xs font-bold text-ink">1</span>
              <span className="font-semibold text-xs uppercase tracking-wider text-ink">
                Localização Exata do Estabelecimento
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <label className="col-span-4 block text-xs">
                <span className="eyebrow">Estado (UF)</span>
                <select
                  value={f.uf}
                  onChange={(e) => setF({ ...f, uf: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-surface px-3 py-2 ring-1 ring-border text-sm outline-none focus:ring-mint font-medium"
                >
                  {ESTADOS_BRASIL.map((est) => (
                    <option key={est.sigla} value={est.sigla}>
                      {est.sigla} - {est.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="col-span-8 block text-xs">
                <span className="eyebrow">Cidade</span>
                <input
                  required
                  value={f.cidade}
                  placeholder="ex: Curitiba, São Paulo, Londrina..."
                  onChange={(e) => setF({ ...f, cidade: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-mint font-medium"
                />
              </label>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <label className="col-span-8 block text-xs">
                <span className="eyebrow">Rua, Avenida e Bairro (Endereço)</span>
                <input
                  required
                  value={f.endereco}
                  placeholder="ex: Rua Bispo Dom José, 2100 - Batel"
                  onChange={(e) => setF({ ...f, endereco: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-mint"
                />
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  Fundamental para mapear a concorrência vizinha e buscas como "no [bairro]".
                </span>
              </label>

              <label className="col-span-4 block text-xs">
                <span className="eyebrow">Raio Comercial</span>
                <select
                  value={f.raio}
                  onChange={(e) => setF({ ...f, raio: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-surface px-2.5 py-2 ring-1 ring-border text-sm outline-none focus:ring-mint"
                >
                  <option value="1">1 km (Vizinhança)</option>
                  <option value="3">3 km (Bairro)</option>
                  <option value="5">5 km (Região)</option>
                  <option value="10">10 km (Cidade)</option>
                </select>
              </label>
            </div>
          </div>

          {/* ETAPA 2: DADOS DO CLIENTE E NICHO */}
          <div className="rounded-xl bg-paper/60 p-4 ring-1 ring-border/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-mint text-xs font-bold text-ink">2</span>
              <span className="font-semibold text-xs uppercase tracking-wider text-ink">
                Empresa do Cliente & Segmento
              </span>
            </div>

            <label className="block text-xs">
              <span className="eyebrow">Nome da empresa do cliente</span>
              <input
                required
                value={f.nome}
                placeholder="ex: Clínica Sorriso & Arte"
                onChange={(e) => setF({ ...f, nome: e.target.value })}
                className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-mint font-medium"
              />
            </label>

            <div>
              <label className="block text-xs">
                <span className="eyebrow">Segmento / Ramo de Atuação</span>
                <input
                  required
                  value={f.segmento}
                  placeholder="ex: Odontologia, Barbearia, Advocacia..."
                  onChange={(e) => setF({ ...f, segmento: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-surface px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-mint"
                />
              </label>

              <div className="mt-2 flex flex-wrap gap-1">
                {NICHOS_RAPIDOS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setF({ ...f, segmento: n })}
                    className={`rounded px-2 py-0.5 text-[11px] transition ${
                      f.segmento === n
                        ? "bg-ink text-surface font-medium"
                        : "bg-surface text-muted-foreground ring-1 ring-border hover:text-ink"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {erro && (
            <p className="rounded-lg bg-coral/10 p-3 text-xs text-coral ring-1 ring-coral/25">
              {erro}
            </p>
          )}

          {carregando && etapaStatus && (
            <div className="flex items-center gap-3 rounded-lg bg-mint/10 p-3 text-xs text-ink ring-1 ring-mint/30">
              <span className="size-3.5 animate-spin rounded-full border-2 border-mint border-t-transparent shrink-0" />
              <span className="font-medium">{etapaStatus}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {empresa.nome ? `Ativa: ${empresa.nome}` : "Nenhuma ativa"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fechar()}
                className="rounded-lg px-4 py-2 text-xs sm:text-sm ring-1 ring-border hover:bg-paper cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={carregando}
                className="flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-xs sm:text-sm font-semibold text-surface transition hover:bg-ink/90 disabled:opacity-60 shadow-sm cursor-pointer"
              >
                {carregando ? (
                  <>
                    <span className="size-3 animate-spin rounded-full border-2 border-surface border-t-transparent" />
                    <span>Auditando...</span>
                  </>
                ) : (
                  "🔍 Iniciar Análise Hiperlocal"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => abrir()}
        className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-xs sm:text-sm font-medium ring-1 ring-border transition hover:ring-ink/40 shadow-2xs cursor-pointer"
      >
        <span className="text-mint font-bold text-sm">🎯</span>
        <span className="font-semibold">Nova Análise de Cliente</span>
      </button>

      {montado && aberto && typeof document !== "undefined"
        ? createPortal(modalJSX, document.body)
        : null}
    </>
  );
}

declare global {
  interface Window {
    onabrirauditoria?: () => void;
  }
}
