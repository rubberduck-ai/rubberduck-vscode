import { marked } from "marked";
import secureJSON from "secure-json-parse";
import {
  RubberduckTemplate,
  rubberduckTemplateSchema,
  Prompt,
} from "./RubberduckTemplate";

export type RubberduckTemplateParseResult =
  | {
      type: "success";
      template: RubberduckTemplate;
    }
  | {
      type: "error";
      error: unknown;
    };

class NamedCodeSnippetMap {
  private readonly contentByLangInfo = new Map<string, string>();

  set(langInfo: string, content: string): void {
    this.contentByLangInfo.set(langInfo, content);
  }

  get(langInfo: string): string {
    const content = this.contentByLangInfo.get(langInfo);

    if (content == null) {
      throw new Error(`Code snippet for lang info '${langInfo}' not found.`);
    }

    return content;
  }

  resolveTemplate(prompt: Prompt) {
    prompt.template = this.getHandlebarsTemplate(prompt.template);
  }

  private getHandlebarsTemplate(templateName: string): string {
    return this.get(`template-${templateName}`).replace(/\\`\\`\\`/g, "```");
  }
}

export const extractNamedCodeSnippets = (
  content: string
): NamedCodeSnippetMap => {
  const codeSnippets = new NamedCodeSnippetMap();

  marked
    .lexer(content)
    .filter((token) => token.type === "code")
    .forEach((token) => {
      const codeToken = token as marked.Tokens.Code;
      if (codeToken.lang != null) {
        codeSnippets.set(codeToken.lang, codeToken.text);
      }
    });

  return codeSnippets;
};

export function parseRubberduckTemplateOrThrow(
  templateAsRdtMarkdown: string
): RubberduckTemplate {
  const parseResult = parseRubberduckTemplate(templateAsRdtMarkdown);

  if (parseResult.type === "error") {
    throw parseResult.error;
  }

  return parseResult.template;
}

export function parseRubberduckTemplate(
  templateAsRdtMarkdown: string
): RubberduckTemplateParseResult {
  try {
    const namedCodeSnippets = extractNamedCodeSnippets(templateAsRdtMarkdown);

    const templateText = namedCodeSnippets.get("json conversation-template");

    const template = rubberduckTemplateSchema.parse(
      secureJSON.parse(templateText)
    );

    // resolve prompt templates:
    const conversationType = template.type;
    switch (conversationType) {
      case "basic-chat": {
        namedCodeSnippets.resolveTemplate(template.chat.prompt);
        break;
      }
      case "selected-code-analysis-chat": {
        namedCodeSnippets.resolveTemplate(template.analysis.prompt);
        namedCodeSnippets.resolveTemplate(template.chat.prompt);
        break;
      }
      default: {
        const exhaustiveCheck: never = conversationType;
        throw new Error(`unsupported type: ${exhaustiveCheck}`);
      }
    }

    return {
      type: "success",
      template,
    };
  } catch (error) {
    return {
      type: "error",
      error,
    };
  }
}
