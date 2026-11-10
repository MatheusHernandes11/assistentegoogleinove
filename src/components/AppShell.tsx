import { Link } from "@tanstack/react-router";
import { NovaAuditoria, useAbrirAuditoria } from "./NovaAuditoria";
import { useAuditoria } from "@/lib/use-auditoria";
import type { ReactNode } from "react";
import { empresa, temDados } from "@/lib/data";

const nav = [
  { to: "/", label: "Painel" },
  { to: "/mapa", label: "Mapa" },
  { to: "/palavras-chave", label: "Palavras-chave" },
  { to: "/radar", label: "Radar" },
  { to: "/anuncios", label: "Espião de Ads" },
  { to: "/ferramentas", label: "Ferramentas Google" },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  useAuditoria();
  const abrirAuditoria = useAbrirAuditoria();

  return (
    <div className="min-h-screen bg-paper text-ink pb-12">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-glow" />
      
      {/* Header Principal */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-ink font-display font-semibold text-surface">
              I
            </span>
            <div className="leading-tight">
              <p className="font-display font-semibold tracking-tight text-sm sm:text-base">INOVE LOCAL</p>
              <p className="hidden xs:block text-[10px] sm:text-[11px] text-muted-foreground">Inteligência Google Maps & Ads</p>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="transition-colors hover:text-ink"
                activeProps={{ className: "font-semibold text-ink" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Ações no Topo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NovaAuditoria />
            
            <span className="hidden rounded-full bg-mint/15 px-3 py-1 text-xs font-medium text-mint ring-1 ring-mint/25 lg:inline truncate max-w-[200px]">
              {empresa.nome ? `${empresa.nome} · ${empresa.cidade}` : "Nenhuma empresa"}
            </span>

            <Link
              to="/reuniao"
              className="rounded-lg bg-ink px-3.5 py-2 text-xs sm:text-sm font-medium text-surface transition-colors hover:bg-ink/90"
            >
              Modo Reunião
            </Link>
          </div>
        </div>

        {/* Navegação Mobile (Visível apenas em telas menores) */}
        <div className="flex md:hidden border-t border-border/60 bg-surface/50 px-3 py-2 overflow-x-auto gap-2 text-xs">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="px-3 py-1 rounded-md text-muted-foreground whitespace-nowrap hover:text-ink hover:bg-paper transition"
              activeProps={{ className: "bg-ink text-surface font-medium hover:bg-ink hover:text-surface" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Conteúdo da Página */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight">
              {title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-xs sm:text-sm ring-1 ring-border shadow-2xs">
            <span className="size-2 rounded-full bg-mint animate-pulse" />
            <span className="text-muted-foreground">
              {empresa.nome ? `${empresa.nome} (${empresa.cidade})` : "Dados do Google Maps"}
            </span>
          </div>
        </div>

        {/* Ficha & Localização do Cliente Ativo */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-3.5 ring-1 ring-border shadow-2xs">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-mint/15 font-bold text-mint text-xs">🏢</span>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Cliente Atual</span>
                <span className="font-semibold text-ink">{empresa.nome || "Não definido"}</span>
              </div>
            </div>
            
            <div className="hidden sm:block h-6 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-paper font-bold text-muted-foreground text-xs">📍</span>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Endereço & Raio</span>
                <span className="font-medium text-ink">
                  {empresa.endereco ? `${empresa.endereco}, ` : ""}{empresa.cidade} {empresa.uf ? `(${empresa.uf})` : ""} · {empresa.raio} km
                </span>
              </div>
            </div>

            <div className="hidden md:block h-6 w-px bg-border" />

            <div className="hidden md:flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-paper font-bold text-muted-foreground text-xs">🏷️</span>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground">Segmento / Nicho</span>
                <span className="font-medium text-ink">{empresa.segmento || "Comércio / Serviços"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={abrirAuditoria}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-surface transition hover:bg-ink/85 shadow-2xs"
          >
            <span>🎯 Trocar Cliente / Localização</span>
          </button>
        </div>

        {children ? (
          children
        ) : !temDados() ? (
          <div className="tile mx-auto max-w-lg py-12 px-6 text-center">
            <span className="inline-block rounded-full bg-mint/15 px-3 py-1 text-xs font-semibold text-mint mb-3">
              Pronto para Avaliar
            </span>
            <h2 className="font-display text-2xl font-semibold">Comece uma auditoria</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Digite o nome de qualquer empresa e cidade do Brasil. Calculamos nota, avaliações, raio de busca, concorrentes locais e SEO de Ads.
            </p>
            <button
              onClick={abrirAuditoria}
              className="mt-6 rounded-lg bg-ink px-6 py-3 text-sm font-medium text-surface transition hover:bg-ink/90 shadow-md"
            >
              + Analisar Empresa Agora
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export function Bar({ value, tone = "mint" }: { value: number; tone?: "mint" | "coral" | "amber" }) {
  const c = { mint: "bg-mint", coral: "bg-coral", amber: "bg-amber" }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
      <div className={`h-full rounded-full ${c}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export const fmt = (n: number, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
