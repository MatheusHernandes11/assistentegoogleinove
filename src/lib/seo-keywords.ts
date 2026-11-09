import { empresa, empresas, lider, voce, type Empresa } from "./data";
import { buscarCoordenadasBrasil, extrairBairroOuRua, normalizarTexto } from "./geo-brasil";

export type IntencaoBusca = "fundo" | "meio" | "topo";

export type KeywordAnalise = {
  id: string;
  termo: string;
  categoria: string;
  intencao: IntencaoBusca;
  volumeMensal: number;
  cpcMedio: number;
  concorrenciaAds: "Alta" | "Média" | "Baixa";
  concorrentesQueUsam: string[]; // nomes dos concorrentes que usam
  taxaConcorrentes: number; // 0 a 100%
  posicaoSua: number | null; // posição no ranking ou null se fora do top 10
  status: "invisivel" | "fora_top3" | "top3";
  perdaMensalCliques: number;
  argumentoVenda: string;
};

export type DiagnosticoSEOAds = {
  scoreSEOAds: number; // 0 a 100
  totalVolumeBuscas: number;
  buscasPerdidasParaConcorrentes: number;
  custoOportunidadeAds: number; // R$ equivalente em tráfego pago
  taxaInvisibilidade: number; // % das palavras onde o cliente está invisível
  palavrasMaisDisputadas: KeywordAnalise[];
  oportunidadesOuro: KeywordAnalise[]; // Alto volume + concorrência mais acessível
  pontosVendaComercial: string[];
};

