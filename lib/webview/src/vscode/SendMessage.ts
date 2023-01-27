import { vscodeApi } from "./VsCodeApi";
import { WebViewMessage } from "@rubberduck/common";

export type SendMessage = (message: WebViewMessage) => void;

export const sendMessage: SendMessage = (message) => {
  vscodeApi.postMessage(message);
};
