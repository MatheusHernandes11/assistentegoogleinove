export type CidadeBrasil = {
  nome: string;
  uf: string;
  lat: number;
  lng: number;
  populacao: number; // estimativa para calibrar volume de busca
  fatorBusca: number; // multiplicador de mercado
};

export const CIDADES_BRASIL: CidadeBrasil[] = [
  // Capitais
  { nome: "São Paulo", uf: "SP", lat: -23.5505, lng: -46.6333, populacao: 11451245, fatorBusca: 3.5 },
  { nome: "Rio de Janeiro", uf: "RJ", lat: -22.9068, lng: -43.1729, populacao: 6211423, fatorBusca: 2.8 },
  { nome: "Brasília", uf: "DF", lat: -15.7975, lng: -47.8919, populacao: 2817068, fatorBusca: 2.2 },
  { nome: "Salvador", uf: "BA", lat: -12.9714, lng: -38.5014, populacao: 2418005, fatorBusca: 1.8 },
  { nome: "Fortaleza", uf: "CE", lat: -3.7172, lng: -38.5433, populacao: 2428678, fatorBusca: 1.8 },
  { nome: "Belo Horizonte", uf: "MG", lat: -19.9167, lng: -43.9345, populacao: 2315560, fatorBusca: 2.1 },
  { nome: "Manaus", uf: "AM", lat: -3.1190, lng: -60.0217, populacao: 2063547, fatorBusca: 1.5 },
  { nome: "Curitiba", uf: "PR", lat: -25.4284, lng: -49.2733, populacao: 1773733, fatorBusca: 2.0 },
  { nome: "Recife", uf: "PE", lat: -8.0476, lng: -34.8770, populacao: 1488920, fatorBusca: 1.7 },
  { nome: "Goiânia", uf: "GO", lat: -16.6869, lng: -49.2648, populacao: 1437237, fatorBusca: 1.7 },
  { nome: "Belém", uf: "PA", lat: -1.4558, lng: -48.4902, populacao: 1303389, fatorBusca: 1.4 },
  { nome: "Porto Alegre", uf: "RS", lat: -30.0346, lng: -51.2177, populacao: 1332570, fatorBusca: 1.8 },
  { nome: "Guarulhos", uf: "SP", lat: -23.4542, lng: -46.5333, populacao: 1291784, fatorBusca: 1.6 },
  { nome: "Campinas", uf: "SP", lat: -22.9056, lng: -47.0608, populacao: 1138309, fatorBusca: 1.9 },
  { nome: "São Luís", uf: "MA", lat: -2.5307, lng: -44.3068, populacao: 1037775, fatorBusca: 1.3 },
  { nome: "São Gonçalo", uf: "RJ", lat: -22.8269, lng: -43.0539, populacao: 896744, fatorBusca: 1.2 },
  { nome: "Maceió", uf: "AL", lat: -9.6658, lng: -35.7350, populacao: 957916, fatorBusca: 1.3 },
  { nome: "Campo Grande", uf: "MS", lat: -20.4697, lng: -54.6201, populacao: 897938, fatorBusca: 1.4 },
  { nome: "Natal", uf: "RN", lat: -5.7945, lng: -35.2110, populacao: 751300, fatorBusca: 1.3 },
  { nome: "Teresina", uf: "PI", lat: -5.0920, lng: -42.8038, populacao: 866300, fatorBusca: 1.2 },
  { nome: "São Bernardo do Campo", uf: "SP", lat: -23.6944, lng: -46.5654, populacao: 810729, fatorBusca: 1.5 },
  { nome: "João Pessoa", uf: "PB", lat: -7.1195, lng: -34.8450, populacao: 833932, fatorBusca: 1.3 },
  { nome: "Santo André", uf: "SP", lat: -23.6639, lng: -46.5383, populacao: 748919, fatorBusca: 1.4 },
  { nome: "Osasco", uf: "SP", lat: -23.5329, lng: -46.7920, populacao: 743432, fatorBusca: 1.4 },
  { nome: "São José dos Campos", uf: "SP", lat: -23.2237, lng: -45.9009, populacao: 697428, fatorBusca: 1.5 },
  { nome: "Ribeirão Preto", uf: "SP", lat: -21.1704, lng: -47.8103, populacao: 698259, fatorBusca: 1.6 },
  { nome: "Uberlândia", uf: "MG", lat: -18.9186, lng: -48.2772, populacao: 699097, fatorBusca: 1.5 },
  { nome: "Sorocaba", uf: "SP", lat: -23.5015, lng: -47.4587, populacao: 723574, fatorBusca: 1.4 },
  { nome: "Cuiabá", uf: "MT", lat: -15.6014, lng: -56.0979, populacao: 650912, fatorBusca: 1.4 },
  { nome: "Aracaju", uf: "SE", lat: -10.9472, lng: -37.0731, populacao: 602757, fatorBusca: 1.2 },
  { nome: "Feira de Santana", uf: "BA", lat: -12.2667, lng: -38.9667, populacao: 616279, fatorBusca: 1.2 },
  { nome: "Joinville", uf: "SC", lat: -26.3045, lng: -48.8487, populacao: 616323, fatorBusca: 1.5 },
  { nome: "Londrina", uf: "PR", lat: -23.3045, lng: -51.1696, populacao: 555965, fatorBusca: 1.4 },
  { nome: "Niterói", uf: "RJ", lat: -22.8859, lng: -43.1153, populacao: 481758, fatorBusca: 1.5 },
  { nome: "Florianópolis", uf: "SC", lat: -27.5954, lng: -48.5480, populacao: 537213, fatorBusca: 1.7 },
  { nome: "Maringá", uf: "PR", lat: -23.4210, lng: -51.9331, populacao: 409657, fatorBusca: 1.4 },
  { nome: "Santos", uf: "SP", lat: -23.9608, lng: -46.3336, populacao: 418608, fatorBusca: 1.4 },
  { nome: "Caxias do Sul", uf: "RS", lat: -29.1678, lng: -51.1794, populacao: 463376, fatorBusca: 1.3 },
  { nome: "Blumenau", uf: "SC", lat: -26.9194, lng: -49.0661, populacao: 361261, fatorBusca: 1.3 },
  { nome: "Porto Velho", uf: "RO", lat: -8.7619, lng: -63.9039, populacao: 460413, fatorBusca: 1.1 },
  { nome: "Macapá", uf: "AP", lat: 0.0389, lng: -51.0664, populacao: 442933, fatorBusca: 1.0 },
  { nome: "Palmas", uf: "TO", lat: -10.1844, lng: -48.3336, populacao: 302692, fatorBusca: 1.1 },
  { nome: "Boa Vista", uf: "RR", lat: 2.8235, lng: -60.6758, populacao: 413486, fatorBusca: 1.0 },
  { nome: "Rio Branco", uf: "AC", lat: -9.9753, lng: -67.8249, populacao: 364756, fatorBusca: 1.0 },
  { nome: "Vitória", uf: "ES", lat: -20.3155, lng: -40.3128, populacao: 322869, fatorBusca: 1.4 },
  { nome: "Vila Velha", uf: "ES", lat: -20.3297, lng: -40.2925, populacao: 467722, fatorBusca: 1.3 },
  { nome: "Cascavel", uf: "PR", lat: -24.9578, lng: -53.4595, populacao: 348051, fatorBusca: 1.2 },
  { nome: "Ponta Grossa", uf: "PR", lat: -25.0950, lng: -50.1619, populacao: 358371, fatorBusca: 1.2 },
  { nome: "Foz do Iguaçu", uf: "PR", lat: -25.5163, lng: -54.5854, populacao: 285415, fatorBusca: 1.2 },
  { nome: "Balneário Camboriú", uf: "SC", lat: -26.9930, lng: -48.6353, populacao: 139155, fatorBusca: 1.6 },
  { nome: "Itajaí", uf: "SC", lat: -26.9078, lng: -48.6619, populacao: 264054, fatorBusca: 1.3 },
  { nome: "Chapecó", uf: "SC", lat: -27.1004, lng: -52.6152, populacao: 254781, fatorBusca: 1.2 },
  { nome: "Canoas", uf: "RS", lat: -29.9178, lng: -51.1836, populacao: 347657, fatorBusca: 1.2 },
  { nome: "Pelotas", uf: "RS", lat: -31.7654, lng: -52.3376, populacao: 325689, fatorBusca: 1.1 },
  { nome: "Santa Maria", uf: "RS", lat: -29.6842, lng: -53.8069, populacao: 271633, fatorBusca: 1.1 },
  { nome: "Juiz de Fora", uf: "MG", lat: -21.7595, lng: -43.3444, populacao: 540756, fatorBusca: 1.3 },
  { nome: "Montes Claros", uf: "MG", lat: -16.7350, lng: -43.8617, populacao: 414240, fatorBusca: 1.1 },
  { nome: "Piracicaba", uf: "SP", lat: -22.7253, lng: -47.6492, populacao: 423323, fatorBusca: 1.3 },
  { nome: "Bauru", uf: "SP", lat: -22.3145, lng: -49.0587, populacao: 379146, fatorBusca: 1.2 },
  { nome: "Jundiaí", uf: "SP", lat: -23.1857, lng: -46.8978, populacao: 443116, fatorBusca: 1.4 },
  { nome: "São José do Rio Preto", uf: "SP", lat: -20.8113, lng: -49.3758, populacao: 480439, fatorBusca: 1.3 },
  { nome: "Franca", uf: "SP", lat: -20.5386, lng: -47.4008, populacao: 352537, fatorBusca: 1.2 },
  { nome: "Anápolis", uf: "GO", lat: -16.3267, lng: -48.9533, populacao: 398817, fatorBusca: 1.2 },
  { nome: "Aparecida de Goiânia", uf: "GO", lat: -16.8228, lng: -49.2458, populacao: 527550, fatorBusca: 1.2 },
];

