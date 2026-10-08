export type Empresa = {
  id: string; placeId?: string; nome: string; nota: number; avaliacoes: number; fotos: number;
  categorias: number; site: boolean; distancia: number; lat: number; lng: number; voce?: boolean;
};

export type Perfil = { nome: string; cidade: string; endereco: string; segmento: string; raio: number };

export const empresa: Perfil & { ultimaAvaliacao: string | null; centro: { lat: number; lng: number } | null; real: boolean } = {
  nome: "", cidade: "", endereco: "", segmento: "", raio: 5, ultimaAvaliacao: null, centro: null, real: false,
};
export const empresas: Empresa[] = [];

export const temDados = () => empresas.length > 0;
const vazio: Empresa = { id: "voce", nome: "—", nota: 0, avaliacoes: 0, fotos: 0, categorias: 0, site: false, distancia: 0, lat: 0, lng: 0, voce: true };
export const voce = () => empresas[0] ?? vazio;

/** Inove Score: 35% avaliações, 25% nota, 20% fotos, 10% categorias, 10% site — relativo ao melhor da região */
export function score(e: Empresa) {
  const maxAv = Math.max(1, ...empresas.map((x) => x.avaliacoes));
  const maxFo = Math.max(1, ...empresas.map((x) => x.fotos));
  const maxCa = Math.max(1, ...empresas.map((x) => x.categorias));
  const s =
    0.35 * (Math.log(e.avaliacoes + 1) / Math.log(maxAv + 1)) +
    0.25 * Math.max(0, (e.nota - 3.5) / 1.5) +
    0.2 * (e.fotos / maxFo) +
    0.1 * (e.categorias / maxCa) +
    0.1 * (e.site ? 1 : 0);
  return Math.round(Math.min(1, s) * 100);
}

export const ranking = () => [...empresas].sort((a, b) => score(b) - score(a));
export const lider = () => ranking().filter((e) => !e.voce)[0] ?? vazio;
export const posicao = () => ranking().findIndex((e) => e.voce) + 1;
export const concorrentes = () => empresas.filter((e) => !e.voce);
export const media = (k: "avaliacoes" | "fotos" | "nota" | "categorias") => {
  const o = concorrentes();
  return o.length ? o.reduce((s, e) => s + e[k], 0) / o.length : 0;
};
export const mediaScore = () => {
  const o = concorrentes();
  return o.length ? Math.round(o.reduce((a, e) => a + score(e), 0) / o.length) : 0;
};
export const diasDesdeUltimaAvaliacao = () =>
  empresa.ultimaAvaliacao ? Math.floor((Date.now() - new Date(empresa.ultimaAvaliacao).getTime()) / 86400000) : null;

// ---------- Store ----------
export type Auditoria = {
  perfil: Perfil;
  resultado: {
    voce: Omit<Empresa, "id" | "voce">;
    concorrentes: Omit<Empresa, "id" | "voce">[];
    ultimaAvaliacao: string | null;
    centro: { lat: number; lng: number };
  };
};

let versao = 0;
const ouvintes = new Set<() => void>();

export function aplicarAuditoria(a: Auditoria) {
  Object.assign(empresa, a.perfil, { ultimaAvaliacao: a.resultado.ultimaAvaliacao, centro: a.resultado.centro, real: true });
  empresas.splice(0, empresas.length,
    { ...a.resultado.voce, id: "voce", voce: true },
    ...a.resultado.concorrentes.map((c, i) => ({ ...c, id: `c${i}` })));
  versao++;
  ouvintes.forEach((f) => f());
  if (typeof window !== "undefined") localStorage.setItem("inove-auditoria", JSON.stringify(a));
}
export function carregarSalvo() {
  try {
    const raw = localStorage.getItem("inove-auditoria");
    if (raw) aplicarAuditoria(JSON.parse(raw));
  } catch { /* ignora */ }
}
export const assinar = (f: () => void) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; };
export const lerVersao = () => versao;

/** Estimativas de volume (sem fonte de volume conectada) */
export function sugerirTermos(segmento: string, cidade: string) {
  const s = segmento.toLowerCase(), c = cidade.toLowerCase();
  return [`${s} ${c}`, `${s} perto de mim`, `melhor ${s} ${c}`, `${s} 24 horas ${c}`, `${s} preço ${c}`];
}
