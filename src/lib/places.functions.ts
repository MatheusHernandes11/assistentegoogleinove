import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gerarAuditoriaNacional, type Auditoria } from "./data";
import { buscarMetricasGoogleAdsLive } from "./keywords-api";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps/places/v1";

type Place = {
  id: string; displayName?: { text: string }; formattedAddress?: string; rating?: number;
  userRatingCount?: number; location?: { latitude: number; longitude: number };
  photos?: unknown[]; types?: string[]; websiteUri?: string;
  reviews?: { publishTime?: string }[];
};

async function places(path: string, body: unknown, mask: string): Promise<Place[]> {
  const lovable = process.env["LOVABLE_API_KEY"];
  const maps = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovable || !maps) {
    throw new Error("Chaves de API do Google Maps não configuradas no servidor.");
  }
  const res = await fetch(`${GATEWAY}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": maps, "Content-Type": "application/json", "X-Goog-FieldMask": mask },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error(`Places falhou [${res.status}]: ${t}`);
    throw new Error(`Falha ao consultar o Google (${res.status}).`);
  }
  return ((await res.json()) as { places?: Place[] }).places ?? [];
}

function km(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * r, dLng = (b.longitude - a.longitude) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const CAMPOS = "id,displayName,formattedAddress,rating,userRatingCount,location,photos,types,websiteUri";
const GENERICOS = new Set(["point_of_interest", "establishment", "health", "store", "food"]);

function mapear(p: Place, centro: { latitude: number; longitude: number }) {
  const loc = p.location ?? centro;
  return {
    placeId: p.id, nome: p.displayName?.text ?? "Sem nome", endereco: p.formattedAddress ?? "",
    nota: p.rating ?? 0, avaliacoes: p.userRatingCount ?? 0, fotos: p.photos?.length ?? 0,
    categorias: (p.types ?? []).filter((t) => !GENERICOS.has(t)).length, site: !!p.websiteUri,
    lat: loc.latitude, lng: loc.longitude, distancia: Math.round(km(centro, loc) * 10) / 10,
  };
}

export const auditarEmpresa = createServerFn({ method: "POST" })
  .validator((d) => z.object({
    nome: z.string().trim().min(2).max(120),
    cidade: z.string().trim().min(2).max(80),
    uf: z.string().trim().max(10).optional(),
    endereco: z.string().trim().max(120),
    segmento: z.string().trim().min(2).max(80),
    raio: z.number().min(1).max(30),
  }).parse(d))
  .handler(async ({ data }): Promise<Auditoria["resultado"]> => {
    try {
      // Consulta ao Google Places oficial
      const [alvo] = await places("places:searchText",
        { textQuery: `${data.nome} ${data.endereco} ${data.cidade}`, pageSize: 1, languageCode: "pt-BR", regionCode: "BR" },
        CAMPOS.split(",").map((c) => `places.${c}`).join(",") + ",places.reviews.publishTime");

      if (alvo?.location) {
        const centro = alvo.location;
        const conc = await places("places:searchText", {
          textQuery: `${data.segmento} em ${data.cidade}`, pageSize: 20, languageCode: "pt-BR", regionCode: "BR",
          locationBias: { circle: { center: centro, radius: data.raio * 1000 } },
        }, CAMPOS.split(",").map((c) => `places.${c}`).join(","));

        const ultima = (alvo.reviews ?? []).map((r) => r.publishTime).filter(Boolean).sort().pop() ?? null;
        return {
          voce: { ...mapear(alvo, centro), distancia: 0 },
          concorrentes: conc.filter((p) => p.id !== alvo.id).map((p) => mapear(p, centro)).filter((c) => c.distancia <= data.raio),
          ultimaAvaliacao: ultima, centro: { lat: centro.latitude, lng: centro.longitude },
        };
      }
    } catch (err) {
      console.error("Erro na consulta do Google Places:", err);
      throw new Error(
        err instanceof Error
          ? err.message
          : `Não foi possível consultar os dados reais no Google Places para "${data.nome}" em "${data.cidade}".`
      );
    }

    throw new Error(
      `Nenhuma ficha real encontrada no Google Maps para "${data.nome}" em "${data.cidade}". Verifique se o nome comercial e endereço coincidem com a ficha do Google.`
    );
  });

export const rankingPalavra = createServerFn({ method: "POST" })
  .validator((d) => z.object({ termo: z.string().trim().min(2).max(100), lat: z.number(), lng: z.number() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const r = await places("places:searchText", {
        textQuery: data.termo, pageSize: 10, languageCode: "pt-BR", regionCode: "BR",
        locationBias: { circle: { center: { latitude: data.lat, longitude: data.lng }, radius: 10000 } },
      }, "places.id,places.displayName,places.rating,places.userRatingCount");
      if (r && r.length > 0) {
        return r.map((p) => ({ placeId: p.id, nome: p.displayName?.text ?? "", nota: p.rating ?? 0, avaliacoes: p.userRatingCount ?? 0 }));
      }
    } catch (e) {
      console.warn("Google Places indisponível para ranking:", e);
    }

    // Não retorna dados falsos: apenas dados reais se existirem
    return [];
  });

export const consultarGoogleAdsLive = createServerFn({ method: "POST" })
  .validator((d) => z.object({ termos: z.array(z.string()), cidade: z.string().optional() }).parse(d))
  .handler(async ({ data }) => {
    return await buscarMetricasGoogleAdsLive(data.termos, data.cidade);
  });

export const consultarPageSpeed = createServerFn({ method: "POST" })
  .validator((d) => z.object({ url: z.string().min(3) }).parse(d))
  .handler(async ({ data }) => {
    const urlLimpa = data.url.trim().startsWith("http") ? data.url.trim() : `https://${data.url.trim()}`;
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        urlLimpa
      )}&strategy=mobile`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const json = await res.json();
        const score = Math.round((json?.lighthouseResult?.categories?.performance?.score ?? 0.5) * 100);
        const fcp = Number(
          (json?.lighthouseResult?.audits?.["first-contentful-paint"]?.numericValue ?? 2500) / 1000
        ).toFixed(1);
        const lcp = Number(
          (json?.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue ?? 3800) / 1000
        ).toFixed(1);

        return {
          url: urlLimpa,
          scoreMobile: score,
          fcpSegundos: Number(fcp),
          lcpSegundos: Number(lcp),
          status: score >= 80 ? "Excelente" : score >= 50 ? "Alerta" : "Crítico",
          impactoGoogleMaps:
            score < 50
              ? "Site lento no celular: o Google Maps reduz o posicionamento de empresas com páginas que demoram para carregar."
              : "Velocidade satisfatória para indexação no Google.",
        };
      }
    } catch (err) {
      console.warn("Falha ao consultar PageSpeed:", err);
    }

    // Não retorna dados falsos: se o Google não responder, retorna nulo
    return null;
  });
