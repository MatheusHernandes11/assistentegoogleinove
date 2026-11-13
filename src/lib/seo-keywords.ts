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
        termo: "comprar carta de crédito contemplada segura",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Comprador Imediato",
        visaoGestorTrafego:
          "Consumidor com capital na mão buscando crédito liberado imediatamente para fechar imóvel ou veículo sem esperar sorteio.",
      },
      {
        termo: "tabela consórcio contemplado imobiliário entrega imediata {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação com Dinheiro na Mão",
        visaoGestorTrafego:
          "Cliente comparando valores de entrada e parcelas mensais. Altíssima intenção de compra no balcão ou WhatsApp.",
      },
      {
        termo: "simular consórcio imobiliário parcelas reduzidas sem juros",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Fuga dos Juros Bancários",
        visaoGestorTrafego:
          "Consumidor assustado com as taxas de juros de financiamento tradicional buscando a alternativa mais econômica.",
      },
      {
        termo: "como funciona lance embutido no consórcio imobiliário",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Objeção Técnica / Qualificado",
        visaoGestorTrafego:
          "Lead sofisticado que quer usar parte da própria carta para acelerar a contemplação sem descapitalizar.",
      },
      {
        termo: "carta de crédito contemplada para comprar terreno e construir {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Projeto Específico de Alto Valor",
        visaoGestorTrafego:
          "Família ou investidor com projeto de obra aprovado que precisa do recurso aprovado para iniciar a construção.",
      },
      {
        termo: "consórcio de frotas e caminhões pesados taxas reduzidas",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Lead Corporativo / PJ",
        visaoGestorTrafego:
          "Empresário ou transportador autônomo renovando frotas. Ticket médio elevado de R$ 300 mil a R$ 1 milhão.",
      },
      {
        termo: "consórcio contemplado de confiança avaliações 5 estrelas {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Blindagem Contra Golpes",
        visaoGestorTrafego:
          "O maior medo do comprador de consórcio é cair em golpe de falsa contemplação. Perfis do Maps com muitas avaliações fecham o contrato.",
      },
      {
        termo: "simular consórcio de automóvel sem entrada whatsapp {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Atendimento Rápido Celular",
        visaoGestorTrafego:
          "Usuário no celular querendo receber a tabela simulada diretamente no WhatsApp em menos de 5 minutos.",
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
        termo: "implante dentário carga imediata dente no mesmo dia {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Procedimento de Alto Ticket",
        visaoGestorTrafego:
          "Paciente com perda dentária visível e pressa estética/funcional. Ticket de R$ 3.000 a R$ 15.000 por procedimento.",
      },
      {
        termo: "protocolo dentário all on 4 preço parcelado no boleto {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Cotação com Necessidade de Parcelamento",
        visaoGestorTrafego:
          "Consumidor querendo reabilitar a boca toda, mas precisa saber se a clínica aceita parcelamento em até 24x ou boleto.",
      },
      {
        termo: "dentista 24 horas aberto agora perto de mim",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dor Crítica / Urgência Máxima",
        visaoGestorTrafego:
          "Paciente com dor aguda insuportável no meio da noite ou fim de semana. Quem atender primeiro pelo Google Maps leva o paciente.",
      },
      {
        termo: "quanto custa arrancar siso inflamado consulta hoje {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dor Aguda / Resolução no Dia",
        visaoGestorTrafego:
          "Consumidor com rosto inchado e dor ao mastigar procurando atendimento com urgência de horário.",
      },
      {
        termo: "aparelho invisível invisalign valor e parcelas {cidade}",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Estética Adulta Premium",
        visaoGestorTrafego:
          "Adulto ou profissional que não quer usar bráquetes de metal e busca clínicas certificadas na cidade.",
      },
      {
        termo: "clareamento dental a laser preço sessão antes e depois {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Desejo Estético Rápido",
        visaoGestorTrafego:
          "Consumidor com evento próximo (casamento, formatura, férias) querendo clarear os dentes rapidamente.",
      },
      {
        termo: "dentista especialista em tratamento de canal sem dor {cidade}",
        intencao: "fundo",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Medo de Dor / Odontofobia",
        visaoGestorTrafego:
          "Paciente com medo terrível de dentista procurando profissionais elogiados por anestesia indolor e carinho.",
      },
      {
        termo: "melhor clínica de implantes avaliações 5 estrelas {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Prova Social & Especialistas",
        visaoGestorTrafego:
          "Paciente pesquisando a reputação antes de entregar a saúde bucal. Perfis com centenas de avaliações vencem com folga.",
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
        termo: "fui demitido sem justa causa como calcular rescisão advogado {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Dor Imediata do Trabalhador",
        visaoGestorTrafego:
          "Trabalhador desorientado que acabou de sair da empresa com dúvidas se recebeu todas as verbas rescisórias.",
      },
      {
        termo: "advogado trabalhista online whatsapp atendimento rápido {cidade}",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Contato Imediato pelo Celular",
        visaoGestorTrafego:
          "Cliente que quer tirar uma dúvida jurídica urgente sem precisar marcar hora e ir ao escritório presencialmente de imediato.",
      },
      {
        termo: "divórcio consensual no cartório rápido partilha de bens advogado {cidade}",
        intencao: "fundo",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Solução Amigável & Patrimônio",
        visaoGestorTrafego:
          "Casal querendo resolver o término com agilidade e partilhar imóveis/veículos sem desgaste judicial demorado.",
      },
      {
        termo: "pensão alimentícia atrasada prisão do devedor advogado urgente",
        intencao: "fundo",
        gatilho: "urgencia",
        rotuloGatilho: "🔥 Emergência Financeira Familiar",
        visaoGestorTrafego:
          "Mãe sem receber o sustento dos filhos precisando de execução judicial e bloqueio de contas com urgência.",
      },
      {
        termo: "revisão da vida toda inss aposentadoria advogado especialista {cidade}",
        intencao: "meio",
        gatilho: "alto_ticket",
        rotuloGatilho: "💎 Cálculo de Benefício Previdenciário",
        visaoGestorTrafego:
          "Aposentado que recebia salários altos antes de 1994 querendo recalcular o benefício para aumentar o salário mensal.",
      },
      {
        termo: "advogado inventário e herança extrajudicial honorários parcelados {cidade}",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Custo & Viabilidade Sucessória",
        visaoGestorTrafego:
          "Família com bens bloqueados após o falecimento de um parente querendo saber custos de ITCMD e honorários de advogado.",
      },
      {
        termo: "revisão de contrato financiamento veículo juros abusivos advogado",
        intencao: "fundo",
        gatilho: "preco_parcelamento",
        rotuloGatilho: "💰 Alívio de Endividamento",
        visaoGestorTrafego:
          "Motorista sufocado por parcelas caras de carro buscando renegociação ou devolução de taxas ilegais.",
      },
      {
        termo: "escritório de advocacia de confiança recomendado {cidade}",
        intencao: "meio",
        gatilho: "confianca",
        rotuloGatilho: "🏆 Confiança & Reputação Jurídica",
        visaoGestorTrafego:
          "O cliente de advocacia contrata credibilidade. Fichas no Google com avaliações detalhadas geram clientes qualificados.",
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

  // GESTOR DE TRÁFEGO UNIVERSAL: Decompõe qualquer nicho específico nas 5 dores de consumo
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
        termo: `onde contratar ${segLimpo} de confiança avaliações 5 estrelas {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "confianca" as GatilhoComportamento,
        rotuloGatilho: "🏆 Prova Social & Confiança",
        visaoGestorTrafego: `Consumidor querendo evitar prestadores amadores e buscando empresas recomendadas no Google em ${cidade}.`,
      },
      {
        termo: `${segLimpo} quanto custa orçamento parcelado no cartão {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "preco_parcelamento" as GatilhoComportamento,
        rotuloGatilho: "💰 Cotação com Dinheiro na Mão",
        visaoGestorTrafego:
          "Consumidor já decidiu contratar e está comparando formas de pagamento e facilidade de contratação.",
      },
      {
        termo: `${segLimpo} urgente atendimento hoje perto de mim`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "urgencia" as GatilhoComportamento,
        rotuloGatilho: "🔥 Urgência & Imediatez",
        visaoGestorTrafego:
          "Cliente com dor ou necessidade crítica querendo ser atendido no mesmo dia sem burocracia.",
      },
      {
        termo: `melhor especialista em ${segLimpo} em {cidade}`,
        intencao: "meio" as IntencaoBusca,
        gatilho: "alto_ticket" as GatilhoComportamento,
        rotuloGatilho: "💎 Serviço Especializado / Alto Padrão",
        visaoGestorTrafego:
          "Público que prioriza qualidade técnica e autoridade comprovada em vez de disputar o menor preço.",
      },
      {
        termo: `${segLimpo} atendimento direto no whatsapp {cidade}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "urgencia" as GatilhoComportamento,
        rotuloGatilho: "🔥 Conversão Direta no Celular",
        visaoGestorTrafego:
          "Usuário no smartphone querendo tirar dúvidas comerciais e agendar diretamente pelo WhatsApp.",
      },
      {
        termo: `${segLimpo} perto de mim em {bairro}`,
        intencao: "fundo" as IntencaoBusca,
        gatilho: "hiperlocal" as GatilhoComportamento,
        rotuloGatilho: "📍 Proximidade Geográfica no Bairro",
        visaoGestorTrafego:
          "Consumidor valorizando comodidade e facilidade de acesso no próprio bairro de moradia ou trabalho.",
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
  const seg = empresa.segmento || "Consórcios";
  const cid = empresa.cidade || "Londrina";
  const uf = empresa.uf ? ` - ${empresa.uf}` : "";
  const bairroOuRua = extrairBairroOuRua(empresa.endereco) || "Centro";
  const locDesc = bairroOuRua ? `${bairroOuRua}, ${cid}` : `${cid}${uf}`;

  const estrategia = obterEstrategiaNicho(seg, cid, bairroOuRua);
  const geo = buscarCoordenadasBrasil(cid, empresa.uf);
  const fatorCidade = geo.fatorBusca || 1.1;

  const concs =
    listaConcorrentes && listaConcorrentes.length > 0
      ? listaConcorrentes
      : empresas.filter((e) => !e.voce);
  const topConcorrentes = concs.slice(0, 5);
  const topLider = lider();

  // Injeta termos hiperlocais de bairro no topo com alta prioridade de tráfego
  const termosFinais = [...estrategia.termos];
  if (bairroOuRua && bairroOuRua !== "Centro") {
    termosFinais.unshift(
      {
        termo: `${seg} na ${bairroOuRua} {cidade}`,
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Hiperlocal no Bairro",
        visaoGestorTrafego: `Busca cirúrgica de quem mora ou trabalha na ${bairroOuRua} e quer resolver por perto.`,
      },
      {
        termo: `melhor ${seg} perto de mim em ${bairroOuRua}`,
        intencao: "fundo",
        gatilho: "hiperlocal",
        rotuloGatilho: "📍 Proximidade Imediata",
        visaoGestorTrafego: `Consumidor no celular usando geolocalização exata para escolher a empresa vizinha mais bem avaliada.`,
      }
    );
  }

  const keywords: KeywordAnalise[] = termosFinais.map((t, idx) => {
    let termoProcessado = t.termo.replace("{cidade}", cid);
    termoProcessado = termoProcessado.replace("{bairro}", bairroOuRua);

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
    if (status === "invisivel") {
      argumento = `Sua empresa NÃO aparece para o consumidor em momento de compra em ${locDesc}. O líder (${topLider.nome || "concorrente"}) absorve todas essas chamadas.`;
    } else if (status === "fora_top3") {
      argumento = `Sua empresa aparece fora do Top 3 em ${locDesc}. 82% das decisões de compra no Maps acontecem exclusivamente nas 3 primeiras fichas.`;
    } else {
      argumento = `Sua ficha disputa presença com ${topLider.nome || "concorrentes"} em ${locDesc}. É essencial manter avaliações semanais para não perder a posição.`;
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
  const taxaInvisibilidade = Math.round((totalInvisivel / keywords.length) * 100);

  const palavrasTop3 = keywords.filter((k) => k.status === "top3").length;
  const palavrasMeio = keywords.filter((k) => k.status === "fora_top3").length;
  const scoreSEO = Math.min(
    100,
    Math.max(12, Math.round((palavrasTop3 * 100 + palavrasMeio * 45) / keywords.length))
  );

  const pontosVenda: string[] = [
    `Nas buscas de maior intenção de compra de ${locDesc}, seu cliente encontra primeiro o ${topLider.nome || "líder da região"}.`,
    `Termos com intenção de contratação imediata (como "${keywords[0]?.termo}") exigem presença no Top 3 do Google Maps e anúncios patrocinados no Google Ads.`,
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
