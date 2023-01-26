import { Explanation } from "./Explanation";

export type PanelState =
  | {
      explanations: Array<Explanation>;
    }
  | undefined;
