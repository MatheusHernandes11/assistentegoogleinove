export type Empresa = {
  id: string; placeId?: string; nome: string; nota: number; avaliacoes: number; fotos: number;
  categorias: number; site: boolean; distancia: number; lat: number; lng: number; x: number; y: number; voce?: boolean;
};

export type Perfil = { nome: string; cidade: string; endereco: string; segmento: string; raio: number };

export const empresa: Perfil & { ultimaAvaliacao: string | null; centro: { lat: number; lng: number } | null; real: boolean } = {
  nome: "", cidade: "", endereco: "", segmento: "", raio: 5, ultimaAvaliacao: null, centro: null, real: false,
};
export const empresas: Empresa[] = [];

export const temDados = () => empresas.length > 0;
const vazio: Empresa = { id: "voce", nome: "—", nota: 0, avaliacoes: 0, fotos: 0, categorias: 0, site: false, distancia: 0, lat: 0, lng: 0, x: 50, y: 50, voce: true };
const atual = () => (empresas[0] ?? vazio) as unknown as Record<string | symbol, unknown>;
export const voce = new Proxy({} as Empresa, {
  get: (_t, k) => atual()[k],
  ownKeys: () => Reflect.ownKeys(atual()),
  getOwnPropertyDescriptor: (_t, k) => ({ enumerable: true, configurable: true, value: atual()[k] }),
});

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
    voce: Omit<Empresa, "id" | "voce" | "x" | "y">;
    concorrentes: Omit<Empresa, "id" | "voce" | "x" | "y">[];
    ultimaAvaliacao: string | null;
    centro: { lat: number; lng: number };
  };
};

let versao = 0;
const ouvintes = new Set<() => void>();

export function aplicarAuditoria(a: Auditoria) {
  Object.assign(empresa, a.perfil, { ultimaAvaliacao: a.resultado.ultimaAvaliacao, centro: a.resultado.centro, real: true });
  const c0 = a.resultado.centro, escala = 40 / Math.max(1, a.perfil.raio);
  const pos = (e: { lat: number; lng: number }) => ({
    x: Math.max(3, Math.min(97, 50 + (e.lng - c0.lng) * 111 * Math.cos((c0.lat * Math.PI) / 180) * escala)),
    y: Math.max(3, Math.min(97, 50 - (e.lat - c0.lat) * 111 * escala)),
  });
  empresas.splice(0, empresas.length,
    { ...a.resultado.voce, ...pos(a.resultado.voce), id: "voce", voce: true },
    ...a.resultado.concorrentes.map((c, i) => ({ ...c, ...pos(c), id: `c${i}` })));
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

export type Keyword = { termo: string; volume: number; cpc: number; concorrencia: "Alta" | "Média" | "Baixa"; posicao: number | null };
/** Volume/CPC são ESTIMATIVAS (nenhuma fonte de volume de busca conectada). */
export function pesquisarKeywords(q: string): Keyword[] {
  const base = q.trim().toLowerCase() || "empresa";
  const seed = [...base].reduce((s, c) => s + c.charCodeAt(0), 0);
  const termos = [base, `${base} perto de mim`, `melhor ${base}`, `${base} 24 horas`, `${base} preço`];
  const conc = ["Alta", "Alta", "Média", "Baixa", "Média"] as const;
  return termos.map((termo, i) => ({ termo, volume: Math.round((1900 / (i + 1)) * (0.8 + ((seed + i) % 5) / 10)), cpc: 2 + ((seed + i * 3) % 50) / 10, concorrencia: conc[i]!, posicao: null }));
}

/** Pontos críticos reais: só entram se houver desvantagem frente ao líder. */
export function pontosCriticos() {
  const v = voce, L = lider(), dias = diasDesdeUltimaAvaliacao();
  const p: { t: string; d: string; p: string }[] = [];
  if (L.avaliacoes > v.avaliacoes) p.push({ t: "Volume de avaliações", d: `Você tem ${v.avaliacoes} avaliações e o líder (${L.nome}) tem ${L.avaliacoes} — desvantagem de ${L.avaliacoes - v.avaliacoes}.`, p: "O Google confia em quem tem mais prova social. Cada avaliação que falta é um cliente que escolhe o vizinho." });
  if (L.nota > v.nota) p.push({ t: "Nota média", d: `Sua nota é ${v.nota.toFixed(1)} e a do líder é ${L.nota.toFixed(1)}.`, p: "Clientes comparam estrelas antes de ligar. Diferenças pequenas mudam a escolha." });
  if (L.fotos > v.fotos) p.push({ t: "Acervo de fotos", d: `O líder exibe ${L.fotos} fotos contra ${v.fotos} suas (o Google mostra até 10 por consulta).`, p: "Fichas com mais fotos recebem mais pedidos de rota. Quem não mostra, não é visitado." });
  if (!v.site) p.push({ t: "Sem site na ficha", d: "Sua ficha no Google não tem site cadastrado.", p: "Sem site, o cliente não tem para onde ir depois de te achar — e o Google entende menos sobre o seu negócio." });
  if (L.categorias > v.categorias) p.push({ t: "Categorias", d: `O líder usa ${L.categorias} categorias e você ${v.categorias}.`, p: "Cada categoria é uma porta de entrada em buscas diferentes. Você está deixando portas fechadas." });
  if (dias !== null && dias > 14) p.push({ t: "Recência de avaliações", d: `Sua avaliação mais recente foi há ${dias} dias.`, p: "Para o Google, ficha parada é empresa parada." });
  return p;
}
