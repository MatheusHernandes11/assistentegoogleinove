import { empresa, lider, concorrentes, type Empresa } from "./data";

export type ConcorrenteRealAds = {
  id: string;
  nome: string;
  nota: number;
  avaliacoes: number;
  fotos: number;
  endereco: string;
  distancia: number;
  site: boolean;
  linkTransparenciaGoogle: string;
  linkGoogleMaps: string;
};

/** Gera o link oficial da Biblioteca de Anúncios do Google (Google Ads Transparency Center) */
export function gerarLinkGoogleAdsTransparency(termoOuEmpresa: string): string {
  const busca = encodeURIComponent(termoOuEmpresa.trim());
  return `https://adstransparency.google.com/?region=BR&query=${busca}`;
}

/** Gera link de busca no Google com foco em anúncios patrocinados da região */
export function gerarLinkBuscaGooglePatrocinados(termo: string, cidade?: string): string {
  const q = encodeURIComponent(`${termo} ${cidade ?? ""}`.trim());
  return `https://www.google.com.br/search?q=${q}`;
}

/** Prepara lista de concorrentes 100% REAIS detectados no Google Maps para consulta no Google Ads */
export function obterConcorrentesReaisParaAds(listaConcs?: Empresa[]): ConcorrenteRealAds[] {
  const concs = listaConcs && listaConcs.length > 0 ? listaConcs : concorrentes();
  const topLider = lider();

  const todos = [
    ...(topLider.nome && topLider.nome !== "—" ? [topLider] : []),
    ...concs.filter((c) => c.id !== topLider.id),
  ];

  return todos.map((c) => {
    const nomeLimpo = c.nome.split("|")[0]?.split("-")[0]?.trim() || c.nome;
    const queryMaps = encodeURIComponent(`${c.nome} ${c.endereco || ""}`.trim());

    return {
      id: c.id,
      nome: c.nome,
      nota: c.nota,
      avaliacoes: c.avaliacoes,
      fotos: c.fotos,
      endereco: c.endereco || "",
      distancia: c.distancia,
      site: Boolean(c.site),
      linkTransparenciaGoogle: gerarLinkGoogleAdsTransparency(nomeLimpo),
      linkGoogleMaps: `https://www.google.com/maps/search/?api=1&query=${queryMaps}`,
    };
  });
}
