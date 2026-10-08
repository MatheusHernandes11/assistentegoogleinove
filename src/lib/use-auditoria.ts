import { useEffect, useSyncExternalStore } from "react";
import { assinar, carregarSalvo, lerVersao } from "./data";

let carregado = false;
/** Re-renderiza a página quando a empresa analisada muda. */
export function useAuditoria() {
  const v = useSyncExternalStore(assinar, lerVersao, () => 0);
  useEffect(() => {
    if (!carregado) { carregado = true; carregarSalvo(); }
  }, []);
  return v;
}
