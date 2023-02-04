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

    const conversationTemplateText = namedCodeSnippets.get(
      "json conversation-template"
    );

    if (conversationTemplateText == null) {
      return {
        type: "error",
        error: new Error("Code snippet 'json conversation-template' not found"),
      };
    }

    return {
      type: "success",
      template: conversationTemplateSchema.parse(
        secureJSON.parse(conversationTemplateText)
      ),
    };
  } catch (error) {
    return {
      type: "error",
      error,
    };
  }
}
