"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ConversationSummary,
  deleteConversationAction,
  getConversationMessagesAction,
  listConversationsAction,
  saveConversationAction,
} from "./actions";
import type { ChatUIMessage } from "./types";

export type UseChatHistoryOptions = {
  /** Scope de l'historique (un exercice = une liste de conversations). */
  scope: string;
  /** `setMessages` de `useChat`, pour réhydrater la conversation affichée. */
  setMessages: (messages: ChatUIMessage[]) => void;
};

export type ChatHistory = {
  /** Conversation active (dans l'URL, `?c=`), ou `null` pour un nouveau chat. */
  conversationId: string | null;
  /** Liste des conversations du scope, rafraîchie via `refresh`. */
  conversations: ConversationSummary[];
  /** Recharge la liste depuis la base. */
  refresh: () => Promise<void>;
  /** Sélectionne une conversation et réhydrate les messages. */
  select: (id: string) => Promise<void>;
  /** Démarre une nouvelle conversation vierge. */
  startNew: () => Promise<void>;
  /** Supprime une conversation (et réinitialise si c'était l'active). */
  remove: (id: string) => Promise<void>;
  /** Persiste l'état courant ; crée la conversation au besoin. */
  save: (messages: ChatUIMessage[]) => Promise<void>;
};

/**
 * Gère l'historique local des conversations : sélection, création,
 * suppression et persistance via des Server Actions. La conversation active
 * vit dans le search param `?c=` pour être partageable et survivre au rechargement.
 */
export function useChatHistory({
  scope,
  setMessages,
}: UseChatHistoryOptions): ChatHistory {
  const [conversationId, setConversationId] = useQueryState("c", parseAsString);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  const refresh = useCallback(async () => {
    setConversations(await listConversationsAction(scope));
  }, [scope]);

  // Charge la liste au montage (et si le scope change) pour alimenter le
  // header (titre courant, compteur) sans attendre l'ouverture du volet.
  useEffect(() => {
    let active = true;
    listConversationsAction(scope).then((rows) => {
      if (active) {
        setConversations(rows);
      }
    });
    return () => {
      active = false;
    };
  }, [scope]);

  // Deep-link : au montage, si l'URL pointe une conversation, on la charge une fois.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || !conversationId) {
      return;
    }
    hydratedRef.current = true;

    let cancelled = false;
    getConversationMessagesAction(conversationId).then((messages) => {
      if (!cancelled && messages) {
        setMessages(messages);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId, setMessages]);

  const select = useCallback(
    async (id: string) => {
      const messages = await getConversationMessagesAction(id);
      if (!messages) {
        return;
      }
      setMessages(messages);
      await setConversationId(id);
    },
    [setConversationId, setMessages]
  );

  const startNew = useCallback(async () => {
    setMessages([]);
    await setConversationId(null);
  }, [setConversationId, setMessages]);

  const remove = useCallback(
    async (id: string) => {
      await deleteConversationAction(id);
      if (id === conversationId) {
        setMessages([]);
        await setConversationId(null);
      }
      await refresh();
    },
    [conversationId, refresh, setConversationId, setMessages]
  );

  const save = useCallback(
    async (messages: ChatUIMessage[]) => {
      let id = conversationId;
      if (!id) {
        // Première réponse : on matérialise la conversation dans l'URL.
        id = crypto.randomUUID();
        await setConversationId(id);
      }
      await saveConversationAction({ id, scope, messages });
      await refresh();
    },
    [conversationId, refresh, scope, setConversationId]
  );

  return {
    conversationId,
    conversations,
    refresh,
    select,
    startNew,
    remove,
    save,
  };
}
