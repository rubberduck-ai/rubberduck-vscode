import * as vscode from "vscode";

/** Log levels in increasing order of importance */
const logLevels = ["debug", "info", "warning", "error"] as const;
type LogLevel = (typeof logLevels)[number];

export interface Logger {
  setLevel(level: LogLevel): void;
  log(message: string | string[], level?: LogLevel): void;
}

export class LoggerUsingVSCodeOutput implements Logger {
  #level: LogLevel = "info";

  constructor(private readonly outputChannel: vscode.OutputChannel) {}

  setLevel(level: LogLevel) {
    this.#level = level;
  }

  log(message: string | string[], level: LogLevel = "info"): void {
    if (!this.canLog(level)) return;

    const lines = ([] as string[]).concat(message);
    lines.forEach((line) => {
      this.outputChannel.appendLine(`${this.prefix} ${line}`);
    });
  }

  private get prefix(): string {
    switch (this.#level) {
      case "debug":
        return "[DEBUG]";

      case "info":
        return "[INFO]";

      case "warning":
        return "[WARNING]";

      case "error":
        return "[ERROR]";
    }
  }

  private canLog(level: LogLevel): boolean {
    return (
      logLevels.findIndex((l) => l == this.#level) >=
      logLevels.findIndex((l) => l == level)
    );
  }
}
