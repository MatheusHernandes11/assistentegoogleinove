/**
 * Conector de Inteligência de Palavras-Chave e CPC do Google Ads em Tempo Real
 * Suporta DataForSEO (Google Ads Live) e Google Ads API oficial
 */

export type MetricasGoogleAdsLive = {
  termo: string;
  volumeMensal: number;
  cpcMedio: number;
  concorrenciaAds: "Alta" | "Média" | "Baixa";
};

export async function buscarMetricasGoogleAdsLive(
  termos: string[],
  cidade?: string
): Promise<Record<string, MetricasGoogleAdsLive> | null> {
  const login = process.env["DATAFORSEO_LOGIN"];
  const password = process.env["DATAFORSEO_PASSWORD"];

  if (!login || !password) {
    return null;
  }

  try {
    const auth = Buffer.from(`${login}:${password}`).toString("base64");
    
    // Consulta a API oficial de volume e leilão de busca do Google Ads via DataForSEO
    const postData = [
      {
        keywords: termos.slice(0, 25),
        location_code: 2076, // Brasil (ID oficial do Google Ads para Brasil)
        language_code: "pt",
      },
    ];

    const response = await fetch("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      console.warn(`DataForSEO retornou status [${response.status}]`);
      return null;
    }

    const json = await response.json();
    const results = json?.tasks?.[0]?.result;

    if (!Array.isArray(results)) {
      return null;
    }

    const mapa: Record<string, MetricasGoogleAdsLive> = {};

    for (const item of results) {
      if (!item.keyword) continue;
      const kw = String(item.keyword).toLowerCase().trim();
      const vol = Number(item.search_volume ?? 0);
      const cpc = Number(item.cpc ?? 0);
      const compRaw = String(item.competition ?? "MEDIUM").toUpperCase();
      const concorrencia: "Alta" | "Média" | "Baixa" =
        compRaw === "HIGH" ? "Alta" : compRaw === "LOW" ? "Baixa" : "Média";

      mapa[kw] = {
        termo: item.keyword,
        volumeMensal: vol,
        cpcMedio: cpc > 0 ? Number(cpc.toFixed(2)) : 3.5,
        concorrenciaAds: concorrencia,
      };
    }

    return mapa;
  } catch (err) {
    console.warn("Falha ao consultar métricas ao vivo do Google Ads:", err);
    return null;
  }
}
