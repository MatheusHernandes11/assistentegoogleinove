import { useState } from "react";
import { analisarEmpresa, empresa, voltarExemplo } from "@/lib/data";

export function NovaAuditoria() {
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState({ nome: "", cidade: "", endereco: "", segmento: "" });
  const campo = (k: keyof typeof f, label: string, ph: string) => (
    <label className="block text-sm">
      <span className="eyebrow">{label}</span>
      <input required={k !== "endereco"} value={f[k]} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })}
        className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 outline-none ring-1 ring-border focus:ring-mint" />
    </label>
  );
  return (
    <>
      <button onClick={() => setAberto(true)} className="rounded-lg bg-surface px-3 py-2 text-sm font-medium ring-1 ring-border hover:ring-ink/30">+ Analisar empresa</button>
      {aberto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={() => setAberto(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => {
            e.preventDefault();
            const nome = f.nome.trim();
            analisarEmpresa({ nome, cidade: f.cidade.trim(), endereco: f.endereco.trim() || f.cidade.trim(), segmento: f.segmento.trim() });
            setAberto(false);
          }} className="w-full max-w-md space-y-4 rounded-[14px] bg-surface p-6 shadow-2xl ring-1 ring-border">
            <div>
              <h2 className="font-display text-2xl font-semibold">Nova auditoria</h2>
              <p className="text-sm text-muted-foreground">Analisando agora: {empresa.nome}</p>
            </div>
            {campo("nome", "Nome da empresa", "ex: Clínica Sorriso Feliz")}
            {campo("cidade", "Cidade", "ex: Londrina")}
            {campo("endereco", "Bairro / endereço", "ex: Gleba Palhano")}
            {campo("segmento", "Segmento", "ex: Clínica odontológica")}
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => { voltarExemplo(); setAberto(false); }} className="text-sm text-muted-foreground hover:text-ink">Voltar ao exemplo</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAberto(false)} className="rounded-lg px-4 py-2 text-sm ring-1 ring-border">Cancelar</button>
                <button className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-surface hover:bg-ink/90">Analisar</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
