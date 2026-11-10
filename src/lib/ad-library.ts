import { empresa, lider, concorrentes, type Empresa } from "./data";
import { normalizarTexto } from "./geo-brasil";

export type AnuncioConcorrente = {
  id: string;
  anunciante: string;
  dominio: string;
  urlFinal: string;
  formato: "Pesquisa Google" | "Google Maps Ads" | "Display";
  titulo1: string;
  titulo2: string;
  titulo3: string;
  descricao: string;
  sitelinks: string[];
  gatilhoPrincipal: string;
  palavrasAlvo: string[];
  cpcEstimado: number;
  linkTransparenciaGoogle: string;
};

export type PlayerNacional = {
  nome: string;
  dominio: string;
  nicho: string;
  estrategiaAds: string;
  palavrasMaisCompradas: { termo: string; cpcMedio: number; volume: number; intencao: string }[];
};

// Base de Inteligência dos Maiores Anunciantes do Google Ads por Nicho no Brasil
const BENCHMARK_PLAYERS_NACIONAIS: Record<string, PlayerNacional[]> = {
  consorcio: [
    {
      nome: "Consórcio Magalu",
      dominio: "consorciomagalu.com.br",
      nicho: "Consórcios",
      estrategiaAds: "Foco agressivo em simulação online com parcelas baixas e sem juros.",
      palavrasMaisCompradas: [
        { termo: "consórcio imobiliário sem juros", cpcMedio: 14.5, volume: 18100, intencao: "Fundo de Funil 🔥" },
        { termo: "simular consórcio de imóveis", cpcMedio: 16.2, volume: 14800, intencao: "Alta Conversão 💎" },
        { termo: "consórcio de carros parcelas baixas", cpcMedio: 11.8, volume: 22000, intencao: "Fundo de Funil 🔥" },
        { termo: "melhor consórcio contemplação rápida", cpcMedio: 18.0, volume: 8900, intencao: "Oportunidade Ouro 🏆" },
      ],
    },
    {
      nome: "Rodobens Consórcios",
      dominio: "rodobens.com.br",
      nicho: "Consórcios",
      estrategiaAds: "Anúncios focados em autoridade, tradição e atendimento consultivo por WhatsApp.",
      palavrasMaisCompradas: [
        { termo: "consórcio contemplado tabela", cpcMedio: 19.5, volume: 12500, intencao: "Fundo de Funil 🔥" },
        { termo: "como funciona lance embutido consorcio", cpcMedio: 9.8, volume: 6700, intencao: "Meio de Funil ⚖️" },
        { termo: "carta de crédito imobiliária", cpcMedio: 15.4, volume: 9800, intencao: "Alta Conversão 💎" },
      ],
    },
    {
      nome: "Embracon Consórcios",
      dominio: "embracon.com.br",
      nicho: "Consórcios",
      estrategiaAds: "Captação direta de leads com simuladores de parcelas reduzidas.",
      palavrasMaisCompradas: [
        { termo: "consórcio imobiliário taxa de administração", cpcMedio: 12.0, volume: 7200, intencao: "Meio de Funil ⚖️" },
        { termo: "comprar carta contemplada segura", cpcMedio: 21.0, volume: 8300, intencao: "Fundo de Funil 🔥" },
      ],
    },
  ],
  odonto: [
    {
      nome: "Oral Sin Implantes",
      dominio: "oralsin.com.br",
      nicho: "Odontologia",
      estrategiaAds: "Domínio de termos de implante dentário, prótese fixa e avaliação imediata.",
      palavrasMaisCompradas: [
        { termo: "implante dentário carga imediata preço", cpcMedio: 9.8, volume: 27100, intencao: "Fundo de Funil 🔥" },
        { termo: "protocolo dentário valor", cpcMedio: 12.5, volume: 14200, intencao: "Alta Conversão 💎" },
        { termo: "dentista especialista em implantes", cpcMedio: 8.4, volume: 18500, intencao: "Fundo de Funil 🔥" },
        { termo: "clareamento dental a laser preço", cpcMedio: 5.6, volume: 22400, intencao: "Oportunidade Ouro 🏆" },
      ],
    },
    {
      nome: "OdontoCompany",
      dominio: "odontocompany.com",
      nicho: "Odontologia",
      estrategiaAds: "Campanhas focadas em tratamentos acessíveis, parcelamento no boleto e localização próxima.",
      palavrasMaisCompradas: [
        { termo: "aparelho invisível parcelado", cpcMedio: 7.9, volume: 19800, intencao: "Alta Conversão 💎" },
        { termo: "dentista aberto sábado perto de mim", cpcMedio: 8.2, volume: 15400, intencao: "Fundo de Funil 🔥" },
        { termo: "tratamento de canal sem dor", cpcMedio: 6.8, volume: 11200, intencao: "Fundo de Funil 🔥" },
      ],
    },
  ],
  advocacia: [
    {
      nome: "Escritórios de Referência Nacional",
      dominio: "jusbrasil.com.br",
      nicho: "Advocacia",
      estrategiaAds: "Foco em direitos trabalhistas de alta rescisão, INSS, divórcio e revisão bancária.",
      palavrasMaisCompradas: [
        { termo: "advogado trabalhista online whatsapp", cpcMedio: 18.5, volume: 24500, intencao: "Fundo de Funil 🔥" },
        { termo: "cálculo rescisão rescisória advogado", cpcMedio: 14.0, volume: 16800, intencao: "Alta Conversão 💎" },
        { termo: "revisão da vida toda inss advogado", cpcMedio: 22.0, volume: 19500, intencao: "Fundo de Funil 🔥" },
        { termo: "advogado divórcio rápido pensão alimentícia", cpcMedio: 15.2, volume: 13400, intencao: "Alta Conversão 💎" },
      ],
    },
  ],
  barber: [
    {
      nome: "Redes Premium de Barbearia",
      dominio: "barbeariacorleone.com.br",
      nicho: "Barbearia",
      estrategiaAds: "Agendamento online imediato, corte degradê e experiência premium com chopp.",
      palavrasMaisCompradas: [
        { termo: "melhor barbearia aberta agora", cpcMedio: 3.4, volume: 33000, intencao: "Fundo de Funil 🔥" },
        { termo: "agendar corte masculino online", cpcMedio: 2.9, volume: 18200, intencao: "Alta Conversão 💎" },
        { termo: "barba terapia e corte social", cpcMedio: 3.1, volume: 9500, intencao: "Oportunidade Ouro 🏆" },
      ],
    },
  ],
  estetica: [
    {
      nome: "Clínicas de Harmonização & Laser",
      dominio: "espacolaser.com.br",
      nicho: "Estética",
      estrategiaAds: "Ofertas de pacotes com sessões cortesia e foco em depilação e botox parcelado.",
      palavrasMaisCompradas: [
        { termo: "botox preventivo valor sessão", cpcMedio: 8.9, volume: 29000, intencao: "Fundo de Funil 🔥" },
        { termo: "harmonização facial antes e depois preço", cpcMedio: 11.2, volume: 18500, intencao: "Alta Conversão 💎" },
        { termo: "depilação a laser virilha e axila promoção", cpcMedio: 6.8, volume: 38000, intencao: "Fundo de Funil 🔥" },
      ],
    },
  ],
};

