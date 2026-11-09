import { useEffect, useState, useSyncExternalStore } from "react";
import { assinar, carregarSalvo, lerVersao } from "./data";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

let modalAberto = false;
const modalListeners = new Set<(aberto: boolean) => void>();

export function abrirModalAuditoria() {
  modalAberto = true;
  modalListeners.forEach((fn) => fn(true));
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("modal-auditoria", { detail: true }));
      if (window.onabrirauditoria) window.onabrirauditoria();
    } catch { /* ignora */ }
  }
}

export function fecharModalAuditoria() {
  modalAberto = false;
  modalListeners.forEach((fn) => fn(false));
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("modal-auditoria", { detail: false }));
    } catch { /* ignora */ }
  }
}

export function useModalAuditoria() {
  const [aberto, setAberto] = useState(modalAberto);
  useEffect(() => {
    const handler = (novo: boolean) => setAberto(novo);
    modalListeners.add(handler);
    return () => {
      modalListeners.delete(handler);
    };
  }, []);
  return { aberto, abrir: abrirModalAuditoria, fechar: fecharModalAuditoria };
}

let carregado = false;
/** Re-renderiza a página quando a empresa analisada muda. */
export function useAuditoria() {
  const v = useSyncExternalStore(assinar, lerVersao, () => 0);
  const [pronto, setPronto] = useState(carregado);
  useEffect(() => {
    if (!carregado) { carregado = true; carregarSalvo(); }
    setPronto(true);
  }, []);
  return { versao: v, pronto };
}

export function useUsuario() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return user;
}
