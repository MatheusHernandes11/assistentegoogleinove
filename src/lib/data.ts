export type Empresa = {
  id: string; nome: string; nota: number; avaliacoes: number; fotos: number;
  servicos: number; categorias: number; site: boolean; distancia: number;
  x: number; y: number; voce?: boolean;
};

export const empresa = {
  nome: "Clínica Exemplo", cidade: "Londrina", endereco: "Av. Higienópolis",
  segmento: "Clínica odontológica", raio: 5,
};

export const empresas: Empresa[] = [
  { id: "voce", nome: "Clínica Exemplo", nota: 4.7, avaliacoes: 186, fotos: 87, servicos: 12, categorias: 3, site: true, distancia: 0, x: 50, y: 50, voce: true },
  { id: "a", nome: "Concorrente A", nota: 4.9, avaliacoes: 842, fotos: 312, servicos: 19, categorias: 4, site: true, distancia: 1.4, x: 38, y: 36 },
  { id: "b", nome: "Clínica Sorriso", nota: 4.8, avaliacoes: 421, fotos: 187, servicos: 16, categorias: 3, site: true, distancia: 2.1, x: 66, y: 40 },
  { id: "c", nome: "Concorrente C", nota: 4.7, avaliacoes: 198, fotos: 93, servicos: 14, categorias: 3, site: true, distancia: 3.2, x: 58, y: 70 },
  { id: "d", nome: "Odonto Centro", nota: 4.5, avaliacoes: 264, fotos: 120, servicos: 15, categorias: 4, site: false, distancia: 4.1, x: 25, y: 62 },
  { id: "e", nome: "Dental Prime", nota: 4.6, avaliacoes: 151, fotos: 64, servicos: 10, categorias: 2, site: true, distancia: 0.9, x: 45, y: 58 },
  { id: "f", nome: "Sorria Mais", nota: 4.3, avaliacoes: 98, fotos: 41, servicos: 9, categorias: 2, site: false, distancia: 7.8, x: 82, y: 22 },
  { id: "g", nome: "Clínica Vitta", nota: 4.8, avaliacoes: 305, fotos: 150, servicos: 17, categorias: 3, site: true, distancia: 2.7, x: 72, y: 60 },
];

/** Inove Score: 35% avaliações, 25% nota, 20% fotos, 10% serviços, 10% categorias */
export function score(e: Empresa) {
  const max = { av: 842, fo: 312, se: 19, ca: 4 };
  const s =
    0.35 * Math.min(1, Math.log(e.avaliacoes + 1) / Math.log(max.av + 1)) +
    0.25 * Math.max(0, (e.nota - 3.5) / 1.5) +
    0.2 * Math.min(1, e.fotos / max.fo) +
    0.1 * Math.min(1, e.servicos / max.se) +
    0.1 * Math.min(1, e.categorias / max.ca);
  return Math.round(s * 100);
}

export const ranking = () => [...empresas].sort((a, b) => score(b) - score(a));
export const voce = empresas[0]!;
export const lider = () => ranking().filter((e) => !e.voce)[0]!;
export const posicao = () => ranking().findIndex((e) => e.voce) + 1;
export const media = (k: "avaliacoes" | "fotos" | "nota" | "servicos" | "categorias") => {
  const o = empresas.filter((e) => !e.voce);
  return o.reduce((s, e) => s + e[k], 0) / o.length;
};

export type Keyword = { termo: string; volume: number; cpc: number; concorrencia: "Alta" | "Média" | "Baixa"; posicao: number | null };
export function pesquisarKeywords(q: string): Keyword[] {
  const base = q.trim().toLowerCase() || "dentista londrina";
  const [servico = "dentista", cidade = "londrina"] = base.split(" ");
  const seed = [...base].reduce((s, c) => s + c.charCodeAt(0), 0);
  const variações = [
    [`${servico} ${cidade}`, 1900, 4.8, "Alta"], [`${servico} perto de mim`, 1000, 3.9, "Alta"],
    [`clínica odontológica ${cidade}`, 720, 4.1, "Média"], [`implante dentário ${cidade}`, 480, 7.2, "Média"],
    [`clareamento dental ${cidade}`, 390, 3.2, "Baixa"], [`${servico} 24 horas ${cidade}`, 320, 5.4, "Média"],
    [`ortodontista ${cidade}`, 590, 4.4, "Alta"], [`${servico} infantil ${cidade}`, 210, 2.9, "Baixa"],
  ] as const;
  return variações.map(([termo, v, c, conc], i) => ({
    termo, volume: Math.round(v * (0.8 + ((seed + i * 7) % 5) / 10)),
    cpc: c, concorrencia: conc, posicao: (seed + i) % 4 === 0 ? null : ((seed + i * 3) % 14) + 1,
  }));
}
