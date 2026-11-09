import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { aplicarAuditoria, empresa, gerarAuditoriaNacional } from "@/lib/data";
import { ESTADOS_BRASIL } from "@/lib/geo-brasil";
import { auditarEmpresa } from "@/lib/places.functions";
import { useUsuario } from "@/lib/use-auditoria";

export function useAbrirAuditoria() {
  return () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("abrir-auditoria"));
    }
  };
}

const PRESETS_BRASIL = [
  { nome: "Clínica Odonto Prime", cidade: "São Paulo", uf: "SP", endereco: "Av. Paulista", segmento: "Clínica Odontológica", raio: "5" },
  { nome: "Barbearia Dom Carioca", cidade: "Rio de Janeiro", uf: "RJ", endereco: "Barra da Tijuca", segmento: "Barbearia", raio: "5" },
  { nome: "Instituto Sorriso & Arte", cidade: "Curitiba", uf: "PR", endereco: "Batel", segmento: "Odontologia", raio: "5" },
  { nome: "Silva & Associados Advocacia", cidade: "Belo Horizonte", uf: "MG", endereco: "Savassi", segmento: "Escritório de Advocacia", raio: "5" },
  { nome: "Auto Center Ilha Prime", cidade: "Florianópolis", uf: "SC", endereco: "Centro", segmento: "Oficina Mecânica", raio: "5" },
  { nome: "Bistrô Salvador Gourmet", cidade: "Salvador", uf: "BA", endereco: "Pituba", segmento: "Restaurante", raio: "3" },
  { nome: "Clínica Harmonize Estética", cidade: "Brasília", uf: "DF", endereco: "Asa Sul", segmento: "Clínica de Estética", raio: "5" },
  { nome: "London Barber Shop", cidade: "Londrina", uf: "PR", endereco: "Gleba Palhano", segmento: "Barbearia", raio: "5" },
];

export function NovaAuditoria() {
  const user = useUsuario();
  const auditar = useServerFn(auditarEmpresa);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [f, setF] = useState({
    nome: "",
    cidade: "",
    uf: "SP",
    endereco: "",
    segmento: "",
    raio: "5",
  });

  useEffect(() => {
    window.onabrirauditoria = () => setAberto(true);
    return () => {
      delete window.onabrirauditoria;
    };
  }, []);

  function carregarPreset(p: typeof PRESETS_BRASIL[number]) {
    setF(p);
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-sm font-medium ring-1 ring-border transition hover:ring-ink/40"
      >
        <span className="text-mint font-bold">+</span>
        <span>Analisar qualquer empresa</span>
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm overflow-y-auto"
          onClick={() => !carregando && setAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-lg space-y-5 rounded-[16px] bg-surface p-6 sm:p-8 shadow-2xl ring-1 ring-border"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="eyebrow text-mint">Brasil Inteiro · Qualquer Nicho</span>
                <h2 className="mt-1 font-display text-2xl font-semibold">Auditar Empresa</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Diagnóstico completo de presença no Google Maps, concorrentes locais e SEO de Ads.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-paper hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* Presets Rápidos */}
            <div className="rounded-lg bg-paper p-3 ring-1 ring-border/70">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Exemplos rápidos de demonstração:
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESETS_BRASIL.map((p) => (
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
                    resultado = await auditar({ data: perfil });
                  } catch (serverErr) {
                    console.warn("Usando inteligência analítica direta:", serverErr);
                    const gerada = gerarAuditoriaNacional(perfil);
                    resultado = gerada.resultado;
                  }
                  aplicarAuditoria({ perfil, resultado });
                  setAberto(false);
                } catch (err) {
                  setErro(err instanceof Error ? err.message : "Não foi possível analisar no momento.");
                } finally {
                  setCarregando(false);
                }
              }}
              className="space-y-4"
            >
              <label className="block text-sm">
                <span className="eyebrow">Nome da empresa</span>
                <input
                  required
                  value={f.nome}
                  placeholder="ex: Clínica Sorriso Feliz"
                  onChange={(e) => setF({ ...f, nome: e.target.value })}
                  className="mt-1.5 w-full rounded-lg bg-paper px-3.5 py-2.5 outline-none ring-1 ring-border focus:ring-mint"
                />
              </label>

              <div className="grid grid-cols-12 gap-3">
                <label className="col-span-8 block text-sm">
                  <span className="eyebrow">Cidade</span>
                  <input
                    required
                    value={f.cidade}
                    placeholder="ex: São Paulo, Curitiba, Londrina..."
                    onChange={(e) => setF({ ...f, cidade: e.target.value })}
                    className="mt-1.5 w-full rounded-lg bg-paper px-3.5 py-2.5 outline-none ring-1 ring-border focus:ring-mint"
                  />
                </label>

                <label className="col-span-4 block text-sm">
                  <span className="eyebrow">Estado (UF)</span>
                  <select
                    value={f.uf}
                    onChange={(e) => setF({ ...f, uf: e.target.value })}
                    className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 ring-1 ring-border outline-none focus:ring-mint"
                  >
                    {ESTADOS_BRASIL.map((est) => (
                      <option key={est.sigla} value={est.sigla}>
                        {est.sigla} - {est.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <label className="col-span-7 block text-sm">
                  <span className="eyebrow">Segmento / Nicho de Atuação</span>
                  <input
                    required
                    value={f.segmento}
                    placeholder="ex: Odontologia, Barbearia, Advocacia..."
                    onChange={(e) => setF({ ...f, segmento: e.target.value })}
                    className="mt-1.5 w-full rounded-lg bg-paper px-3.5 py-2.5 outline-none ring-1 ring-border focus:ring-mint"
                  />
                </label>

                <label className="col-span-5 block text-sm">
                  <span className="eyebrow">Raio de Análise</span>
                  <select
                    value={f.raio}
                    onChange={(e) => setF({ ...f, raio: e.target.value })}
                    className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 ring-1 ring-border outline-none focus:ring-mint"
                  >
                    {[1, 3, 5, 10, 15, 20, 30].map((r) => (
                      <option key={r} value={r}>
                        {r} km {r <= 3 ? "(Bairro)" : r <= 5 ? "(Região)" : "(Cidade)"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="eyebrow">Bairro / Endereço (opcional)</span>
                <input
                  value={f.endereco}
                  placeholder="ex: Centro, Av. Paulista, Higienópolis..."
                  onChange={(e) => setF({ ...f, endereco: e.target.value })}
                  className="mt-1.5 w-full rounded-lg bg-paper px-3.5 py-2.5 outline-none ring-1 ring-border focus:ring-mint"
                />
              </label>

              {erro && (
                <p className="rounded-lg bg-coral/10 p-3 text-sm text-coral ring-1 ring-coral/25">
                  {erro}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {empresa.nome ? `Atual: ${empresa.nome}` : "Nenhuma ativa"}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAberto(false)}
                    className="rounded-lg px-4 py-2 text-sm ring-1 ring-border hover:bg-paper"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={carregando}
                    className="flex items-center gap-2 rounded-lg bg-ink px-5 py-2 text-sm font-medium text-surface transition hover:bg-ink/90 disabled:opacity-60"
                  >
                    {carregando ? (
                      <>
                        <span className="size-3 animate-spin rounded-full border-2 border-surface border-t-transparent" />
                        <span>Auditando...</span>
                      </>
                    ) : (
                      "Analisar Empresa"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

declare global {
  interface Window {
    onabrirauditoria?: () => void;
  }
}
