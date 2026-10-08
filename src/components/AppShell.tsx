import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { empresa } from "@/lib/data";

const nav = [
  { to: "/", label: "Painel" },
  { to: "/mapa", label: "Mapa" },
  { to: "/palavras-chave", label: "Palavras-chave" },
  { to: "/radar", label: "Radar" },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-glow" />
      <header className="sticky top-0 z-20 border-b border-border bg-surface/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-ink font-display font-semibold text-surface">I</span>
            <div className="leading-tight">
              <p className="font-display font-semibold tracking-tight">INOVE LOCAL</p>
              <p className="text-[11px] text-muted-foreground">Inteligência de presença no Google</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="transition-colors hover:text-ink" activeProps={{ className: "font-medium text-ink" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <NovaAuditoria />
            <span className="hidden rounded-full bg-mint/10 px-3 py-1 text-xs font-medium text-mint ring-1 ring-mint/25 xl:inline">
              {empresa.nome} · {empresa.cidade}
            </span>
            <Link to="/reuniao" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-ink/90">
              Modo Reunião
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm ring-1 ring-border">
            <span className="size-2 rounded-full bg-mint" />
            <span className="text-muted-foreground">Monitoramento ativo · dados simulados</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Bar({ value, tone = "mint" }: { value: number; tone?: "mint" | "coral" | "amber" }) {
  const c = { mint: "bg-mint", coral: "bg-coral", amber: "bg-amber" }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
      <div className={`h-full rounded-full ${c}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export const fmt = (n: number, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
