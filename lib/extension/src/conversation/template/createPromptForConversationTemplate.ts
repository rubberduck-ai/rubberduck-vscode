import { ConversationTemplate } from "./ConversationTemplate";
import { assemblePrompt } from "../../prompt/assemblePrompt";
import { CodeSection } from "../../prompt/CodeSection";
import { ConversationSection, Message } from "../../prompt/ConversationSection";
import { LinesSection } from "../../prompt/LinesSection";
import { Section } from "../../prompt/Section";

export function createPromptForConversationTemplate({
  sections,
  variables,
}: {
  sections: ConversationTemplate["prompt"]["sections"];
  variables: {
    selectedText: string | undefined;
    lastMessage: string | undefined;
    messages: Message[];
  } & Record<string, unknown>;
}): string {
  const { selectedText, messages } = variables;

  return assemblePrompt({
    sections: sections
      .map((section) => {
        const type = section.type;
        switch (type) {
          case "lines": {
            return new LinesSection({
              title: section.title,
              lines: section.lines.map((line) =>
                // replace ${variable} with the value of the variable:
                line.replace(
                  /\$\{([^}]+)\}/g,
                  (_, variable) => variables[variable]?.toString() ?? ""
                )
              ),
            });
          }
          case "conversation": {
            return new ConversationSection({
              messages,
              roles: {
                bot: section.roles.bot,
                user: section.roles.user,
              },
            });
          }
          case "optional-selected-code": {
            return selectedText != null
              ? new CodeSection({
                  title: "Selected Code",
                  code: selectedText,
                })
              : undefined;
          }
          default: {
            const exhaustiveCheck: never = type;
            throw new Error(`unsupported type: ${exhaustiveCheck}`);
          }
        }
      })
      .filter((section) => section != undefined) as Array<Section>,
  });
}
