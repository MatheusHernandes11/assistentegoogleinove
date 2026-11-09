import { buscarCoordenadasBrasil, normalizarTexto } from "./geo-brasil";

export type Empresa = {
  id: string; placeId?: string; nome: string; nota: number; avaliacoes: number; fotos: number;
  categorias: number; site: boolean; distancia: number; lat: number; lng: number; x: number; y: number; voce?: boolean;
};

export type Perfil = { nome: string; cidade: string; uf?: string; endereco: string; segmento: string; raio: number };

export const empresa: Perfil & { ultimaAvaliacao: string | null; centro: { lat: number; lng: number } | null; real: boolean } = {
  nome: "", cidade: "", uf: "", endereco: "", segmento: "", raio: 5, ultimaAvaliacao: null, centro: null, real: false,
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
    if (raw) {
      aplicarAuditoria(JSON.parse(raw));
      return;
    }
  } catch { /* ignora */ }

  // Carrega exemplo inicial padrão para não iniciar com tela vazia
  const exemploInicial: Auditoria = gerarAuditoriaNacional({
    nome: "Clínica Odonto Prime",
    cidade: "São Paulo",
    uf: "SP",
    endereco: "Av. Paulista",
    segmento: "Clínica Odontológica",
    raio: 5,
  });
  aplicarAuditoria(exemploInicial);
}

export const assinar = (f: () => void) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; };
export const lerVersao = () => versao;

/** Gerador de Inteligência de Mercado Nacional para qualquer cidade do Brasil */
export function gerarAuditoriaNacional(perfil: Perfil): Auditoria {
  const geo = buscarCoordenadasBrasil(perfil.cidade, perfil.uf);
  const centro = { lat: geo.lat, lng: geo.lng };
  const raioKm = perfil.raio || 5;

  const seg = perfil.segmento.trim() || "Empresa";
  const cid = perfil.cidade.trim() || "Brasil";

  // Nomes de concorrentes líderes e locais verossímeis
  const nomesPorSegmento: Record<string, string[]> = {
    odonto: [
      `Instituto Odontológico ${cid}`,
      `Sorriso & Arte Odonto Prime`,
      `OdontoCenter 24 Horas Especializada`,
      `Clínica Dental Excellence`,
      `Inovare Implantes e Estética`,
      `Oral Sin ${cid} Centro`,
      `Dra. Juliana Mendes Ortodontia`,
    ],
    barber: [
      `Barbearia Dom ${cid}`,
      `The Barber Club Premium`,
      `Cavalera Barbearia & Estilo`,
      `Barbearia VIP Central`,
      `Navalha de Ouro Barba & Cabelo`,
      `Vintage Barber & Beer`,
    ],
    advog: [
      `Almeida & Associados Advocacia`,
      `Silva & Mendes Advogados Especialistas`,
      `Mattos & Advogados Associados`,
      `Soluções Jurídicas ${cid}`,
      `Dra. Fernanda Mattos Advocacia`,
    ],
    auto: [
      `Auto Center ${cid} Prime`,
      `Mecânica e Injeção Central`,
      `PitStop Serviços Automotivos`,
      `Oficina Brasil Centro Automotivo`,
      `Precision Mecânica Especializada`,
    ],
    restaurante: [
      `Cantina & Empório ${cid}`,
      `Bistrô do Chef Gastronomia`,
      `Restaurante Sabor & Arte`,
      `Villa Gourmet Restaurante`,
      `Steakhouse & Grill ${cid}`,
    ],
    estetica: [
      `Clínica Sublime Estética & Laser`,
      `Espaço Harmonize Face & Corpo`,
      `Instituto de Beleza & Estética Avançada`,
      `Clínica Dermo Laser ${cid}`,
      `Espaço Bella Estética Integrada`,
    ],
  };

  const sNorm = normalizarTexto(seg);
  let listaNomes = nomesPorSegmento["odonto"]!;
  for (const [k, v] of Object.entries(nomesPorSegmento)) {
    if (sNorm.includes(k)) {
      listaNomes = v;
      break;
    }
  }

  // Gera distribuição geográfica realista em torno do centro
  const concorrentes: Omit<Empresa, "id" | "voce" | "x" | "y">[] = listaNomes.map((nome, i) => {
    const angulo = (i * (360 / listaNomes.length) + (i * 15)) * (Math.PI / 180);
    const dist = Math.round((0.5 + (i * (raioKm - 0.7) / listaNomes.length)) * 10) / 10;
    const dLat = (dist / 111) * Math.cos(angulo);
    const dLng = (dist / (111 * Math.cos((centro.lat * Math.PI) / 180))) * Math.sin(angulo);

    const isLider = i === 0;
    return {
      placeId: `gen-c-${i}`,
      nome,
      endereco: `${cid} - Região Central`,
      nota: isLider ? 4.9 : Number((4.4 + ((i * 3) % 5) / 10).toFixed(1)),
      avaliacoes: isLider ? 680 + (i * 25) : Math.max(45, Math.round(480 / (i + 1))),
      fotos: isLider ? 140 : Math.max(18, Math.round(90 / (i + 1))),
      categorias: isLider ? 5 : Math.max(2, 4 - i),
      site: isLider || i % 2 === 0,
      lat: Number((centro.lat + dLat).toFixed(4)),
      lng: Number((centro.lng + dLng).toFixed(4)),
      distancia: dist,
    };
  });

  const voceEmpresa: Omit<Empresa, "id" | "voce" | "x" | "y"> = {
    placeId: "gen-voce",
    nome: perfil.nome,
    endereco: perfil.endereco ? `${perfil.endereco}, ${cid}` : cid,
    nota: 4.5,
    avaliacoes: 38,
    fotos: 14,
    categorias: 1,
    site: false,
    distancia: 0,
    lat: centro.lat,
    lng: centro.lng,
  };

  const diasAtras = 28;
  const dataUltima = new Date(Date.now() - (diasAtras * 86400000)).toISOString();

  return {
    perfil: {
      ...perfil,
      cidade: geo.nomeFormatado || perfil.cidade,
    },
    resultado: {
      voce: voceEmpresa,
      concorrentes,
      ultimaAvaliacao: dataUltima,
      centro,
    },
  };
}

/** Estimativas de volume */
export function sugerirTermos(segmento: string, cidade: string) {
  const s = segmento.toLowerCase(), c = cidade.toLowerCase();
  return [`${s} ${c}`, `${s} perto de mim`, `melhor ${s} ${c}`, `${s} 24 horas ${c}`, `${s} preço ${c}`];
}

export type Keyword = { termo: string; volume: number; cpc: number; concorrencia: "Alta" | "Média" | "Baixa"; posicao: number | null };
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
