import type { BundledLanguage } from "shiki";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
} from "@/components/ai-elements/code-block";

export type TutorialCodeProps = {
  code: string;
  /** Langage Shiki (par défaut "tsx"). */
  language?: BundledLanguage;
  /** Nom de fichier / emplacement affiché dans l'en-tête (ex. "app/api/01-chat/route.ts"). */
  filename?: string;
  showLineNumbers?: boolean;
};

/**
 * Bloc de code de tutoriel : coloration Shiki, nom de fichier et bouton copier.
 * Idéal pour montrer « quoi mettre » et « où le mettre ».
 */
export function TutorialCode({
  code,
  language = "tsx",
  filename,
  showLineNumbers = false,
}: TutorialCodeProps) {
  return (
    <CodeBlock code={code} language={language} showLineNumbers={showLineNumbers}>
      {filename && (
        <CodeBlockHeader>
          <CodeBlockFilename>{filename}</CodeBlockFilename>
          <CodeBlockActions>
            <CodeBlockCopyButton />
          </CodeBlockActions>
        </CodeBlockHeader>
      )}
    </CodeBlock>
  );
}
