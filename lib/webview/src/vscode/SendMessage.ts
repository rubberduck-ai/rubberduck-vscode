import { vscodeApi } from "./VsCodeApi";
import { webviewApi } from "@rubberduck/common";

export type SendMessage = (message: webviewApi.WebViewMessage) => void;

export const sendMessage: SendMessage = (message) => {
  vscodeApi.postMessage(message);
};
