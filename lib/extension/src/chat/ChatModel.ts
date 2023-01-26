import { Explanation } from "@rubberduck/common";

export class ChatModel {
  explanations: Array<Explanation> = [];
  selectedExplanationIndex: number | undefined;
}
