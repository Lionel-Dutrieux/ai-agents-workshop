import { ArrowRight, Bot, Coffee } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoDataCard } from "@/components/demo-data";
import { TechStackDialog } from "@/components/tech-stack-dialog";

const exercises = [
  {
    href: "/01-chat",
    number: "01",
    title: "Premier chat",
    description:
      "Un chatbot avec streaming : appel du modèle avec le AI SDK et affichage de la réponse en temps réel.",
    level: "Découverte",
  },
  {
    href: "/02-structured-output",
    number: "02",
    title: "Structured output",
    description:
      "Transformer des emails clients en tickets structurés et typés grâce à un schéma zod.",
    level: "Facile",
  },
  {
    href: "/03-tools",
    number: "03",
    title: "Tool calling",
    description:
      "Donner des outils au modèle : consulter les commandes, chercher dans le catalogue, vérifier le stock.",
    level: "Intermédiaire",
  },
  {
    href: "/04-agent",
    number: "04",
    title: "Agent multi-étapes",
    description:
      "Un agent autonome qui enchaîne les outils pour traiter une réclamation de bout en bout, avec garde-fous.",
    level: "Intermédiaire +",
  },
  {
    href: "/05-mcp",
    number: "05",
    title: "Serveur MCP",
    description:
      "Exposer les capacités de la boutique via le Model Context Protocol et les brancher sur n'importe quel client.",
    level: "Avancé",
  },
  {
    href: "/06-guardrails",
    number: "06",
    title: "Garde-fous",
    description:
      "La couche de sécurité de l'agent : anti-jailbreak, anti-fuite de secret et injection indirecte, via un middleware officiel du SDK.",
    level: "Avancé +",
  },
  {
    href: "/07-foundry",
    number: "07",
    title: "Microsoft Foundry",
    description:
      "L'approche « agent managé » : l'agent vit dans le cloud Foundry (guardrails, métriques, versions inclus), le code ne fait qu'appeler.",
    level: "Démo",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bot className="size-5" />
          <span className="font-mono text-sm uppercase tracking-widest">
            AI Agents Workshop
          </span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          Créer des agents IA, par le code
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Un workshop pratique pour comprendre et construire des agents : du
          premier appel LLM jusqu&apos;au serveur MCP, en passant par le tool
          calling. Fil rouge : <Coffee className="inline size-4" />{" "}
          <strong>Brewly</strong>, une boutique de café dont vous allez
          construire l&apos;assistant de support.
        </p>
        <div>
          <TechStackDialog />
        </div>
      </header>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Exercices
        </h2>
        {exercises.map((exercise) => (
          <Link key={exercise.href} href={exercise.href} className="group">
            <Card className="transition-colors group-hover:border-primary/40 group-hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-2xl font-semibold text-muted-foreground/60">
                    {exercise.number}
                  </span>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {exercise.title}
                      <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {exercise.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{exercise.level}</Badge>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Préparer l&apos;atelier
        </h2>
        <DemoDataCard />
        <Link className="group" href="/sandbox">
          <Card className="transition-colors group-hover:border-primary/40 group-hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Sandbox — toutes les données
                    <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Voir et modifier le catalogue, les commandes et les données
                    de démo qui alimentent les agents.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </section>
    </main>
  );
}
