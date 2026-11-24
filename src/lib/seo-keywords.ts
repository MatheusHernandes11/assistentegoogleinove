import { empresa, empresas, lider, voce, type Empresa } from "./data";
import { buscarCoordenadasBrasil, extrairBairroOuRua, normalizarTexto } from "./geo-brasil";

export type IntencaoBusca = "fundo" | "meio" | "topo";

export type GatilhoComportamento =
  | "urgencia"
  | "preco_parcelamento"
  | "alto_ticket"
  | "confianca"
  | "hiperlocal";

export type TermoTemplate = {
  termo: string;
  intencao: IntencaoBusca;
  gatilho: GatilhoComportamento;
  rotuloGatilho: string;
  visaoGestorTrafego: string;
};

export type KeywordAnalise = {
  id: string;
  termo: string;
  categoria: string;
  intencao: IntencaoBusca;
  gatilho: GatilhoComportamento;
  rotuloGatilho: string;
  visaoGestorTrafego: string;
  volumeMensal: number;
  cpcMedio: number;
  concorrenciaAds: "Alta" | "Média" | "Baixa";
  concorrentesQueUsam: string[];
  taxaConcorrentes: number;
  posicaoSua: number | null;
  status: "invisivel" | "fora_top3" | "top3";
  perdaMensalCliques: number;
  argumentoVenda: string;
};

export type DiagnosticoSEOAds = {
  scoreSEOAds: number;
  totalVolumeBuscas: number;
  buscasPerdidasParaConcorrentes: number;
  custoOportunidadeAds: number;
  taxaInvisibilidade: number;
  palavrasMaisDisputadas: KeywordAnalise[];
  oportunidadesOuro: KeywordAnalise[];
  pontosVendaComercial: string[];
};

/**
 * BASE DE INTELIGÊNCIA DE TRÁFEGO PAGO & COMPORTAMENTO DO CONSUMIDOR BRASILEIRO
 * Mapeada com base em padrões de busca de alta conversão no Google Ads e Google Maps.
 */
/**
 * BASE DE INTELIGÊNCIA DE TRÁFEGO PAGO & COMPORTAMENTO DO CONSUMIDOR NOS ESTADOS UNIDOS (USA)
 * Focada na psicologia de compra americana: Free Estimates, Licensed & Insured, 0% APR, Emergency / Same Day, Google Guaranteed.
 */
const BASE_COMPORTAMENTAL_US: Record<
  string,
  { categorias: string[]; termos: TermoTemplate[] }