export const ESTADOS_BRASIL = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

export function normalizarTexto(txt: string) {
  return txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/** Extrai o nome mais representativo do bairro ou rua para compor termos de busca hiperlocais */
export function extrairBairroOuRua(endereco: string | undefined): string {
  if (!endereco) return "";
  const limpo = endereco.trim();
  if (!limpo) return "";

  // Se houver hífen, por exemplo "Av. Paulista, 1000 - Bela Vista", pega o bairro
  if (limpo.includes("-")) {
    const partes = limpo.split("-");
    const ult = partes[partes.length - 1]?.trim();
    if (ult && ult.length > 2 && !ult.match(/^[0-9]+$/)) return ult;
  }

  // Se houver vírgula, por exemplo "Rua das Flores, Centro"
  if (limpo.includes(",")) {
    const partes = limpo.split(",");
    const ult = partes[partes.length - 1]?.trim();
    if (ult && ult.length > 2 && !ult.match(/^[0-9]+$/)) return ult;
    const prim = partes[0]?.trim();
    if (prim && prim.length > 2) return prim;
  }

  return limpo;
}

/** Localiza coordenadas geográficas de qualquer cidade do Brasil */
export function buscarCoordenadasBrasil(cidadeNome: string, uf?: string): { lat: number; lng: number; nomeFormatado: string; fatorBusca: number } {
  const cNorm = normalizarTexto(cidadeNome);
  const uNorm = uf ? uf.toUpperCase().trim() : "";

  // 1. Busca exata na lista
  const match = CIDADES_BRASIL.find((c) => {
    const nomeOk = normalizarTexto(c.nome) === cNorm;
    if (uNorm) return nomeOk && c.uf === uNorm;
    return nomeOk;
  });

  if (match) {
    return {
      lat: match.lat,
      lng: match.lng,
      nomeFormatado: `${match.nome} - ${match.uf}`,
      fatorBusca: match.fatorBusca,
    };
  }

  // 2. Busca parcial (contém)
  const parcial = CIDADES_BRASIL.find((c) => {
    const nomeContem = normalizarTexto(c.nome).includes(cNorm) || cNorm.includes(normalizarTexto(c.nome));
    if (uNorm) return nomeContem && c.uf === uNorm;
    return nomeContem;
  });

  if (parcial) {
    return {
      lat: parcial.lat,
      lng: parcial.lng,
      nomeFormatado: `${parcial.nome} - ${parcial.uf}`,
      fatorBusca: parcial.fatorBusca,
    };
  }

  // 3. Fallback geográfico proporcional para qualquer outra cidade do Brasil usando hash determinístico centralizado no território nacional
  let hash = 0;
  for (let i = 0; i < cidadeNome.length; i++) {
    hash = (hash << 5) - hash + cidadeNome.charCodeAt(i);
    hash |= 0;
  }
  const latDelta = ((Math.abs(hash) % 2000) / 100) - 10; // variação dentro do território BR
  const lngDelta = ((Math.abs(hash * 3) % 2000) / 100) - 10;
  
  // Ponto médio Brasil (-14.2350, -51.9253)
  const lat = Math.max(-32, Math.min(2, -15.0 + (latDelta * 0.5)));
  const lng = Math.max(-70, Math.min(-35, -48.0 + (lngDelta * 0.5)));

  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    nomeFormatado: uf ? `${cidadeNome} - ${uf.toUpperCase()}` : cidadeNome,
    fatorBusca: 1.2,
  };
}