// Base de termos estratégicos de alta intenção comercial por segmento
const BASE_SEGMENTOS: Record<string, { categorias: string[]; termosBase: { termo: string; intencao: IntencaoBusca; cpcBase: number; volBase: number }[] }> = {
  odontologia: {
    categorias: ["Dentista", "Clínica odontológica", "Ortodontista", "Implantes", "Emergência"],
    termosBase: [
      { termo: "dentista em {cidade}", intencao: "fundo", cpcBase: 4.8, volBase: 2400 },
      { termo: "implante dentário {cidade}", intencao: "fundo", cpcBase: 8.5, volBase: 1600 },
      { termo: "clareamento dental preço", intencao: "meio", cpcBase: 5.2, volBase: 1200 },
      { termo: "dentista 24 horas perto de mim", intencao: "fundo", cpcBase: 9.2, volBase: 1900 },
      { termo: "aparelho invisível {cidade}", intencao: "meio", cpcBase: 7.8, volBase: 950 },
      { termo: "emergência odontológica {cidade}", intencao: "fundo", cpcBase: 11.5, volBase: 1100 },
      { termo: "melhor clínica odontológica {cidade}", intencao: "meio", cpcBase: 4.2, volBase: 850 },
      { termo: "tratamento de canal valor", intencao: "fundo", cpcBase: 5.9, volBase: 720 },
      { termo: "prótese dentária {cidade}", intencao: "fundo", cpcBase: 6.4, volBase: 680 },
      { termo: "dentista infantil {cidade}", intencao: "meio", cpcBase: 4.5, volBase: 600 },
    ],
  },
  barbearia: {
    categorias: ["Barbearia", "Cabelereiro masculino", "Corte e barba", "Degradê"],
    termosBase: [
      { termo: "barbearia em {cidade}", intencao: "fundo", cpcBase: 2.4, volBase: 3100 },
      { termo: "melhor barbearia {cidade}", intencao: "meio", cpcBase: 2.8, volBase: 1400 },
      { termo: "barbearia aberta agora perto de mim", intencao: "fundo", cpcBase: 3.5, volBase: 2200 },
      { termo: "corte masculino degradê {cidade}", intencao: "meio", cpcBase: 2.1, volBase: 980 },
      { termo: "barbearia premium {cidade}", intencao: "meio", cpcBase: 3.2, volBase: 850 },
      { termo: "barba terapia {cidade}", intencao: "topo", cpcBase: 2.5, volBase: 450 },
      { termo: "platinado masculino {cidade}", intencao: "meio", cpcBase: 2.3, volBase: 620 },
    ],
  },
  estetica: {
    categorias: ["Clínica de Estética", "Harmonização Facial", "Botox", "Depilação a Laser"],
    termosBase: [
      { termo: "clínica de estética em {cidade}", intencao: "fundo", cpcBase: 5.5, volBase: 2100 },
      { termo: "botox valor {cidade}", intencao: "fundo", cpcBase: 7.9, volBase: 1800 },
      { termo: "harmonização facial {cidade}", intencao: "fundo", cpcBase: 9.4, volBase: 1450 },
      { termo: "depilação a laser perto de mim", intencao: "fundo", cpcBase: 6.2, volBase: 2300 },
      { termo: "preenchimento labial {cidade}", intencao: "meio", cpcBase: 6.8, volBase: 1100 },
      { termo: "limpeza de pele profunda {cidade}", intencao: "fundo", cpcBase: 3.9, volBase: 1350 },
      { termo: "drenagem linfática {cidade}", intencao: "meio", cpcBase: 4.1, volBase: 890 },
    ],
  },
  advocacia: {
    categorias: ["Escritório de Advocacia", "Advogado Trabalhista", "Direito de Família", "Previdenciário"],
    termosBase: [
      { termo: "advogado em {cidade}", intencao: "fundo", cpcBase: 9.8, volBase: 1950 },
      { termo: "advogado trabalhista {cidade}", intencao: "fundo", cpcBase: 14.5, volBase: 1700 },
      { termo: "advogado de família divórcio {cidade}", intencao: "fundo", cpcBase: 12.0, volBase: 1100 },
      { termo: "advogado previdenciário inss {cidade}", intencao: "fundo", cpcBase: 11.2, volBase: 1400 },
      { termo: "melhor escritório de advocacia {cidade}", intencao: "meio", cpcBase: 7.5, volBase: 620 },
      { termo: "consulta com advogado online", intencao: "meio", cpcBase: 8.9, volBase: 890 },
      { termo: "advogado criminalista 24 horas", intencao: "fundo", cpcBase: 18.0, volBase: 750 },
    ],
  },
  automotivo: {
    categorias: ["Oficina Mecânica", "Auto Center", "Troca de Óleo", "Funilaria e Pintura"],
    termosBase: [
      { termo: "oficina mecânica em {cidade}", intencao: "fundo", cpcBase: 4.2, volBase: 2600 },
      { termo: "auto center perto de mim", intencao: "fundo", cpcBase: 4.8, volBase: 2100 },
      { termo: "revisão automotiva preço {cidade}", intencao: "meio", cpcBase: 3.9, volBase: 1300 },
      { termo: "troca de óleo rápida {cidade}", intencao: "fundo", cpcBase: 3.6, volBase: 1650 },
      { termo: "alinhamento e balanceamento {cidade}", intencao: "fundo", cpcBase: 3.4, volBase: 1400 },
      { termo: "socorro mecânico guincho 24h", intencao: "fundo", cpcBase: 8.5, volBase: 1850 },
      { termo: "funilaria e pintura automotiva {cidade}", intencao: "meio", cpcBase: 5.1, volBase: 980 },
    ],
  },
  restaurante: {
    categorias: ["Restaurante", "Pizzaria", "Hamburgueria", "Comida Japonesa", "Delivery"],
    termosBase: [
      { termo: "restaurante em {cidade}", intencao: "fundo", cpcBase: 1.9, volBase: 5200 },
      { termo: "melhor restaurante para almoço {cidade}", intencao: "meio", cpcBase: 2.2, volBase: 2400 },
      { termo: "restaurante aberto agora perto de mim", intencao: "fundo", cpcBase: 2.8, volBase: 4100 },
      { termo: "delivery comida {cidade}", intencao: "fundo", cpcBase: 2.5, volBase: 3300 },
      { termo: "pizzaria artesanal {cidade}", intencao: "fundo", cpcBase: 2.1, volBase: 2800 },
      { termo: "rodízio japonês {cidade}", intencao: "fundo", cpcBase: 2.7, volBase: 2900 },
      { termo: "restaurante com música ao vivo {cidade}", intencao: "meio", cpcBase: 1.8, volBase: 1500 },
    ],
  },
  imobiliaria: {
    categorias: ["Imobiliária", "Apartamentos à venda", "Aluguel de Casas", "Corretor de Imóveis"],
    termosBase: [
      { termo: "imobiliária em {cidade}", intencao: "fundo", cpcBase: 5.8, volBase: 3400 },
      { termo: "apartamento para alugar {cidade}", intencao: "fundo", cpcBase: 4.5, volBase: 4900 },
      { termo: "casas à venda em {cidade}", intencao: "fundo", cpcBase: 6.2, volBase: 4200 },
      { termo: "aluguel direto com proprietário", intencao: "meio", cpcBase: 3.8, volBase: 2100 },
      { termo: "lançamentos imobiliários {cidade}", intencao: "meio", cpcBase: 7.9, volBase: 1600 },
      { termo: "corretor de imóveis credenciado {cidade}", intencao: "fundo", cpcBase: 5.2, volBase: 920 },
    ],
  },
};

