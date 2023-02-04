import { marked } from "marked";
import secureJSON from "secure-json-parse";
import {
  ConversationTemplate,
  conversationTemplateSchema,
} from "./ConversationTemplate";

export type ConversationTemplateParseResult =
  | {
      type: "success";
      template: ConversationTemplate;
    }
  | {
      type: "error";
      error: unknown;
    };

export const extractNamedCodeSnippets = (
  content: string
): Map<string, string> => {
  const sectionContents = new Map<string, string>();

  marked
    .lexer(content)
    .filter((token) => token.type === "code")
    .forEach((token) => {
      const codeToken = token as marked.Tokens.Code;

      if (codeToken.lang == null) {
        return; // ignore unlabeled sections
      }

      sectionContents.set(codeToken.lang, codeToken.text);
    });

  return sectionContents;
};

export function parseConversationTemplateOrThrow(
  templateAsRdtMarkdown: string
): ConversationTemplate {
  const parseResult = parseConversationTemplate(templateAsRdtMarkdown);

  if (parseResult.type === "error") {
    throw parseResult.error;
  }

  return parseResult.template;
}

export function parseConversationTemplate(
  templateAsRdtMarkdown: string
): ConversationTemplateParseResult {
  try {
    const namedCodeSnippets = extractNamedCodeSnippets(templateAsRdtMarkdown);

    const conversationTemplateKey = "json conversation-template";
    const conversationTemplateText = namedCodeSnippets.get(
      conversationTemplateKey
    );

    if (conversationTemplateText == null) {
      throw new Error(`Code snippet '${conversationTemplateKey}' not found.`);
    }

    const conversationTemplate = conversationTemplateSchema.parse(
      secureJSON.parse(conversationTemplateText)
    );

    // resolve any handlebars prompt templates:
    const conversationType = conversationTemplate.type;
    switch (conversationType) {
      case "basic-chat": {
        const promptTemplate = conversationTemplate.prompt.template;
        if (promptTemplate.type === "handlebars") {
          const key = `handlebars-${promptTemplate.promptTemplate}`;
          const handlebarsContent = namedCodeSnippets.get(key);

          if (handlebarsContent == null) {
            throw new Error(`Code snippet '${key}' not found.`);
          }

          promptTemplate.promptTemplate = handlebarsContent.replace(
            /\\`\\`\\`/g,
            "```"
          );
        }
        break;
      }
      case "selected-code-analysis-chat": {
        // TODO implement
        break;
      }
      default: {
        const exhaustiveCheck: never = conversationType;
        throw new Error(`unsupported type: ${exhaustiveCheck}`);
      }
    }

    return {
      type: "success",
      template: conversationTemplate,
    };
  } catch (error) {
    return {
      type: "error",
      error,
    };
  }
}
