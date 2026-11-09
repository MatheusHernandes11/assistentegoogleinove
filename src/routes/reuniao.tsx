import { useAuditoria } from "@/lib/use-auditoria";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { fmt } from "@/components/AppShell";
import { empresa, empresas, lider, pontosCriticos, posicao, score, temDados, voce } from "@/lib/data";
import { analisarKeywordsConcorrentes } from "@/lib/seo-keywords";

export const Route = createFileRoute("/reuniao")({
  head: () => ({
    meta: [
      { title: "Modo Reunião com Cliente · Inove Local" },
      { name: "description", content: "Apresentação executiva da presença local e SEO de Ads para fechar contratos." },
      { property: "og:title", content: "Modo Reunião com Cliente · Inove Local" },
      { property: "og:description", content: "Diagnóstico, pontos críticos, palavras-chave e plano de 90 dias." },
    ],
  }),
  component: Reuniao,
});

function Reuniao() {
  const [script, setScript] = useState(true);
  const { pronto } = useAuditoria();

  const { keywords, diagnostico } = useMemo(() => {
    return analisarKeywordsConcorrentes();
  }, [empresa.segmento, empresa.cidade, empresa.raio, voce.avaliacoes]);

  if (!pronto) return null;
  if (!temDados()) return <Navigate to="/" />;

  const L = lider(), pos = posicao(), s = score(voce);
  const pontos = pontosCriticos();
  const plano = [
    ["Mês 1", "Fundação & Blindagem", "Otimização técnica da Ficha no Google, cadastro de 100% dos serviços e categorias estratégicas, 40+ fotos profissionais."],
    ["Mês 2", "SEO & Prova Social Ativa", "Campanha ativa de avaliações 5 estrelas com QR Code e automação, resposta estratégica com palavras-chave locais e início de Google Ads Pesquisa."],
    ["Mês 3", "Domínio Regional & Top 3", "Publicações semanais, autoridade de backlinks locais e consolidação no Top 3 do Google Maps, superando o líder da região."],
  ];

  return (
    <div className="pitch min-h-screen bg-ink text-surface">
      <div className="mx-auto max-w-6xl px-8 py-10">
        {/* Cabeçalho da Apresentação */}
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-mint font-display font-semibold text-ink">I</span>
            <div>
              <p className="font-display font-semibold tracking-tight text-lg">INOVE LOCAL · Diagnóstico Comercial</p>
              <p className="text-xs text-surface/60">{empresa.nome} · {empresa.cidade} ({empresa.segmento})</p>
            </div>
          </div>
          <div className="no-print flex gap-2 text-sm">
            <button onClick={() => window.print()} className="rounded-lg bg-mint px-4 py-2 font-medium text-ink hover:bg-mint/90 transition shadow-sm">
              Exportar PDF / Imprimir Proposta
            </button>
            <button onClick={() => setScript((v) => !v)} className="rounded-lg px-3 py-1.5 text-surface/70 ring-1 ring-surface/20 hover:text-surface">
              {script ? "Ocultar roteiro de fala" : "Mostrar roteiro de fala"}
            </button>
            <Link to="/" className="rounded-lg px-3 py-1.5 text-surface/70 ring-1 ring-surface/20 hover:text-surface">
              Voltar ao Painel
            </Link>
          </div>
        </div>

        {/* 1. Diagnóstico de Presença */}
        <section className="grid gap-10 md:grid-cols-3 border-b border-surface/10 pb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-surface/50">Score de Presença Inove</p>
            <p className="font-display text-8xl font-semibold leading-none text-coral">{s}<span className="text-3xl text-surface/40">/100</span></p>
            <p className="mt-3 inline-block rounded-full bg-coral/15 px-3 py-1 text-sm text-coral ring-1 ring-coral/30">
              {pos <= 3 ? "Top 3 da região" : "Alerta Crítico: fora do Top 3"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-surface/50">Sua Posição Real</p>
            <p className="font-display text-8xl font-semibold leading-none">{pos}º</p>
            <p className="mt-3 text-surface/60">entre {empresas.length} concorrentes no raio de {empresa.raio} km</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-surface/50">Dono da Região (Líder Atual)</p>
            <p className="mt-2 font-display text-3xl font-semibold text-mint">{L.nome}</p>
            <p className="mt-2 font-mono text-surface/70">★ {fmt(L.nota, 1)} · {L.avaliacoes} avaliações</p>
            <p className="mt-1 text-xs text-surface/50">Leva a maioria das ligações e cliques locais.</p>
          </div>
        </section>

        {/* 2. NOVO: PONTUAR O SEO DE ADS E PALAVRAS-CHAVE NA HORA DA VENDA */}
        <section className="mt-14 border-b border-surface/10 pb-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-mint">Oportunidade Comercial & Tráfego Pago</span>
              <h2 className="mt-1 font-display text-3xl font-semibold">
                O que seus concorrentes estão captando no Google
              </h2>
            </div>
            <div className="flex gap-4">
              <div className="rounded-xl bg-surface/5 p-4 ring-1 ring-surface/10 text-right">
                <p className="text-xs text-surface/50">Buscas Perdidas p/ Concorrência</p>
                <p className="font-display text-2xl font-bold text-coral">~{diagnostico.buscasPerdidasParaConcorrentes.toLocaleString("pt-BR")} <span className="text-xs font-normal">cliques/mês</span></p>
              </div>
              <div className="rounded-xl bg-surface/5 p-4 ring-1 ring-surface/10 text-right">
                <p className="text-xs text-surface/50">Equivalente em Google Ads</p>
                <p className="font-display text-2xl font-bold text-mint">R$ {diagnostico.custoOportunidadeAds.toLocaleString("pt-BR")}<span className="text-xs font-normal">/mês</span></p>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl bg-surface/5 ring-1 ring-surface/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface/10 bg-surface/10 text-xs uppercase tracking-wider text-surface/60">
                <tr>
                  <th className="px-5 py-3">Busca Comercial mais Valiosa</th>
                  <th className="px-4 py-3">Volume Mensal</th>
                  <th className="px-4 py-3">Custo do Clique (Ads)</th>
                  <th className="px-4 py-3">Quem Domina Hoje</th>
                  <th className="px-4 py-3">Sua Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface/10">
                {keywords.slice(0, 5).map((k) => (
                  <tr key={k.id}>
                    <td className="px-5 py-3.5 font-medium">{k.termo}</td>
                    <td className="px-4 py-3.5 font-mono">{k.volumeMensal.toLocaleString("pt-BR")} buscas</td>
                    <td className="px-4 py-3.5 font-mono text-mint">R$ {k.cpcMedio.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-xs text-surface/80">{k.concorrentesQueUsam[0] || L.nome}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-coral/20 px-2.5 py-0.5 text-xs text-coral">
                        Fora do Top 3 ❌
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {script && (
            <div className="mt-4 rounded-xl bg-mint/10 p-5 ring-1 ring-mint/25">
              <p className="text-xs uppercase tracking-wider font-semibold text-mint">Script Comercial para Falar ao Cliente:</p>
              <p className="mt-1 text-sm text-surface/90 leading-relaxed">
                "{empresa.nome}, enquanto você depende apenas de indicações boca a boca, o <strong>{L.nome}</strong> e outros concorrentes estão absorvendo mais de <strong>{diagnostico.buscasPerdidasParaConcorrentes.toLocaleString("pt-BR")} pessoas</strong> que procuram ativamente por <em>'{keywords[0]?.termo}'</em> na sua cidade todo mês. Se você fosse pagar para o Google Ads trazer esse volume, custaria mais de <strong>R$ {diagnostico.custoOportunidadeAds.toLocaleString("pt-BR")}/mês</strong>. Com o nosso método de posicionamento orgânico e gestão de campanhas locais, nós vamos colocar sua empresa na frente deles."
              </p>
            </div>
          )}
        </section>

        {/* 3. Pontos Críticos */}
        <h2 className="mt-14 font-display text-3xl font-semibold">Os {pontos.length} Pontos Críticos de Desvantagem</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pontos.map((p, i) => (
            <div key={p.t} className="rounded-[14px] bg-surface/5 p-6 ring-1 ring-surface/10">
              <span className="font-mono text-sm text-coral">0{i + 1}</span>
              <h3 className="mt-2 font-display text-xl font-semibold">{p.t}</h3>
              <p className="mt-2 text-surface/70">{p.d}</p>
              {script && (
                <p className="mt-4 rounded-lg bg-mint/10 p-3 text-sm text-mint ring-1 ring-mint/20">
                  <b>Como pontuar:</b> {p.p}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 4. Plano de Implementação */}
        <h2 className="print-break mt-16 font-display text-3xl font-semibold">Plano Estratégico de 90 Dias (Inove)</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {plano.map(([m, t, d]) => (
            <div key={m} className="rounded-[14px] bg-surface/5 p-6 ring-1 ring-surface/10">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-mint">{m}</p>
              <p className="mt-2 font-display text-xl font-semibold">{t}</p>
              <p className="mt-2 text-sm text-surface/70 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>

        <div className="no-print mt-14 flex justify-center gap-4">
          <button onClick={() => window.print()} className="rounded-lg bg-surface/10 px-6 py-4 font-display text-base font-semibold text-surface ring-1 ring-surface/20 hover:bg-surface/20 transition">
            Imprimir Proposta / Gerar PDF
          </button>
          <button className="rounded-lg bg-mint px-8 py-4 font-display text-lg font-semibold text-ink hover:bg-mint/90 transition shadow-lg">
            Fechar Parceria com a Inove Local
          </button>
        </div>
      </div>
    </div>
  );
}