> = {
  financing_loans: {
    categorias: [
      "Refinanciamento de Veículo (Auto Loan)",
      "Linha de Crédito Imobiliária (HELOC)",
      "Empréstimos Pessoais",
      "Crédito Rápido Imobiliário (Hard Money)",
      "Financiamento Imobiliário",
    ],
    termos: [
      {
        termo: "auto loan refinance lowest interest rate {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Menor Parcela Mensal",
        visaoGestorTrafego:
          "Consumidor querendo reduzir a parcela mensal do carro trocando financiamento caro por taxas mais baixas.",
      },
      {
        termo: "home equity line of credit heloc low rates {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Crédito com Imóvel de Garantia",
        visaoGestorTrafego:
          "Proprietário usando a valorização do imóvel para captar $50k a $200k para reformas ou consolidação de dívidas.",
      },
      {
        termo: "first time home buyer mortgage loan programs {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Subsídios para Primeiro Imóvel",
        visaoGestorTrafego:
          "Comprador do primeiro imóvel buscando programas com entrada reduzida (FHA/Conventional) e subsídios.",
      },
      {
        termo: "hard money lenders fast approval real estate {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Investidor Imobiliário / Caixa Rápido",
        visaoGestorTrafego:
          "Investidor de fix-and-flip precisando de aprovação e dinheiro na conta em menos de 5 dias.",
      },
      {
        termo: "personal loans bad credit instant approval near me",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dinheiro de Emergência / Score Baixo",
        visaoGestorTrafego:
          "Pessoa com urgência de caixa buscando credores flexíveis para aprovação imediata.",
      },
      {
        termo: "licensed mortgage broker free consultation {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Correspondente Credenciado e Confiável",
        visaoGestorTrafego:
          "Consumidor buscando correspondente experiente para comparar dezenas de bancos e achar o melhor Custo Efetivo.",
      },
    ],
  },

  dentist: {
    categorias: [
      "Dentista de Emergência 24h",
      "Implantes Dentários",
      "Implantes All-on-4",
      "Ortodontia & Invisalign",
      "Estética Dental & Facetas",
    ],
    termos: [
      {
        termo: "emergency dentist open sunday near me",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dor de Dente Aguda / Aberto Hoje",
        visaoGestorTrafego:
          "Paciente com dor aguda no fim de semana. Quem tiver telefone no Google e atender de imediato recebe o paciente.",
      },
      {
        termo: "dental implants cost without insurance {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Custo Alto Sem Convênio Dental",
        visaoGestorTrafego:
          "Americano sem seguro dental cotando implante unitário ($3k-$5k) e buscando planos de pagamento.",
      },
      {
        termo: "all on 4 dental implants cost monthly payment {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Reconstrução Bucal Total ($15k-$30k)",
        visaoGestorTrafego:
          "Paciente com perda de múltiplos dentes buscando reabilitação total fixa com financiamento CareCredit/LendingClub.",
      },
      {
        termo: "invisalign payment plan 0 apr financing {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Alinhadores Invisíveis em Parcelas 0% Juros",
        visaoGestorTrafego:
          "Adulto que trabalha com imagem querendo alinhar o sorriso com parcelas sem juros de $150 a $250/mês.",
      },
      {
        termo: "wisdom teeth removal same day consultation {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dor no Dente do Siso / Extração Urgente",
        visaoGestorTrafego:
          "Jovem ou estudante com siso inflamado querendo consulta e extração sem fila.",
      },
      {
        termo: "walk in dentist accepting new patients today {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Atendimento Imediato Sem Agendamento",
        visaoGestorTrafego:
          "Paciente que quer ser atendido hoje mesmo sem esperar semanas por um agendamento.",
      },
      {
        termo: "top rated cosmetic dentist 5 star reviews {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Avaliações 5 Estrelas Verificadas",
        visaoGestorTrafego:
          "Paciente cotando facetas de porcelana e clareamento que só confia em dentistas com centenas de reviews positivos.",
      },
    ],
  },

  legal_lawyer: {
    categorias: [
      "Acidentes & Danos Pessoais",
      "Advogado de Acidente de Carro",
      "Divórcio & Direito de Família",
      "Defesa Criminal & Trânsito (DUI)",
      "Advogado de Imigração & Vistos",
    ],
    termos: [
      {
        termo: "personal injury lawyer free consultation no win no fee {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Contrato de Risco (Sem Custos Iniciais)",
        visaoGestorTrafego:
          "Vítima de acidente querendo contratar sem custos iniciais, pagando apenas porcentagem da indenização ganha.",
      },
      {
        termo: "car accident attorney call now 24/7 near me",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Ligação Imediata Pós-Acidente",
        visaoGestorTrafego:
          "Acidente de trânsito ocorrido há poucas horas. A pessoa liga do local ou do hospital para saber seus direitos.",
      },
      {
        termo: "divorce lawyer flat fee uncontested {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Honorários Fechados Sem Surpresa",
        visaoGestorTrafego:
          "Casal querendo divórcio consensual sem custos surpresa de horas faturadas.",
      },
      {
        termo: "dui defense attorney emergency consultation {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Risco de Prisão / Suspensão de Carteira",
        visaoGestorTrafego:
          "Pessoa detida por blitz/álcool com audiência marcada precisando de advogado criminalista de plantão.",
      },
      {
        termo: "immigration lawyer green card visa specialist {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Vistos & Regularização Imigratória",
        visaoGestorTrafego:
          "Imigrante ou empresa patrocinadora buscando regularização, green card ou visto EB-2 / EB-3 / O-1.",
      },
      {
        termo: "best rated injury law firm licensed {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Escritório Renomado & Licenciado",
        visaoGestorTrafego:
          "Cliente checando autoridade do escritório, vitórias passadas e milhões recuperados em acordos.",
      },
    ],
  },

  home_services: {
    categorias: [
      "Encanador de Emergência 24/7",
      "Conserto de Ar-Condicionado (HVAC)",
      "Empreiteiro de Telhados (Roofing)",
      "Eletricista Credenciado",
      "Controle de Pragas",
    ],
    termos: [
      {
        termo: "emergency plumber near me 24/7 leak repair",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Vazamento Grave / Alagamento Imediato",
        visaoGestorTrafego:
          "Cano estourado ou esgoto transbordando. O morador liga para a primeira empresa que atender a chamada no Google Maps.",
      },
      {
        termo: "ac repair same day service free estimate {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Onda de Calor / Conserto no Mesmo Dia",
        visaoGestorTrafego:
          "Ar condicionado parou de gelar no calor. Busca por técnicos locais com visita no mesmo dia e orçamento sem compromisso.",
      },
      {
        termo: "roof replacement licensed and insured contractor {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Telhado Novo / Licenciado e Assegurado",
        visaoGestorTrafego:
          "Troca de telhado danificado por tempestade. O americano só contrata profissionais certificados com seguro de responsabilidade civil.",
      },
      {
        termo: "licensed electrician emergency power outage near me",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Risco Elétrico / Faísca ou Curto",
        visaoGestorTrafego:
          "Queda de disjuntor principal ou cheiro de queimado exigindo eletricista certificado de plantão.",
      },
      {
        termo: "water heater replacement same day installation {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Aquecedor de Água / Instalação Imediata",
        visaoGestorTrafego:
          "Aquecedor quebrado e casa sem água quente. Busca por substituição imediata e preço justo.",
      },
    ],
  },

  auto_repair: {
    categorias: [
      "Troca de Pastilhas e Freios",
      "Diagnóstico de Injeção Eletrônica",
      "Conserto de Câmbio e Transmissão",
      "Mecânico Móvel a Domicílio 24/7",
      "Troca Rápida de Óleo",
    ],
    termos: [
      {
        termo: "brake repair same day service near me",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Ruído no Freio / Segurança Crítica",
        visaoGestorTrafego:
          "Pastilhas de freio gastas raspando no disco. Motorista buscando oficina mecânica para troca imediata.",
      },
      {
        termo: "check engine light free diagnostic estimate {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Scanner de Diagnóstico Gratuito",
        visaoGestorTrafego:
          "Luz no painel assustando o motorista, buscando oficina com scanner OBD2 gratuito para orçamento.",
      },
      {
        termo: "transmission repair shop warranty licensed {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Câmbio e Motor com Garantia Completa",
        visaoGestorTrafego:
          "Reparo de alto valor exigindo garantia por escrito de 2 a 3 anos e mecânicos certificados ASE.",
      },
      {
        termo: "mobile mechanic roadside assistance near me",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Carro Parado na Rua / Mecânico a Domicílio",
        visaoGestorTrafego:
          "Carro não liga na garagem ou na rua; o cliente quer mecânico móvel que venha consertar no local.",
      },
      {
        termo: "oil change drive thru coupon near me {cidade}",
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Troca de Óleo Express Sem Agendar",
        visaoGestorTrafego:
          "Serviço rápido de troca de óleo sem agendamento no caminho para o trabalho.",
      },
    ],
  },

  medspa_beauty: {
    categorias: [
      "Aplicação de Botox e Dysport",
      "Preenchimento Labial",
      "Depilação a Laser",
      "Limpeza de Pele e Peeling",
      "Barbearia e Salão de Beleza",
    ],
    termos: [
      {
        termo: "botox cost per unit medspa near me {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Preço por Unidade de Botox",
        visaoGestorTrafego:
          "Paciente cotando o preço por unidade de Botox/Dysport com foco em resultados naturais e clínicas médicas.",
      },
      {
        termo: "lip fillers 1ml natural look before and after {cidade}",
        intencao: "fundo",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Resultados Naturais e Fotos Antes/Depois",
        visaoGestorTrafego:
          "Consumidor exigindo fotos reais de antes e depois para evitar preenchimento labial artificial.",
      },
      {
        termo: "laser hair removal packages walk ins welcome {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Pacotes de Sessões de Laser com Desconto",
        visaoGestorTrafego:
          "Pacotes de depilação a laser com preços promocionais para pernas, axilas e corpo todo.",
      },
      {
        termo: "barbershop open now walk ins welcome near me",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Corte e Barba Sem Agendamento",
        visaoGestorTrafego:
          "Cliente precisando de corte de cabelo e barba sem ter agendado com dias de antecedência.",
      },
    ],
  },

  real_estate: {
    categorias: [
      "Casas à Venda",
      "Aluguel Sem Depósito Caução",
      "Imóveis Comerciais",
      "Corretores Campeões de Vendas",
      "Condomínios Fechados",
    ],
    termos: [
      {
        termo: "homes for sale with pool and fenced yard {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Casas com Piscina e Quintal Fechado",
        visaoGestorTrafego:
          "Família buscando moradia completa com piscina privativa e segurança.",
      },
      {
        termo: "no deposit apartments for rent move in ready {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Aluguel com Baixo Custo de Mudança",
        visaoGestorTrafego:
          "Inquilino querendo alugar sem desembolsar 3 meses de aluguel adiantado.",
      },
      {
        termo: "best real estate agent top producer reviews {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Corretor Top Producer com Avaliações",
        visaoGestorTrafego:
          "Comprador ou vendedor buscando os corretores mais experientes e bem avaliados da região.",
      },
    ],
  },

  restaurants: {
    categorias: [
      "Pizza Delivery Aberto até Tarde",
      "Hambúrgueres Artesanais",
      "Restaurantes para Família",
      "Varandas Pet Friendly",
      "Retirada Rápida no Carro (Curbside)",
    ],
    termos: [
      {
        termo: "best pizza delivery open late near me",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Comida Noturna / Entrega Super Rápida",
        visaoGestorTrafego:
          "Cliente faminto à noite buscando entrega rápida e pizza quente.",
      },
      {
        termo: "dog friendly restaurants outdoor patio {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Restaurante com Área Pet Friendly",
        visaoGestorTrafego:
          "Americanos com cachorros que só frequentam restaurantes com varanda pet-friendly.",
      },
      {
        termo: "online order takeout curbside pickup {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Retirada sem Sair do Carro (Curbside)",
        visaoGestorTrafego:
          "Consumidor encomendando refeição pelo celular para retirar no carro sem sair do veículo.",
      },
    ],
  },
};