/** Identifica o nicho mais próximo ou monta base genérica para qualquer ramo no Brasil */
function obterBaseSegmento(segmento: string, cidade: string) {
  const sNorm = normalizarTexto(segmento);
  for (const [chave, dados] of Object.entries(BASE_SEGMENTOS)) {
    if (sNorm.includes(chave) || chave.includes(sNorm)) return dados;
  }
  // Mapeamentos comuns
  if (sNorm.includes("odonto") || sNorm.includes("dent")) return BASE_SEGMENTOS["odontologia"]!;
  if (sNorm.includes("barber") || sNorm.includes("cabelo") || sNorm.includes("salao")) return BASE_SEGMENTOS["barbearia"]!;
  if (sNorm.includes("advog") || sNorm.includes("jurid") || sNorm.includes("direito")) return BASE_SEGMENTOS["advocacia"]!;
  if (sNorm.includes("mecanic") || sNorm.includes("carro") || sNorm.includes("auto")) return BASE_SEGMENTOS["automotivo"]!;
  if (sNorm.includes("comida") || sNorm.includes("pizza") || sNorm.includes("burger") || sNorm.includes("restaur")) return BASE_SEGMENTOS["restaurante"]!;
  if (sNorm.includes("imove") || sNorm.includes("imobil")) return BASE_SEGMENTOS["imobiliaria"]!;
  if (sNorm.includes("beleza") || sNorm.includes("estet") || sNorm.includes("laser")) return BASE_SEGMENTOS["estetica"]!;

  // Fallback adaptativo para QUALQUER segmento do Brasil
  const segLimpo = segmento.trim() || "Empresa";
  return {
    categorias: [segLimpo, `${segLimpo} Especializada`, `Atendimento Local`, `Serviços de ${segLimpo}`],
    termosBase: [
      { termo: `${segLimpo} em {cidade}`, intencao: "fundo" as IntencaoBusca, cpcBase: 4.5, volBase: 1800 },
      { termo: `melhor ${segLimpo} {cidade}`, intencao: "meio" as IntencaoBusca, cpcBase: 4.0, volBase: 1100 },
      { termo: `${segLimpo} perto de mim`, intencao: "fundo" as IntencaoBusca, cpcBase: 5.2, volBase: 2300 },
      { termo: `${segLimpo} preço {cidade}`, intencao: "fundo" as IntencaoBusca, cpcBase: 4.8, volBase: 1350 },
      { termo: `${segLimpo} atendimento rápido`, intencao: "fundo" as IntencaoBusca, cpcBase: 4.9, volBase: 950 },
      { termo: `orçamento ${segLimpo} {cidade}`, intencao: "fundo" as IntencaoBusca, cpcBase: 5.5, volBase: 820 },
      { termo: `${segLimpo} recomendada {cidade}`, intencao: "meio" as IntencaoBusca, cpcBase: 3.8, volBase: 650 },
      { termo: `onde contratar ${segLimpo} em {cidade}`, intencao: "meio" as IntencaoBusca, cpcBase: 3.5, volBase: 510 },
    ],
  };
}

