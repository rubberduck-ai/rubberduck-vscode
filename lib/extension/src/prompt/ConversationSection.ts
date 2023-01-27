import { BasicSection } from "./BasicSection";

type RoleMapping = {
  bot: string;
  user: string;
};

export type Message = {
  content: string;
  author: "user" | "bot";
};

export class ConversationSection extends BasicSection {
  private readonly roles: RoleMapping;
  private readonly messages: Array<Message>;

  constructor({
    title = "Conversation",
    roles = {
      bot: "bot",
      user: "user",
    },
    messages,
  }: {
    title?: string;
    roles?: RoleMapping;
    messages: Array<Message>;
  }) {
    super({ title });
    this.roles = roles;
    this.messages = messages;
  }

  assembleContent(): string {
    return this.messages
      .map(
        (message) => `${this.roles[message.author]}: ${message.content.trim()}`
      )
      .join("\n");
  }
}
