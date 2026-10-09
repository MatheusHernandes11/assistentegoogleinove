import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { aplicarAuditoria, empresa } from "@/lib/data";
import { auditarEmpresa } from "@/lib/places.functions";
import { useUsuario } from "@/lib/use-auditoria";

export function useAbrirAuditoria() {
  return () => window.dispatchEvent(new Event("abrir-auditoria"));
}

export function NovaAuditoria() {
  const user = useUsuario();
  const auditar = useServerFn(auditarEmpresa);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [f, setF] = useState({ nome: "", cidade: "", endereco: "", segmento: "", raio: "5" });

  if (typeof window !== "undefined") window.onabrirauditoria = () => (user === null ? window.location.assign("/auth") : setAberto(true));

  const campo = (k: "nome" | "cidade" | "endereco" | "segmento", label: string, ph: string) => (
    <label className="block text-sm">
      <span className="eyebrow">{label}</span>
      <input required={k !== "endereco"} value={f[k]} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })}
        className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 outline-none ring-1 ring-border focus:ring-mint" />
    </label>
  );

  if (user === null) return <Link to="/auth" className="rounded-lg bg-surface px-3 py-2 text-sm font-medium ring-1 ring-border">Entrar</Link>;

  return (
    <>
      <button onClick={() => setAberto(true)} className="rounded-lg bg-surface px-3 py-2 text-sm font-medium ring-1 ring-border hover:ring-ink/30">+ Analisar empresa</button>
      {aberto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={() => !carregando && setAberto(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={async (e) => {
            e.preventDefault(); setErro(null); setCarregando(true);
            const perfil = { nome: f.nome.trim(), cidade: f.cidade.trim(), endereco: f.endereco.trim(), segmento: f.segmento.trim(), raio: Number(f.raio) };
            try {
              const resultado = await auditar({ data: perfil });
              aplicarAuditoria({ perfil, resultado });
              setAberto(false);
            } catch (err) {
              setErro(err instanceof Error ? err.message : "Não foi possível analisar agora.");
            } finally { setCarregando(false); }
          }} className="w-full max-w-md space-y-4 rounded-[14px] bg-surface p-6 shadow-2xl ring-1 ring-border">
            <div>
              <h2 className="font-display text-2xl font-semibold">Nova auditoria</h2>
              <p className="text-sm text-muted-foreground">Busca os dados reais da empresa e dos concorrentes no Google.{empresa.nome && ` Atual: ${empresa.nome}`}</p>
            </div>
            {campo("nome", "Nome da empresa (como está no Google)", "ex: Clínica Sorriso Feliz")}
            {campo("cidade", "Cidade", "ex: Londrina")}
            {campo("endereco", "Bairro / endereço", "ex: Av. Higienópolis")}
            {campo("segmento", "Segmento", "ex: Clínica odontológica")}
            <label className="block text-sm">
              <span className="eyebrow">Raio</span>
              <select value={f.raio} onChange={(e) => setF({ ...f, raio: e.target.value })} className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 ring-1 ring-border">
                {[1, 3, 5, 10, 15].map((r) => <option key={r} value={r}>{r} km</option>)}
              </select>
            </label>
            {erro && <p className="rounded-lg bg-coral/10 p-3 text-sm text-coral ring-1 ring-coral/25">{erro}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setAberto(false)} className="rounded-lg px-4 py-2 text-sm ring-1 ring-border">Cancelar</button>
              <button disabled={carregando} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-surface hover:bg-ink/90 disabled:opacity-60">{carregando ? "Buscando no Google…" : "Analisar"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

declare global { interface Window { onabrirauditoria?: () => void } }
