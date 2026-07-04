"use client";

import { Layers } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Technology = {
  name: string;
  role: string;
  /** Pourquoi ce choix dans le cadre du workshop. */
  why: string;
  /** Alternatives interchangeables, pour montrer que c'est reproductible ailleurs. */
  alternatives: string[];
};

const technologies: Technology[] = [
  {
    name: "AI SDK (Vercel)",
    role: "Boîte à outils TypeScript pour appeler les LLM : génération de texte, streaming, sorties structurées, tool calling et agents — avec une API unifiée entre providers.",
    why: "API cohérente d'un provider à l'autre, excellent support du streaming et des outils, intégration native avec React (useChat). Idéal pour illustrer les concepts sans se noyer dans le HTTP brut.",
    alternatives: [
      "LangChain / LangGraph (JS ou Python)",
      "SDK natif du provider (Anthropic SDK, OpenAI SDK)",
      "Mastra, LlamaIndex",
      "Semantic Kernel / Microsoft Agent Framework (.NET, Python)",
      "Pydantic AI, Spring AI (Java)",
    ],
  },
  {
    name: "Model Context Protocol (MCP)",
    role: "Protocole ouvert pour exposer des outils, ressources et prompts à n'importe quel client IA (Claude Desktop, un IDE, notre agent…).",
    why: "Standard émergent et agnostique : les outils écrits une fois sont réutilisables par tout client compatible. C'est la brique qui montre l'interopérabilité entre agents.",
    alternatives: [
      "Tools « maison » appelés en direct dans le code (sans protocole)",
      "OpenAI Function calling / plugins propriétaires",
      "OpenAPI / gRPC exposés à l'agent",
    ],
  },
  {
    name: "Next.js",
    role: "Framework React full-stack : sert le frontend et héberge les routes API (backend des exercices) dans un seul projet.",
    why: "Frontend + backend au même endroit, un seul déploiement, App Router et Server Components pour du SSR simple. Réduit la friction de setup pendant un workshop de 3h.",
    alternatives: [
      "Remix / React Router, SvelteKit, Nuxt (Vue), Astro",
      "Backend séparé : Express / Hono / Fastify + un front SPA",
      "ASP.NET, FastAPI, Spring Boot pour la partie serveur",
    ],
  },
  {
    name: "Microsoft Foundry",
    role: "Plateforme Azure d'agents managés : threads, orchestration et outils hébergés côté cloud plutôt que codés à la main.",
    why: "Contrepoint pédagogique à l'approche AI SDK : montre ce qu'une plateforme gère à votre place, et que les mêmes concepts existent dans l'écosystème .NET / Azure.",
    alternatives: [
      "OpenAI Assistants API",
      "Amazon Bedrock Agents",
      "Google Vertex AI Agent Builder",
      "LangGraph Platform",
    ],
  },
  {
    name: "shadcn/ui + AI Elements",
    role: "Composants React copiés dans le projet (pas une dépendance figée). AI Elements ajoute les briques spécifiques au chat : conversation, message, tool, reasoning…",
    why: "Le code des composants vit dans le repo : lisible, modifiable, sans magie. AI Elements évite de réécrire une UI de chat streaming depuis zéro.",
    alternatives: [
      "assistant-ui, une UI de chat maison",
      "MUI, Chakra UI, Mantine + composants custom",
      "Bibliothèques de chat clés en main (Vercel v0, CopilotKit)",
    ],
  },
  {
    name: "Prisma + SQLite",
    role: "ORM typé sur une base SQLite locale, seedée avec les données de la boutique Brewly (produits, commandes, clients).",
    why: "SQLite est un simple fichier : zéro serveur à installer, portable, parfait pour une démo. Prisma donne un accès typé aux données depuis les outils de l'agent.",
    alternatives: [
      "Drizzle ORM, Kysely, TypeORM",
      "PostgreSQL / MySQL pour de la production",
      "Données mockées en JSON (sans base du tout)",
    ],
  },
  {
    name: "zod",
    role: "Validation et typage des schémas : formes des sorties structurées et signatures des outils du modèle.",
    why: "Décrit une fois le schéma, on obtient à la fois la validation à l'exécution et les types TypeScript. Le AI SDK s'en sert directement pour les tools et generateObject.",
    alternatives: [
      "Valibot, ArkType, Yup",
      "JSON Schema écrit à la main",
      "TypeBox",
    ],
  },
  {
    name: "nuqs",
    role: "Gestion d'état typée dans l'URL (query params) — ici le modèle sélectionné.",
    why: "L'état partageable et persistant au refresh sans state management lourd. Illustre une bonne pratique Next.js pour un état côté client synchronisé à l'URL.",
    alternatives: [
      "URLSearchParams / useSearchParams à la main",
      "Zustand, Jotai, Redux pour de l'état non-URL",
      "React state simple (sans persistance)",
    ],
  },
];

export function TechStackDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Layers className="size-4" />
          Stack technique
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Stack technique & alternatives</DialogTitle>
          <DialogDescription>
            Les technologies de ce workshop et pourquoi elles sont utilisées.
            Chacune est remplaçable : les concepts se reproduisent dans
            d&apos;autres frameworks et langages.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="-mx-6 max-h-[60vh] px-6">
          <Accordion type="single" collapsible className="w-full">
            {technologies.map((tech) => (
              <AccordionItem key={tech.name} value={tech.name}>
                <AccordionTrigger className="text-left font-medium">
                  {tech.name}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-sm">
                  <p>{tech.role}</p>
                  <div>
                    <p className="mb-1 font-medium text-foreground">
                      Pourquoi ce choix
                    </p>
                    <p className="text-muted-foreground">{tech.why}</p>
                  </div>
                  <div>
                    <p className="mb-2 font-medium text-foreground">
                      Alternatives
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tech.alternatives.map((alt) => (
                        <Badge key={alt} variant="secondary">
                          {alt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