/** Gera o link oficial da Biblioteca de Anúncios do Google (Google Ads Transparency Center) */
export function gerarLinkGoogleAdsTransparency(termoOuDominio: string): string {
  const busca = encodeURIComponent(termoOuDominio.trim());
  return `https://adstransparency.google.com/?region=BR&query=${busca}`;
}

/** Gera lista de anúncios verossímeis de concorrentes para demonstrar ao cliente */
export function gerarAnunciosConcorrentes(listaConcs?: Empresa[]): AnuncioConcorrente[] {
  const seg = empresa.segmento || "Consórcios";
  const cid = empresa.cidade || "Londrina";
  const concs = listaConcs && listaConcs.length > 0 ? listaConcs : concorrentes();
  const topLider = lider();

  const alvos = [
    { nome: topLider.nome !== "—" ? topLider.nome : `Líder em ${seg}`, dist: topLider.distancia || 1.8 },
    ...concs.slice(0, 3).map((c) => ({ nome: c.nome, dist: c.distancia })),
  ];

  return alvos.map((item, idx) => {
    const nomeLimpo = item.nome.split("|")[0]?.split("-")[0]?.trim() || item.nome;
    const dom = `${normalizarTexto(nomeLimpo).replace(/\s+/g, "")}.com.br`;

    return {
      id: `ad-${idx}`,
      anunciante: nomeLimpo,
      dominio: dom,
      urlFinal: `https://www.${dom}/oferta-especial`,
      formato: idx === 0 ? "Pesquisa Google" : "Google Maps Ads",
      titulo1: `${seg} em ${cid} | ${nomeLimpo}`,
      titulo2: idx % 2 === 0 ? "Simulação Online em 2 Minutos" : "Condições Exclusivas sem Juros",
      titulo3: "Atendimento Rápido via WhatsApp",
      descricao: `Especialistas em ${seg} em ${cid}. Compare as melhores taxas, planos personalizados e atendimento humanizado. Fale com nossa equipe agora mesmo e garanta sua vaga.`,
      sitelinks: [
        `Simular ${seg}`,
        "Tabela de Parcelas",
        "Depoimentos de Clientes",
        "Chamar no WhatsApp",
      ],
      gatilhoPrincipal: idx === 0 ? "Velocidade & Atendimento Online" : "Sem Juros & Facilidade de Pagamento",
      palavrasAlvo: [
        `${seg.toLowerCase()} em ${cid.toLowerCase()}`,
        `melhor ${seg.toLowerCase()} ${cid.toLowerCase()}`,
        `orçamento ${seg.toLowerCase()}`,
        `${seg.toLowerCase()} perto de mim`,
      ],
      cpcEstimado: Number((6.5 + idx * 2.2).toFixed(2)),
      linkTransparenciaGoogle: gerarLinkGoogleAdsTransparency(nomeLimpo),
    };
  });
}