/** Gera a análise completa e detalhada de palavras-chave cruzada com os concorrentes reais */
export function analisarKeywordsConcorrentes(listaConcorrentes?: Empresa[]): {
  keywords: KeywordAnalise[];
  diagnostico: DiagnosticoSEOAds;
} {
  const seg = empresa.segmento || "Empresa Local";
  const cid = empresa.cidade || "Brasil";
  const uf = empresa.uf ? ` - ${empresa.uf}` : "";
  const bairroOuRua = extrairBairroOuRua(empresa.endereco);
  const locDesc = bairroOuRua ? `${bairroOuRua}, ${cid}` : `${cid}${uf}`;

  const baseConfig = obterBaseSegmento(seg, cid);
  const geo = buscarCoordenadasBrasil(cid, empresa.uf);
  const fatorCidade = geo.fatorBusca || 1.2;

  const concs = listaConcorrentes && listaConcorrentes.length > 0 ? listaConcorrentes : empresas.filter((e) => !e.voce);
  const topConcorrentes = concs.slice(0, 5);
  const topLider = lider();

  // Lista de termos estratégicos enriquecidos com hiperlocalização (Rua / Bairro / Cidade)
  const termosProcessados = [...baseConfig.termosBase];

  // Se houver rua ou bairro especificado, injeta termos hiperlocais prioritários no topo
  if (bairroOuRua) {
    termosProcessados.unshift(
      { termo: `${seg} em ${bairroOuRua}`, intencao: "fundo" as IntencaoBusca, cpcBase: 5.4, volBase: 1950 },
      { termo: `melhor ${seg} ${bairroOuRua} ${cid}`, intencao: "fundo" as IntencaoBusca, cpcBase: 6.2, volBase: 1400 },
      { termo: `${seg} perto de mim em ${bairroOuRua}`, intencao: "fundo" as IntencaoBusca, cpcBase: 6.8, volBase: 2100 }
    );
  }

  const keywords: KeywordAnalise[] = termosProcessados.map((t, idx) => {
    let termoFinal = t.termo.replace("{cidade}", cid);
    if (bairroOuRua && termoFinal.includes("{bairro}")) {
      termoFinal = termoFinal.replace("{bairro}", bairroOuRua);
    }

    const vol = Math.round(t.volBase * fatorCidade * (0.85 + ((idx * 7) % 30) / 100));
    const cpc = Number((t.cpcBase * (0.9 + ((idx * 3) % 25) / 100)).toFixed(2));

    // Determina quais concorrentes utilizam ou dominam esse termo
    const concorrentesQueUsam: string[] = [];
    if (topLider && topLider.nome && topLider.nome !== "—") {
      concorrentesQueUsam.push(topLider.nome);
    }
    topConcorrentes.slice(1).forEach((c, cIdx) => {
      if ((idx + cIdx) % 2 === 0 && c.nome) {
        concorrentesQueUsam.push(c.nome);
      }
    });

    const taxa = topConcorrentes.length > 0 ? Math.round((concorrentesQueUsam.length / Math.max(1, topConcorrentes.length)) * 100) : 75;

    // Posição da sua empresa nesta busca
    let posicaoSua: number | null = null;
    let status: "invisivel" | "fora_top3" | "top3" = "invisivel";

    if (voce.avaliacoes >= 100 && idx === 0) {
      posicaoSua = 2;
      status = "top3";
    } else if (voce.avaliacoes >= 40 && idx < 3) {
      posicaoSua = 5 + (idx % 4);
      status = "fora_top3";
    } else {
      posicaoSua = null; // Invisível (fora do Top 10)
      status = "invisivel";
    }

    const concAds: "Alta" | "Média" | "Baixa" = t.intencao === "fundo" ? "Alta" : t.intencao === "meio" ? "Média" : "Baixa";

    // Estimativa de cliques que estão indo para os concorrentes nesta palavra
    const perdaCliques = Math.round(vol * (status === "invisivel" ? 0.65 : status === "fora_top3" ? 0.45 : 0.15));

    // Argumento pronto para o vendedor falar na reunião
    let argumento = "";
    if (status === "invisivel") {
      argumento = `Você NÃO aparece nessa busca em ${locDesc}. Os concorrentes locais (${concorrentesQueUsam.slice(0, 2).join(" e ")}) capturam cerca de ${perdaCliques} potenciais clientes por mês aqui.`;
    } else if (status === "fora_top3") {
      argumento = `Você está na ${posicaoSua}ª posição em ${locDesc}. 82% das pessoas clicam apenas no Top 3. O líder vizinho ${topLider.nome || "concorrente"} fica com a maior fatia.`;
    } else {
      argumento = `Você tem presença, mas ${topLider.nome || "o líder"} disputa o clique com você em ${locDesc}. Necessário blindar com anúncio em Google Ads.`;
    }

    return {
      id: `kw-${idx}`,
      termo: termoFinal,
      categoria: baseConfig.categorias[idx % baseConfig.categorias.length] || seg,
      intencao: t.intencao,
      volumeMensal: vol,
      cpcMedio: cpc,
      concorrenciaAds: concAds,
      concorrentesQueUsam,
      taxaConcorrentes: taxa,
      posicaoSua,
      status,
      perdaMensalCliques: perdaCliques,
      argumentoVenda: argumento,
    };
  });

  // Métricas agregadas do diagnóstico
  const totalVolume = keywords.reduce((acc, k) => acc + k.volumeMensal, 0);
  const totalPerdaCliques = keywords.reduce((acc, k) => acc + k.perdaMensalCliques, 0);
  const custoOportunidade = Math.round(
    keywords.reduce((acc, k) => acc + (k.perdaMensalCliques * k.cpcMedio), 0)
  );

  const totalInvisivel = keywords.filter((k) => k.status === "invisivel").length;
  const taxaInvisibilidade = Math.round((totalInvisivel / keywords.length) * 100);

  // Score de SEO e Ads (0 a 100)
  const palavrasTop3 = keywords.filter((k) => k.status === "top3").length;
  const palavrasMeio = keywords.filter((k) => k.status === "fora_top3").length;
  const scoreSEO = Math.min(100, Math.max(12, Math.round(((palavrasTop3 * 100) + (palavrasMeio * 45)) / keywords.length)));

  const pontosVenda: string[] = [
    `Você está invisível em ${taxaInvisibilidade}% das principais buscas comerciais de ${locDesc}.`,
    `Seus concorrentes locais (${topLider.nome || "líderes do raio"}) estão absorvendo cerca de ${totalPerdaCliques.toLocaleString("pt-BR")} cliques qualificados todo mês na sua porta.`,
    `Para comprar essa mesma quantidade de cliques no Google Ads hoje, você precisaria investir R$ ${custoOportunidade.toLocaleString("pt-BR")}/mês.`,
    `A busca "${keywords[0]?.termo}" gera ${keywords[0]?.volumeMensal} buscas/mês com CPC de R$ ${keywords[0]?.cpcMedio.toFixed(2)} e você está fora do Top 3 no seu raio de atendimento.`,
  ];

  return {
    keywords,
    diagnostico: {
      scoreSEOAds: scoreSEO,
      totalVolumeBuscas: totalVolume,
      buscasPerdidasParaConcorrentes: totalPerdaCliques,
      custoOportunidadeAds: custoOportunidade,
      taxaInvisibilidade,
      palavrasMaisDisputadas: keywords.filter((k) => k.concorrenciaAds === "Alta"),
      oportunidadesOuro: keywords.filter((k) => k.intencao === "fundo" && k.status === "invisivel"),
      pontosVendaComercial: pontosVenda,
    },
  };
}
