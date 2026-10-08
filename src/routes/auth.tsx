import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · Inove Local" },
      { name: "description", content: "Acesse o Inove Local para auditar empresas com dados reais do Google." },
      { property: "og:title", content: "Entrar · Inove Local" },
      { property: "og:description", content: "Acesse sua conta Inove Local." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState(""); const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null); const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setCarregando(true);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setCarregando(false);
      if (error) return setMsg("E-mail ou senha incorretos.");
      nav({ to: "/" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: window.location.origin } });
      setCarregando(false);
      setMsg(error ? error.message : "Conta criada! Confirme pelo link enviado ao seu e-mail.");
    }
  }
  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return setMsg("Não foi possível entrar com Google.");
    if (r.redirected) return;
    nav({ to: "/" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper p-4">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-glow" />
      <form onSubmit={enviar} className="tile w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-ink font-display font-semibold text-surface">I</span>
          <p className="font-display font-semibold">INOVE LOCAL</p>
        </div>
        <h1 className="font-display text-2xl font-semibold">{modo === "entrar" ? "Entrar" : "Criar conta"}</h1>
        <button type="button" onClick={google} className="w-full rounded-lg bg-surface py-2.5 text-sm font-medium ring-1 ring-border hover:ring-ink/30">Continuar com Google</button>
        <input type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg bg-paper px-3 py-2.5 outline-none ring-1 ring-border focus:ring-mint" />
        <input type="password" required minLength={6} placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full rounded-lg bg-paper px-3 py-2.5 outline-none ring-1 ring-border focus:ring-mint" />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button disabled={carregando} className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-surface hover:bg-ink/90 disabled:opacity-60">{modo === "entrar" ? "Entrar" : "Criar conta"}</button>
        <button type="button" onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")} className="w-full text-sm text-muted-foreground hover:text-ink">
          {modo === "entrar" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}