/** Retorna benchmarks nacionais do nicho para mostrar ao cliente o que os grandes players compram */
export function obterBenchmarkNacional(segmento?: string): PlayerNacional[] {
  const seg = normalizarTexto(segmento || empresa.segmento || "consorcio");

  for (const [chave, lista] of Object.entries(BENCHMARK_PLAYERS_NACIONAIS)) {
    if (seg.includes(chave) || chave.includes(seg)) {
      return lista;
    }
  }

  // Fallback para qualquer segmento do Brasil
  const segLimpo = empresa.segmento || "Serviços";
  return [
    {
      nome: `Líderes Nacionais de ${segLimpo}`,
      dominio: "google.com.br",
      nicho: segLimpo,
      estrategiaAds: `Campanhas focadas em palavras de alta intenção comercial e resposta imediata.`,
      palavrasMaisCompradas: [
        { termo: `${segLimpo.toLowerCase()} contratação imediata`, cpcMedio: 8.5, volume: 14200, intencao: "Fundo de Funil 🔥" },
        { termo: `melhor empresa de ${segLimpo.toLowerCase()}`, cpcMedio: 7.2, volume: 9800, intencao: "Alta Conversão 💎" },
        { termo: `orçamento online ${segLimpo.toLowerCase()}`, cpcMedio: 6.9, volume: 16500, intencao: "Oportunidade Ouro 🏆" },
        { termo: `${segLimpo.toLowerCase()} preço médio`, cpcMedio: 5.8, volume: 11000, intencao: "Meio de Funil ⚖️" },
      ],
    },
  ];
}
