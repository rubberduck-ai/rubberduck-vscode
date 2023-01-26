import { vscodeApi } from "./VsCodeApi";

export type SendMessage = (message: { type: string; data: unknown }) => void;

export const sendMessage: SendMessage = (message) => {
  vscodeApi.postMessage(message);
};
