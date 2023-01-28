import { vscodeApi } from "./VsCodeApi";
import { webviewApi } from "@rubberduck/common";

export type SendMessage = (message: webviewApi.OutgoingMessage) => void;

export const sendMessage: SendMessage = (message) => {
  vscodeApi.postMessage(message);
};
