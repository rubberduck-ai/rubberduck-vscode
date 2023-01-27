export type Message = {
  author: "user" | "bot";
  content: string;
};

export type Conversation = {
  trigger: {
    type: "explainCode";
    filename: string;
    selectionStartLine: number;
    selectionEndLine: number;
    selection: string;
  };
  messages: Array<Message>;
  state: {
    type: "userCanReply" | "waitingForBotAnswer";
  };
};
