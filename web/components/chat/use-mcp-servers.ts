"use client";

import { useCallback, useEffect, useState } from "react";
import { countEnabledMcpServersAction } from "./mcp-actions";

/** Nombre de serveurs MCP activés (pour le badge), rafraîchissable. */
export function useMcpServers() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    setCount(await countEnabledMcpServersAction());
  }, []);

  useEffect(() => {
    let active = true;
    countEnabledMcpServersAction().then((next) => {
      if (active) {
        setCount(next);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { count, refresh };
}