/**
 * Motor Dinâmico de Tráfego USA: Seleciona estratégia e termos do mercado americano.
 */
function obterEstrategiaNichoUS(segmento: string, cidade: string) {
  const sNorm = normalizarTexto(segmento);

  if (sNorm.includes("consorc") || sNorm.includes("loan") || sNorm.includes("finan") || sNorm.includes("credit") || sNorm.includes("mortgage") || sNorm.includes("heloc")) {
    return BASE_COMPORTAMENTAL_US["financing_loans"]!;
  }
  if (sNorm.includes("dent") || sNorm.includes("odonto") || sNorm.includes("implant") || sNorm.includes("invisalign")) {
    return BASE_COMPORTAMENTAL_US["dentist"]!;
  }
  if (sNorm.includes("law") || sNorm.includes("attorney") || sNorm.includes("advog") || sNorm.includes("legal") || sNorm.includes("injury")) {
    return BASE_COMPORTAMENTAL_US["legal_lawyer"]!;
  }
  if (sNorm.includes("plumb") || sNorm.includes("roof") || sNorm.includes("hvac") || sNorm.includes("electric") || sNorm.includes("repar") || sNorm.includes("construct")) {
    return BASE_COMPORTAMENTAL_US["home_services"]!;
  }
  if (sNorm.includes("auto") || sNorm.includes("car") || sNorm.includes("mecanic") || sNorm.includes("brake") || sNorm.includes("tire") || sNorm.includes("mechanic")) {
    return BASE_COMPORTAMENTAL_US["auto_repair"]!;
  }
  if (sNorm.includes("medspa") || sNorm.includes("botox") || sNorm.includes("estet") || sNorm.includes("laser") || sNorm.includes("barber") || sNorm.includes("salon")) {
    return BASE_COMPORTAMENTAL_US["medspa_beauty"]!;
  }
  if (sNorm.includes("real estate") || sNorm.includes("realtor") || sNorm.includes("imove") || sNorm.includes("rent") || sNorm.includes("home") || sNorm.includes("apart")) {
    return BASE_COMPORTAMENTAL_US["real_estate"]!;
  }
  if (sNorm.includes("pizz") || sNorm.includes("restauran") || sNorm.includes("food") || sNorm.includes("bar") || sNorm.includes("burger")) {
    return BASE_COMPORTAMENTAL_US["restaurants"]!;
  }

  const segLimpo = segmento.trim() || "Serviço Local";
  return {
    categorias: [
      `${segLimpo} Licenciado & Assegurado`,
      `Emergência / Atendimento no Mesmo Dia`,
      `Orçamento Gratuito Sem Compromisso`,
      `Avaliações 5 Estrelas Comprovadas`,
      `Serviço Local Próximo de Mim`,
    ],
    termos: [
      {
        termo: `licensed and insured ${segLimpo} near me {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "confianca" as GatilhoComportamento,
        rotuloGatilho: "🏆 Prestador Licenciado & Assegurado",
        visaoGestorTrafego: `Consumidor americano exigindo certificação profissional e seguro de responsabilidade civil antes de contratar.`,
      },
      {
        termo: `best ${segLimpo} in {cidade} free estimate`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "preco_parcelamento" as GatilhoComportamento,
        rotuloGatilho: "💰 Orçamento Gratuito Sem Taxa de Visita",
        visaoGestorTrafego: `Cliente querendo orçamento prévio sem taxa de visita para comparar propostas.`,
      },
      {
        termo: `emergency ${segLimpo} open now same day service {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "urgencia" as GatilhoComportamento,
        rotuloGatilho: "🔥 Emergência no Mesmo Dia",
        visaoGestorTrafego: `Problema urgente que não pode esperar. Quem atender a ligação primeiro ganha o serviço.`,
      },
      {
        termo: `top rated ${segLimpo} 5 star reviews near me`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "confianca" as GatilhoComportamento,
        rotuloGatilho: "🏆 Avaliação 5 Estrelas Comprovada",
        visaoGestorTrafego: `Americano comparando avaliações no Google Maps antes de ligar ou agendar.`,
      },
      {
        termo: `${segLimpo} cost financing 0 apr monthly payment {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "preco_parcelamento" as GatilhoComportamento,
        rotuloGatilho: "💰 Financiamento 0% APR sem Juros",
        visaoGestorTrafego: `Consumidor buscando parcelamento sem juros via financiamento rápido para serviços de valor mais alto.`,
      },
      {
        termo: `walk in ${segLimpo} near me accepting new clients today`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "urgencia" as GatilhoComportamento,
        rotuloGatilho: "🔥 Atendimento Imediato Sem Fila",
        visaoGestorTrafego: `Cliente querendo atendimento no mesmo dia sem passar por semanas de espera.`,
      },
    ],
  };
}

const BASE_COMPORTAMENTAL_NICHOS: Record<
  string,
  { categorias: string[]; termos: TermoTemplate[] }
> = {
  consorcio: {
    categorias: [
      "Cartas Contempladas",
      "Consórcio Imobiliário",
      "Consórcio de Veículos",
      "Lance Embutido",
      "Planejamento Financeiro",
    ],
    termos: [
      {
        termo: "carta contemplada imobiliária pronta entrega {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dinheiro na Mão / Pronta Entrega",
        visaoGestorTrafego:
          "Cliente que já encontrou a casa ou terreno e tem capital de entrada. Quer crédito liberado na hora sem esperar sorteio mensal.",
      },
      {
        termo: "simulação consórcio imobiliário 200 mil parcela",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação de Parcela Real",
        visaoGestorTrafego:
          "Comprador com ticket definido querendo saber exatamente quanto vai pagar por mês antes de falar com vendedor.",
      },
      {
        termo: "carta de crédito 300 mil consórcio valor da parcela",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Ticket Médio Alto",
        visaoGestorTrafego:
          "Família buscando sobrado ou imóvel de médio/alto padrão comparando a parcela do consórcio com o financiamento da Caixa.",
      },
      {
        termo: "consorcio vale a pena ou financiamento imobiliário",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Decisão Racional / Fuga dos Juros",
        visaoGestorTrafego:
          "Lead qualificado assustado com o custo total do financiamento (pagar 3 imóveis ao banco) buscando economizar centenas de milhares de reais.",
      },
      {
        termo: "quanto precisa dar de lance para ser contemplado no consórcio",
        intencao: "meio",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dúvida Crítica de Fechamento",
        visaoGestorTrafego:
          "A principal objeção do comprador é a demora. Quem explicar a média real de lances do grupo fecha o contrato na reunião.",
      },
      {
        termo: "como funciona lance embutido no consórcio de imóvel",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Contemplação sem Descapitalizar",
        visaoGestorTrafego:
          "Cliente que quer antecipar a contemplação usando até 30% da própria carta de crédito para dar o lance vencedor.",
      },
      {
        termo: "consorcio de carro sem entrada parcelas reduzidas {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Troca de Veículo sem Juros",
        visaoGestorTrafego:
          "Motorista que não quer pagar o dobro do carro no financiamento bancário tradicional.",
      },
      {
        termo: "consorcio moto menor parcela mensal whatsapp {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Parcela de Entrada / Conversão Celular",
        visaoGestorTrafego:
          "Público de entrada ou entregador querendo parcelas de R$ 180 a R$ 300 direto pelo WhatsApp.",
      },
      {
        termo: "carta de crédito contemplada como não cair em golpe",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Medo de Golpe / Busca de Credibilidade",
        visaoGestorTrafego:
          "O maior pavor do comprador de consórcio é cair em fraude na internet. Empresas locais com centenas de avaliações no Google passam segurança total.",
      },
      {
        termo: "consorcio para comprar terreno e construir {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Projeto Familiar de Construção",
        visaoGestorTrafego:
          "Cliente com projeto de obra aprovado que quer usar a carta de crédito para pagar o lote e a construtora.",
      },
    ],
  },

  odontologia: {
    categorias: [
      "Implantes Dentários",
      "Protocolo Dentário",
      "Prótese Fixa",
      "Invisalign & Ortodontia",
      "Urgência & Canal",
    ],
    termos: [
      {
        termo: "quanto custa um implante dentário de um dente só {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação de Procedimento Unitário",
        visaoGestorTrafego:
          "Paciente com perda dentária visível querendo saber o valor exato da cirurgia e do dente definitivo antes da avaliação.",
      },
      {
        termo: "prótese dentária protocolo sobre 4 implantes preço parcelado {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Procedimento de Alto Ticket (All-on-4)",
        visaoGestorTrafego:
          "Consumidor querendo reabilitar a arcada inteira fixa. Procedimento de R$ 12.000 a R$ 35.000 com alta necessidade de parcelamento no boleto ou cartão.",
      },
      {
        termo: "dentista 24 horas aberto agora perto de mim",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dor Crítica / Urgência Imediata",
        visaoGestorTrafego:
          "Paciente com dor aguda insuportável no meio da noite ou fim de semana. Quem tiver o telefone visível no Google Maps leva o atendimento.",
      },
      {
        termo: "quanto custa arrancar dente do siso inflamado consulta hoje {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Inflamação / Resolução no Mesmo Dia",
        visaoGestorTrafego:
          "Consumidor com rosto inchado e dor ao mastigar procurando clínica para extração rápida sem esperar dias por vaga.",
      },
      {
        termo: "aparelho invisível invisalign valor e parcelas no boleto {cidade}",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Estética Adulta Premium",
        visaoGestorTrafego:
          "Adulto que trabalha com imagem e não quer usar aparelho metálico tradicional, cotando clínicas credenciadas na cidade.",
      },
      {
        termo: "clareamento dental a laser preço da sessão antes e depois {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Desejo Estético Rápido",
        visaoGestorTrafego:
          "Consumidor com casamento, formatura ou férias próximas querendo resultado visível em 1 ou 2 sessões.",
      },
      {
        termo: "dentista especialista em tratamento de canal sem dor {cidade}",
        intencao: "fundo",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Medo de Dor / Odontofobia",
        visaoGestorTrafego:
          "Paciente com trauma de dor procurando profissionais recomendados por anestesia indolor e tratamento humanizado.",
      },
      {
        termo: "melhor clínica odontológica de implantes avaliações 5 estrelas {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Escolha por Avaliações Reais",
        visaoGestorTrafego:
          "Paciente pesquisando a reputação antes de entregar a saúde bucal. Fichas com mais de 100 avaliações fecham o tratamento com facilidade.",
      },
    ],
  },

  advocacia: {
    categorias: [
      "Trabalhista Reclamante",
      "Direito de Família & Divórcio",
      "Previdenciário & INSS",
      "Inventário & Herança",
      "Bancário & Juros",
    ],
    termos: [
      {
        termo: "fui mandado embora sem justa causa quanto tenho direito a receber",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dor Imediata do Trabalhador",
        visaoGestorTrafego:
          "Trabalhador dispensado querendo saber se a rescisão foi calculada corretamente antes de assinar a homologação.",
      },
      {
        termo: "advogado trabalhista consulta online whatsapp {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Atendimento Rápido no WhatsApp",
        visaoGestorTrafego:
          "Cliente no celular que precisa tirar uma dúvida jurídica urgente sem ter que se deslocar até um escritório.",
      },
      {
        termo: "divórcio rápido no cartório quanto custa e como funciona {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Resolução Extrajudicial Ágil",
        visaoGestorTrafego:
          "Casal querendo oficializar a separação de forma consensual e rápida com partilha de bens sem desgaste de processo judicial.",
      },
      {
        termo: "pensão alimentícia atrasada pai não paga pode ser preso urgente",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Urgência Financeira Familiar",
        visaoGestorTrafego:
          "Mãe sem receber o sustento dos filhos precisando de execução judicial rápida e penhora de valores com advogado.",
      },
      {
        termo: "advogado para inventário em cartório honorários e custos {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Custo & Desbloqueio de Herança",
        visaoGestorTrafego:
          "Herdeiros precisando desbloquear imóveis, contas e veículos de parente falecido cotando custos de imposto e honorários.",
      },
      {
        termo: "processo contra banco juros abusivos financiamento de carro",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Alívio de Endividamento",
        visaoGestorTrafego:
          "Motorista com parcela de carro pesada buscando advogado para recalcular taxas ilegais e reduzir a prestação mensal.",
      },
      {
        termo: "escritório de advocacia de confiança recomendado {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Confiança & Reputação Jurídica",
        visaoGestorTrafego:
          "Cliente com causa importante pesquisando avaliações no Google para ter certeza de que o advogado é ético e pontual.",
      },
    ],
  },

  estetica: {
    categorias: [
      "Harmonização Facial",
      "Toxina Botulínica (Botox)",
      "Preenchimento Labial",
      "Bioestimuladores de Colágeno",
      "Depilação a Laser",
    ],
    termos: [
      {
        termo: "botox preventivo antes e depois preço na testa e glabela {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação de Procedimento Recorrente",
        visaoGestorTrafego:
          "Paciente querendo eliminar rugas de expressão. Procedimento com recompra a cada 4 a 6 meses.",
      },
      {
        termo: "harmonização facial valor parcelado sem juros antes e depois {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Alto Ticket / Transformação",
        visaoGestorTrafego:
          "Consumidor buscando redefinir mandíbula, queixo ou olheiras. Ticket de R$ 2.500 a R$ 8.000.",
      },
      {
        termo: "preenchimento labial 1ml efeito natural valor {cidade}",
        intencao: "fundo",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Medo de Exagero / Busca de Naturalidade",
        visaoGestorTrafego:
          "Paciente com receio de ficar com lábio artificial ('bico de pato'). Busca por fotos reais e reviews de profissionais sérios.",
      },
      {
        termo: "bioestimulador de colágeno sculptra ou radiesse preço sessão {cidade}",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Tratamento de Flacidez Premium",
        visaoGestorTrafego:
          "Público 35+ com poder aquisitivo buscando tratar firmeza da pele facial e corporal sem intervenção cirúrgica.",
      },
      {
        termo: "depilação a laser virilha completa axila sem dor soprano {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Pacotes de Sessões",
        visaoGestorTrafego:
          "Consumidor cansado de cera e lâmina buscando clínicas com tecnologia moderna que não queime nem cause dor intensa.",
      },
      {
        termo: "limpeza de pele profunda com extração de cravos perto de mim {cidade}",
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Proximidade & Frequência",
        visaoGestorTrafego:
          "Porta de entrada para procedimentos estéticos maiores. O cliente busca locais perto de casa ou trabalho.",
      },
      {
        termo: "clínica de estética com médicos dermatologistas de confiança {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Segurança Médica e Sanitária",
        visaoGestorTrafego:
          "Consumidores com medo de intercorrências graves em estética priorizam clínicas com respaldo médico e alvará sanitário.",
      },
    ],
  },

  automotivo: {
    categorias: [
      "Mecânica Geral",
      "Suspensão & Freios",
      "Injeção Eletrônica",
      "Ar Condicionado Automotivo",
      "Troca de Óleo Rápida",
    ],
    termos: [
      {
        termo: "barulho na suspensão dianteira ao passar no quebra mola {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Sintoma Mecânico Específico",
        visaoGestorTrafego:
          "O motorista não pesquisa 'oficina', ele pesquisa o barulho que está ouvindo no carro (estalo, rangido, batente).",
      },
      {
        termo: "luz da injeção eletrônica acesa motor falhando oficina perto de mim",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Medo de Pane / Scanner Imediato",
        visaoGestorTrafego:
          "Luz amarela acesa no painel gera pânico de ficar a pé na rua. O cliente vai até a oficina mais próxima e bem avaliada.",
      },
      {
        termo: "troca de correia dentada e tensor valor mão de obra {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Manutenção Preventiva Obrigatória",
        visaoGestorTrafego:
          "Consumidor prevenindo quebra de motor que custaria mais de R$ 8.000. Cotação focada em peças originais e garantia.",
      },
      {
        termo: "revisão de freio pastilha rangendo oficina de confiança {cidade}",
        intencao: "fundo",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Segurança da Família / Viagem",
        visaoGestorTrafego:
          "Motorista preparando o carro para pegar estrada com a família. O fator decisivo é confiança e peças de qualidade.",
      },
      {
        termo: "troca de óleo e filtro rápida sem agendamento perto de mim",
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Agilidade & Conveniência",
        visaoGestorTrafego:
          "Serviço rápido que o motorista quer resolver em 20 minutos no caminho do trabalho.",
      },
      {
        termo: "ar condicionado do carro não gela carga de gás r134a {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Desconforto Térmico no Calor",
        visaoGestorTrafego:
          "Dias quentes geram pico imediato de buscas por vazamento e recarga de gás do ar automotivo.",
      },
      {
        termo: "oficina mecânica aberta sábado de manhã {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Horário Especial de Fim de Semana",
        visaoGestorTrafego:
          "Clientes que trabalham a semana inteira e só conseguem levar o carro para conserto no sábado.",
      },
    ],
  },

  imobiliaria: {
    categorias: [
      "Casas em Condomínio",
      "Apartamentos na Planta",
      "Financiamento Habitacional",
      "Aluguel Sem Fiador",
      "Terrenos & Lotes",
    ],
    termos: [
      {
        termo: "sobrado em condomínio fechado para comprar {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Alto Ticket / Segurança Familiar",
        visaoGestorTrafego:
          "Comprador com alto poder aquisitivo buscando segurança para filhos e área de lazer privativa. Ticket acima de R$ 600 mil.",
      },
      {
        termo: "apartamento 2 ou 3 quartos pronto para morar financiamento caixa {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Primeiro Imóvel com FGTS",
        visaoGestorTrafego:
          "Família ou jovem casal querendo sair do aluguel com parcelas equivalentes ao financiamento da Caixa.",
      },
      {
        termo: "aluguel de casa direto com proprietário sem fiador {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Fuga de Burocracia de Aluguel",
        visaoGestorTrafego:
          "Locatário precisando se mudar rápido sem ter fiador na cidade (busca por caução ou credpago).",
      },
      {
        termo: "terreno em condomínio fechado loteamento parcelado {cidade}",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Investimento & Construção",
        visaoGestorTrafego:
          "Consumidor comprando lote para construir a casa dos sonhos nos próximos 2 anos.",
      },
      {
        termo: "imobiliária de confiança credenciada creci em {bairro} {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Segurança Jurídica e Documental",
        visaoGestorTrafego:
          "Comprador exigente querendo intermediador sério para não ter dor de cabeça com matrícula ou penhora.",
      },
    ],
  },

  energia_solar: {
    categorias: [
      "Energia Solar Residencial",
      "Sistemas Fotovoltaicos",
      "Financiamento Solar",
      "Energia Solar Rural",
      "Energia Solar Comercial",
    ],
    termos: [
      {
        termo: "energia solar residencial financiamento com a própria economia da conta",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Troca de Boleto por Ativo",
        visaoGestorTrafego:
          "O maior apelo de vendas em energia solar: a parcela do financiamento do kit solar é paga com a própria economia da conta de luz.",
      },
      {
        termo: "reduzir conta de luz em 95% preço placa solar fotovoltaica {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Redução Imediata de Gastos Fixos",
        visaoGestorTrafego:
          "Consumidor indignado com bandeiras tarifárias e reajustes anuais da distribuidora querendo zerar a conta.",
      },
      {
        termo: "empresa de energia solar de confiança avaliações google {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Garantia de 25 Anos dos Módulos",
        visaoGestorTrafego:
          "Projeto com garantia longa exige empresa sólida que não vai fechar as portas em 2 anos.",
      },
      {
        termo: "energia solar para comércio e empresas abatimento de impostos {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Investimento Corporativo / B2B",
        visaoGestorTrafego:
          "Empresários buscando redução de custo fixo e payback acelerado em galpões, supermercados ou indústrias.",
      },
    ],
  },

  gastronomia: {
    categorias: [
      "Pizzaria & Rodízio",
      "Hamburgueria Artesanal",
      "Restaurante & Almoço",
      "Delivery WhatsApp",
      "Comida Japonesa & Sushi",
    ],
    termos: [
      {
        termo: "pizzaria aberta agora entrega rápida {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Fome Imediata / Aberto Agora",
        visaoGestorTrafego:
          "Consumidor no sofá com fome querendo pedir jantar sem demora. Quem tem horário atualizado no Maps recebe a ligação.",
      },
      {
        termo: "rodízio de pizza preço por pessoa promoção hoje {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação de Rodízio em Família",
        visaoGestorTrafego:
          "Grupos de amigos ou famílias comparando valores de rodízio e dias de promoção para comemoração.",
      },
      {
        termo: "melhor hamburguer artesanal perto de mim {cidade}",
        intencao: "fundo",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Escolha por Avaliações & Fotos",
        visaoGestorTrafego:
          "Consumidor olhando fotos do lanche e nota do Google Maps antes de decidir onde comer à noite.",
      },
      {
        termo: "restaurante para almoço self service por quilo perto de mim",
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Almoço Rápido no Trabalho",
        visaoGestorTrafego:
          "Trabalhador no horário de almoço buscando comida gostosa a menos de 5 minutos do escritório.",
      },
      {
        termo: "pedir delivery comida no whatsapp com cardápio {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Pedido Direto sem Taxa",
        visaoGestorTrafego:
          "Cliente que prefere falar direto no WhatsApp do estabelecimento para não pagar taxa abusiva de app.",
      },
      {
        termo: "restaurante com espaço kids e brinquedoteca para crianças {cidade}",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Experiência Familiar Completa",
        visaoGestorTrafego:
          "Pais com filhos pequenos que só saem para jantar em lugares onde as crianças tenham espaço seguro para brincar.",
      },
    ],
  },

  petshop: {
    categorias: [
      "Clínica Veterinária 24h",
      "Banho e Tosa",
      "Vacinação & Exames",
      "Rações & Pet Care",
      "Castração Popular",
    ],
    termos: [
      {
        termo: "veterinário 24 horas emergência aberto agora perto de mim",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Emergência Crítica do Pet",
        visaoGestorTrafego:
          "Animal engasgado, atropelado ou vomitando no meio da madrugada. O tutor corre na primeira clínica 24h com telefone no Google.",
      },
      {
        termo: "banho e tosa busca e entrega whatsapp {cidade}",
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Comodidade Leva e Traz",
        visaoGestorTrafego:
          "Tutor sem tempo que precisa que o pet shop venha buscar o cachorro em casa e devolva cheiroso e tosado.",
      },
      {
        termo: "quanto custa castração de cachorro e gato preço {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação Cirúrgica Preventiva",
        visaoGestorTrafego:
          "Donos de pets comparando valor de cirurgia com anestesia inalatória e exames pré-operatórios.",
      },
      {
        termo: "veterinário especialista em dermatologia coceira no cachorro {cidade}",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Tratamento Específico Crônico",
        visaoGestorTrafego:
          "Tutor desesperado com animal com dermatite e alergia que não melhora com consulta veterinária comum.",
      },
    ],
  },

  academia: {
    categorias: [
      "Musculação & Hipertrofia",
      "Pilates & Reabilitação",
      "Crossfit & Funcional",
      "Natação Infantil & Adulto",
      "Lutas & Artes Marciais",
    ],
    termos: [
      {
        termo: "academia musculação mensalidade sem taxa de matrícula {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação de Mensalidade & Planos",
        visaoGestorTrafego:
          "Aluno querendo treinar mas fugindo de taxas escondidas de anuidade e matrícula cara.",
      },
      {
        termo: "academia aberta sábado e domingo perto de mim",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Treino no Fim de Semana",
        visaoGestorTrafego:
          "Público focado que não quer ficar sem treinar aos sábados e domingos.",
      },
      {
        termo: "estúdio de pilates com fisioterapeuta para dor na coluna {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Saúde, Postura e Reabilitação",
        visaoGestorTrafego:
          "Pessoas 30+ com dor lombar ou hérnia de disco buscando atendimento personalizado com fisioterapeuta.",
      },
      {
        termo: "aula experimental crossfit ou funcional grátis {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Quebra de Objeção / Test Drive",
        visaoGestorTrafego:
          "Iniciante com medo de não aguentar a intensidade querendo fazer aula avulsa para conhecer a turma.",
      },
    ],
  },

  assistencia_celular: {
    categorias: [
      "Troca de Tela iPhone",
      "Bateria & Conector",
      "Reparo em Placa",
      "Conserto Notebook & PC",
      "Recuperação de Dados",
    ],
    termos: [
      {
        termo: "troca de tela de iphone no mesmo dia valor {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Celular Quebrado / Urgência Máxima",
        visaoGestorTrafego:
          "Pessoa sem celular para trabalhar. Quem trocar a tela em 1 hora leva o serviço no balcão.",
      },
      {
        termo: "conserto de celular perto de mim que busca em casa",
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Delivery & Comodidade",
        visaoGestorTrafego:
          "Cliente sem tempo para ir até o centro da cidade querendo motoboy que colete o aparelho para orçamento.",
      },
      {
        termo: "quanto custa trocar bateria de celular xiaomi e samsung {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação de Bateria Viciada",
        visaoGestorTrafego:
          "Usuário com aparelho descarregando em poucas horas cotando peças originais com garantia de 3 a 6 meses.",
      },
    ],
  },

  beleza: {
    categorias: [
      "Barbearia Tradicional",
      "Cabelo & Mechas",
      "Manicure & Pedicure",
      "Mega Hair & Extensão",
      "Maquiagem & Penteado",
    ],
    termos: [
      {
        termo: "barbearia aberta agora sem fila agendamento online {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Corte Imediato / Sem Espera",
        visaoGestorTrafego:
          "Homem com evento ou reunião querendo cortar cabelo e alinhar a barba sem ficar 1 hora esperando em sofá.",
      },
      {
        termo: "salão de beleza especialista em mechas loiras antes e depois {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Procedimento Capilar de Alto Ticket",
        visaoGestorTrafego:
          "Mulher com medo de corte químico que só entrega o cabelo para cabeleireiros com fotos reais de antes e depois.",
      },
      {
        termo: "manicure e pedicure unha de gel perto de mim {cidade}",
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Manutenção Periódica de Unhas",
        visaoGestorTrafego:
          "Clientes procurando profissionais com horário livre para fazer unhas no fim de semana ou pós expediente.",
      },
    ],
  },
};

/**
 * Motor Dinâmico de Tráfego: Identifica a base do nicho ou decompõe
 * o nicho específico do usuário segundo a psicologia de compra do Google.
 */
function obterEstrategiaNicho(segmento: string, cidade: string, bairro?: string) {
  const sNorm = normalizarTexto(segmento);

  for (const [chave, dados] of Object.entries(BASE_COMPORTAMENTAL_NICHOS)) {
    if (sNorm.includes(chave) || chave.includes(sNorm)) {
      return dados;
    }
  }

  // Mapeamentos semânticos
  if (sNorm.includes("consorc") || sNorm.includes("credito") || sNorm.includes("invest") || sNorm.includes("finan")) {
    return BASE_COMPORTAMENTAL_NICHOS["consorcio"]!;
  }
  if (sNorm.includes("odonto") || sNorm.includes("dent") || sNorm.includes("sorriso") || sNorm.includes("implante")) {
    return BASE_COMPORTAMENTAL_NICHOS["odontologia"]!;
  }
  if (sNorm.includes("advog") || sNorm.includes("jurid") || sNorm.includes("direito") || sNorm.includes("lei")) {
    return BASE_COMPORTAMENTAL_NICHOS["advocacia"]!;
  }
  if (sNorm.includes("estet") || sNorm.includes("harmoniz") || sNorm.includes("botox") || sNorm.includes("laser") || sNorm.includes("pele")) {
    return BASE_COMPORTAMENTAL_NICHOS["estetica"]!;
  }
  if (sNorm.includes("mecanic") || sNorm.includes("carro") || sNorm.includes("auto") || sNorm.includes("oficina") || sNorm.includes("pneu")) {
    return BASE_COMPORTAMENTAL_NICHOS["automotivo"]!;
  }
  if (sNorm.includes("imove") || sNorm.includes("imobil") || sNorm.includes("corretor") || sNorm.includes("apartamento") || sNorm.includes("casa")) {
    return BASE_COMPORTAMENTAL_NICHOS["imobiliaria"]!;
  }
  if (sNorm.includes("solar") || sNorm.includes("fotovolt") || sNorm.includes("placa")) {
    return BASE_COMPORTAMENTAL_NICHOS["energia_solar"]!;
  }
  if (sNorm.includes("pizz") || sNorm.includes("restauran") || sNorm.includes("lanch") || sNorm.includes("comid") || sNorm.includes("burger") || sNorm.includes("hamburg") || sNorm.includes("sushi") || sNorm.includes("delivery")) {
    return BASE_COMPORTAMENTAL_NICHOS["gastronomia"]!;
  }
  if (sNorm.includes("pet") || sNorm.includes("veterin") || sNorm.includes("cao") || sNorm.includes("gato") || sNorm.includes("racao") || sNorm.includes("tosa")) {
    return BASE_COMPORTAMENTAL_NICHOS["petshop"]!;
  }
  if (sNorm.includes("academ") || sNorm.includes("trein") || sNorm.includes("fit") || sNorm.includes("pilates") || sNorm.includes("cross") || sNorm.includes("musculacao")) {
    return BASE_COMPORTAMENTAL_NICHOS["academia"]!;
  }
  if (sNorm.includes("celular") || sNorm.includes("iphone") || sNorm.includes("computad") || sNorm.includes("noteb") || sNorm.includes("informatica") || sNorm.includes("conserto")) {
    return BASE_COMPORTAMENTAL_NICHOS["assistencia_celular"]!;
  }
  if (sNorm.includes("barbea") || sNorm.includes("salao") || sNorm.includes("cabel") || sNorm.includes("manicur") || sNorm.includes("barba")) {
    return BASE_COMPORTAMENTAL_NICHOS["beleza"]!;
  }

  // GESTOR DE TRÁFEGO UNIVERSAL: Decompõe qualquer negócio específico nas buscas reais do consumidor
  const segLimpo = segmento.trim() || "Serviço";
  return {
    categorias: [
      `${segLimpo} Especializado`,
      `Atendimento Rápido & Urgência`,
      `Orçamento & Valores`,
      `Avaliações & Confiança`,
      `Atendimento Local no Bairro`,
    ],
    termos: [
      {
        termo: `quanto custa ${segLimpo} em {cidade} orçamento`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "preco_parcelamento" as GatilhoComportamento,
        rotuloGatilho: "💰 Cotação de Preço Direta",
        visaoGestorTrafego: `Consumidor com a decisão tomada comparando preços e formas de pagamento antes de fechar negócio.`,
      },
      {
        termo: `${segLimpo} bom e barato perto de mim em {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "hiperlocal" as GatilhoComportamento,
        rotuloGatilho: "📍 Custo-Benefício & Proximidade",
        visaoGestorTrafego: `Busca comum de quem quer resolver rápido perto de onde mora sem pagar caro.`,
      },
      {
        termo: `melhor ${segLimpo} em {cidade} avaliações 5 estrelas`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "confianca" as GatilhoComportamento,
        rotuloGatilho: "🏆 Prova Social & Reputação",
        visaoGestorTrafego: `Cliente que não quer dor de cabeça com amadores e escolhe a empresa mais elogiada no Google Maps.`,
      },
      {
        termo: `${segLimpo} urgente aberto agora atendimento hoje`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "urgencia" as GatilhoComportamento,
        rotuloGatilho: "🔥 Urgência Imediata",
        visaoGestorTrafego: `Pessoa com problema imediato precisando de resposta rápida hoje mesmo.`,
      },
      {
        termo: `${segLimpo} orçamento rápido pelo whatsapp {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "urgencia" as GatilhoComportamento,
        rotuloGatilho: "🔥 Conversão Direta no WhatsApp",
        visaoGestorTrafego: `Pessoa que não quer preencher formulário chato e prefere tirar dúvidas comerciais pelo WhatsApp.`,
      },
      {
        termo: `${segLimpo} parcelado no cartão sem juros {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "preco_parcelamento" as GatilhoComportamento,
        rotuloGatilho: "💰 Facilidade de Parcelamento",
        visaoGestorTrafego: `Consumidor sensível a desembolso imediato procurando empresas que dividem o pagamento.`,
      },
      {
        termo: `onde contratar ${segLimpo} de confiança em {cidade}`,
        intencao: "meio" as IntencaoBusca,
        gatilho: "confianca" as GatilhoComportamento,
        rotuloGatilho: "🏆 Medo de Ser Enganado",
        visaoGestorTrafego: `Pesquisa de recomendação feita por quem já teve experiências ruins no passado.`,
      },
      {
        termo: `${segLimpo} perto de mim em {bairro}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "hiperlocal" as GatilhoComportamento,
        rotuloGatilho: "📍 Hiperlocal no Bairro",
        visaoGestorTrafego: `Cliente que valoriza comodidade e quer ser atendido na própria vizinhança.`,
      },
    ],
  };
}

/**
 * GERA A ANÁLISE DE PALAVRAS-CHAVE FOCADA EM COMPORTAMENTO DO CONSUMIDOR (TRAFFIC MIND)
 */
export function analisarKeywordsConcorrentes(listaConcorrentes?: Empresa[]): {
  keywords: KeywordAnalise[];
  diagnostico: DiagnosticoSEOAds;
} {
  const isMercadoUS = empresa.pais === "US";
  const seg = empresa.segmento || (isMercadoUS ? "Home Services" : "Consórcios");
  const cid = empresa.cidade || (isMercadoUS ? "Miami" : "Londrina");
  const uf = empresa.uf ? (isMercadoUS ? `, ${empresa.uf}` : ` - ${empresa.uf}`) : "";
  const bairroOuRua = extrairBairroOuRua(empresa.endereco) || (isMercadoUS ? "Downtown" : "Centro");
  const locDesc = bairroOuRua ? `${bairroOuRua}, ${cid}` : `${cid}${uf}`;

  const estrategia = isMercadoUS
    ? obterEstrategiaNichoUS(seg, cid)
    : obterEstrategiaNicho(seg, cid, bairroOuRua);
  const geo = buscarCoordenadasBrasil(cid, empresa.uf, isMercadoUS ? "US" : "BR");
  const fatorCidade = geo.fatorBusca || 1.1;

  const concs =
    listaConcorrentes && listaConcorrentes.length > 0
      ? listaConcorrentes
      : empresas.filter((e) => !e.voce);
  const topConcorrentes = concs.slice(0, 5);
  const topLider = lider();

  // Termos estratégicos de alta intenção e conversão do nicho
  const termosFinais = [...estrategia.termos];

  const keywords: KeywordAnalise[] = termosFinais.map((t, idx) => {
    let termoProcessado = t.termo.replace("{cidade}", cid);
    termoProcessado = termoProcessado.replace("{bairro}", bairroOuRua || (isMercadoUS ? "Downtown" : "Centro"));

    // Mapeamento com os concorrentes reais da região
    const concorrentesQueUsam: string[] = [];
    if (topLider && topLider.nome && topLider.nome !== "—") {
      concorrentesQueUsam.push(topLider.nome);
    }
    topConcorrentes.slice(1).forEach((c, cIdx) => {
      if ((idx + cIdx) % 2 === 0 && c.nome) {
        concorrentesQueUsam.push(c.nome);
      }
    });

    const taxa =
      topConcorrentes.length > 0
        ? Math.round((concorrentesQueUsam.length / Math.max(1, topConcorrentes.length)) * 100)
        : 80;

    // Posição no Maps da ficha do cliente
    let posicaoSua: number | null = null;
    let status: "invisivel" | "fora_top3" | "top3" = "invisivel";

    if (voce.avaliacoes >= 120 && idx === 0) {
      posicaoSua = 2;
      status = "top3";
    } else if (voce.avaliacoes >= 40 && idx < 3) {
      posicaoSua = 4 + (idx % 3);
      status = "fora_top3";
    } else {
      posicaoSua = null;
      status = "invisivel";
    }

    const concAds: "Alta" | "Média" | "Baixa" =
      t.intencao === "fundo" ? "Alta" : t.intencao === "meio" ? "Média" : "Baixa";

    // Argumento pronto do Gestor de Tráfego para apresentar ao cliente
    let argumento = "";
    if (isMercadoUS) {
      if (status === "invisivel") {
        argumento = `Sua empresa NÃO aparece no Google Maps para compradores imediatos em ${locDesc}. O líder (${topLider.nome || "concorrente"}) absorve todas as ligações diretas e agendamentos pelo botão "Call Now".`;
      } else if (status === "fora_top3") {
        argumento = `Sua empresa aparece fora do Top 3 Local Pack em ${locDesc}. Mais de 82% das decisões de compra nos EUA acontecem exclusivamente nas 3 primeiras fichas.`;
      } else {
        argumento = `Sua ficha disputa presença com ${topLider.nome || "líderes da região"} em ${locDesc}. É essencial manter tempo de resposta do proprietário < 24h e selos de credibilidade para manter essa posição.`;
      }
    } else {
      if (status === "invisivel") {
        argumento = `Sua empresa NÃO aparece para o consumidor em momento de compra em ${locDesc}. O líder (${topLider.nome || "concorrente"}) absorve todas essas chamadas.`;
      } else if (status === "fora_top3") {
        argumento = `Sua empresa aparece fora do Top 3 em ${locDesc}. 82% das decisões de compra no Maps acontecem exclusivamente nas 3 primeiras fichas.`;
      } else {
        argumento = `Sua ficha disputa presença com ${topLider.nome || "concorrentes"} em ${locDesc}. É essencial manter avaliações semanais para não perder a posição.`;
      }
    }

    return {
      id: `kw-${idx}`,
      termo: termoProcessado,
      categoria: estrategia.categorias[idx % estrategia.categorias.length] || seg,
      intencao: t.intencao,
      gatilho: t.gatilho,
      rotuloGatilho: t.rotuloGatilho,
      visaoGestorTrafego: t.visaoGestorTrafego,
      volumeMensal: 0,
      cpcMedio: 0,
      concorrenciaAds: concAds,
      concorrentesQueUsam,
      taxaConcorrentes: taxa,
      posicaoSua,
      status,
      perdaMensalCliques: 0,
      argumentoVenda: argumento,
    };
  });

  const totalInvisivel = keywords.filter((k) => k.status === "invisivel").length;
  const taxaInvisibilidade = keywords.length > 0 ? Math.round((totalInvisivel / keywords.length) * 100) : 0;

  const palavrasTop3 = keywords.filter((k) => k.status === "top3").length;
  const palavrasMeio = keywords.filter((k) => k.status === "fora_top3").length;
  const scoreSEO = keywords.length > 0
    ? Math.min(100, Math.max(12, Math.round((palavrasTop3 * 100 + palavrasMeio * 45) / keywords.length)))
    : 0;

  const primeiroTermo = keywords[0]?.termo || (isMercadoUS ? `${seg} near me in ${cid}` : `${seg} em ${cid}`);
  const pontosVenda: string[] = isMercadoUS
    ? [
        `Nas buscas de alta intenção de compra em ${locDesc}, seu cliente encontra primeiro o ${topLider?.nome || "líder da região"} no Top 3 do Google Maps.`,
        `Nos Estados Unidos, mais de 70% das conversões locais acontecem por Ligação Telefônica Direta ("Call Now") ou Agendamento Online ("Reserve with Google"), exigindo presença máxima no topo.`,
        `O consumidor americano filtra ativamente empresas com selos de "Licensed & Insured", "BBB Accredited" e "Google Guaranteed" antes de ligar ou contratar.`,
        `O tempo de resposta do proprietário às avaliações (menos de 24h) é um fator de ranqueamento direto no algoritmo do Google Maps nos Estados Unidos.`,
      ]
    : [
        `Nas buscas de maior intenção de compra de ${locDesc}, seu cliente encontra primeiro o ${topLider?.nome || "líder da região"}.`,
        `Termos com intenção de contratação imediata (como "${primeiroTermo}") exigem presença no Top 3 do Google Maps e anúncios patrocinados no Google Ads.`,
        `A busca por termos específicos de alto ticket e formas de parcelamento é onde se concentram os clientes mais rentáveis do seu mercado.`,
        `Mais de 75% dos consumidores pesquisam no Google antes de entrar em contato via WhatsApp para verificar se a empresa possui avaliações positivas recentes.`,
      ];

  return {
    keywords,
    diagnostico: {
      scoreSEOAds: scoreSEO,
      totalVolumeBuscas: 0,
      buscasPerdidasParaConcorrentes: 0,
      custoOportunidadeAds: 0,
      taxaInvisibilidade,
      palavrasMaisDisputadas: keywords.filter((k) => k.concorrenciaAds === "Alta"),
      oportunidadesOuro: keywords.filter((k) => k.gatilho === "urgencia" || k.gatilho === "preco_parcelamento"),
      pontosVendaComercial: pontosVenda,
    },
  };
}
