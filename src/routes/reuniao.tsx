import { useAuditoria } from "@/lib/use-auditoria";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { fmt } from "@/components/AppShell";
import { empresa, empresas, lider, posicao, score, voce } from "@/lib/data";

export const Route = createFileRoute("/reuniao")({
  head: () => ({
    meta: [
      { title: "Modo Reunião com Cliente · Inove Local" },
      { name: "description", content: "Apresentação executiva da presença local para fechar contratos." },
      { property: "og:title", content: "Modo Reunião com Cliente · Inove Local" },
      { property: "og:description", content: "Diagnóstico, pontos críticos e plano de 90 dias." },
    ],
  }),
  component: Reuniao,
});

function Reuniao() {
  useAuditoria();
  const [script, setScript] = useState(true);
  const L = lider(), pos = posicao(), s = score(voce);
  const pontos = [
    { t: "Volume de avaliações", d: `Você tem ${voce.avaliacoes} avaliações e o líder tem ${L.avaliacoes} — desvantagem de ${L.avaliacoes - voce.avaliacoes}.`, p: "O Google confia em quem tem mais prova social. Cada avaliação que falta é um cliente que escolhe o vizinho." },
    { t: "Acervo de fotos", d: `A concorrência tem ${L.fotos} fotos contra ${voce.fotos} suas.`, p: "Fichas com mais fotos recebem mais pedidos de rota. Quem não mostra, não é visitado." },
    { t: "Serviços omitidos", d: `Serviços de ${empresa.segmento.toLowerCase()} buscados em ${empresa.cidade} não estão na sua ficha.`, p: "Você faz o serviço, mas para o Google você não faz. Isso é invisibilidade comercial." },
    { t: "Recência de avaliações", d: "Sua última avaliação foi há 3 semanas.", p: "Para o Google, ficha parada é empresa parada. O líder recebe avaliações toda semana." },
  ];
  const plano = [
    ["Mês 1", "Fundação", "Ficha otimizada, serviços e categorias completos, 40 fotos profissionais."],
    ["Mês 2", "Prova social", "Campanha de avaliações com pacientes, respostas a todas as avaliações."],
    ["Mês 3", "Domínio", "Posts semanais, palavras-chave locais e meta de entrar no Top 3."],
  ];

  return (
    <div className="pitch min-h-screen bg-ink text-surface">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-12 flex items-center justify-between">
          <span className="flex items-center gap-3 font-display font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-lg bg-mint text-ink">I</span>INOVE LOCAL · Diagnóstico {empresa.nome}</span>
          <div className="no-print flex gap-2 text-sm">
            <button onClick={() => window.print()} className="rounded-lg bg-mint px-3 py-1.5 font-medium text-ink hover:bg-mint/90">Exportar PDF / Imprimir</button>
            <button onClick={() => setScript((v) => !v)} className="rounded-lg px-3 py-1.5 text-surface/60 ring-1 ring-surface/15 hover:text-surface">{script ? "Ocultar roteiro" : "Mostrar roteiro"}</button>
            <Link to="/" className="rounded-lg px-3 py-1.5 text-surface/60 ring-1 ring-surface/15 hover:text-surface">Sair</Link>
          </div>
        </div>

        <section className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-surface/50">Score Inove</p>
            <p className="font-display text-8xl font-semibold leading-none text-coral">{s}<span className="text-3xl text-surface/40">/100</span></p>
            <p className="mt-3 inline-block rounded-full bg-coral/15 px-3 py-1 text-sm text-coral ring-1 ring-coral/30">{pos <= 3 ? "Top 3 da região" : "Alerta: fora do Top 3"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-surface/50">Posição real na região</p>
            <p className="font-display text-8xl font-semibold leading-none">{pos}º</p>
            <p className="mt-3 text-surface/60">entre {empresas.length} empresas num raio de {empresa.raio} km</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-surface/50">Dono da região</p>
            <p className="mt-2 font-display text-3xl font-semibold">{L.nome}</p>
            <p className="mt-2 font-mono text-surface/70">★ {fmt(L.nota, 1)} · {L.avaliacoes} avaliações</p>
          </div>
        </section>

        <h2 className="mt-20 font-display text-3xl font-semibold">Os 4 pontos críticos</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {pontos.map((p, i) => (
            <div key={p.t} className="rounded-[14px] bg-surface/5 p-6 ring-1 ring-surface/10">
              <span className="font-mono text-sm text-coral">0{i + 1}</span>
              <h3 className="mt-2 font-display text-xl font-semibold">{p.t}</h3>
              <p className="mt-2 text-surface/70">{p.d}</p>
              {script && <p className="mt-4 rounded-lg bg-mint/10 p-3 text-sm text-mint ring-1 ring-mint/20"><b>O que falar:</b> {p.p}</p>}
            </div>
          ))}
        </div>

        <h2 className="print-break mt-20 font-display text-3xl font-semibold">Plano de implementação de 90 dias</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {plano.map(([m, t, d]) => (
            <div key={m} className="rounded-[14px] bg-surface/5 p-6 ring-1 ring-surface/10">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-mint">{m}</p>
              <p className="mt-2 font-display text-xl font-semibold">{t}</p>
              <p className="mt-2 text-sm text-surface/70">{d}</p>
            </div>
          ))}
        </div>
        <div className="no-print mt-14 text-center">
          <button className="rounded-lg bg-mint px-8 py-4 font-display text-lg font-semibold text-ink hover:bg-mint/90">Iniciar Projeto com a Inove</button>
        </div>
      </div>
    </div>
  );
}
