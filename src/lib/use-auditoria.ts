import { useEffect, useState, useSyncExternalStore } from "react";
import { assinar, carregarSalvo, lerVersao } from "./data";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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
