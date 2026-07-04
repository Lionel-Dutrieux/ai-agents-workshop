"use client";

import { useCallback, useEffect, useState } from "react";
import { listModelOptionsAction, type ModelOption } from "./model-actions";

/** Charge les modèles proposés au sélecteur, et permet de rafraîchir. */
export function useModels() {
  const [options, setOptions] = useState<ModelOption[]>([]);

  const refresh = useCallback(async () => {
    setOptions(await listModelOptionsAction());
  }, []);

  useEffect(() => {
    let active = true;
    listModelOptionsAction().then((next) => {
      if (active) {
        setOptions(next);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { options, refresh };
}
