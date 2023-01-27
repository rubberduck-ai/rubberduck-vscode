/*
 * Copyright P42 Software UG (haftungsbeschränkt). All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import { BasicSection } from "./BasicSection";

type Message = {
  content: string;
  author: "user" | "bot";
};

export class ConversationSection extends BasicSection {
  private readonly messages: Array<Message>;

  constructor({
    title = "Conversation",

    messages,
  }: {
    title?: string;
    messages: Array<Message>;
  }) {
    super({ title });
    this.messages = messages;
  }

  assembleContent(): string {
    return this.messages
      .map((message) => `${message.author}: ${message.content.trim()}`)
      .join("\n");
  }
}
