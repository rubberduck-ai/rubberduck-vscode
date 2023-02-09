import * as vscode from "vscode";
import { ConversationTemplate } from "./ConversationTemplate";

export type ConversationTemplateLoadingResult =
  | {
      type: "success";
      file: vscode.Uri;
      template: ConversationTemplate;
    }
  | {
      type: "error";
      file: vscode.Uri;
      error: unknown;
    };
