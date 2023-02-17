import * as vscode from "vscode";

/** Log levels in increasing order of importance */
const logLevels = ["debug", "info", "warning", "error"] as const;
type LogLevel = (typeof logLevels)[number];

export interface Logger {
  setLevel(level: LogLevel): void;
  debug(message: string | string[]): void;
  log(message: string | string[]): void;
  warn(message: string | string[]): void;
  error(message: string | string[]): void;
}

export class LoggerUsingVSCodeOutput implements Logger {
  #level: LogLevel = "info";

  constructor(private readonly outputChannel: vscode.OutputChannel) {}

  setLevel(level: LogLevel) {
    this.#level = level;
  }

  debug(message: string | string[]): void {
    return this.write({
      lines: ([] as string[]).concat(message),
      prefix: "[DEBUG]",
      level: "debug",
    });
  }

  log(message: string | string[]): void {
    return this.write({
      lines: ([] as string[]).concat(message),
      prefix: "[INFO]",
      level: "info",
    });
  }

  warn(message: string | string[]): void {
    return this.write({
      lines: ([] as string[]).concat(message),
      prefix: "[WARNING]",
      level: "warning",
    });
  }

  error(message: string | string[]): void {
    return this.write({
      lines: ([] as string[]).concat(message),
      prefix: "[ERROR]",
      level: "error",
    });
  }

  private write(options: {
    lines: string[];
    prefix: string;
    level: LogLevel;
  }): void {
    const { lines, prefix, level } = options;
    if (!this.canLog(level)) return;

    lines.forEach((line) => {
      this.outputChannel.appendLine(`${prefix} ${line}`);
    });
  }

  private canLog(level: LogLevel): boolean {
    return (
      logLevels.findIndex((l) => l == this.#level) >=
      logLevels.findIndex((l) => l == level)
    );
  }
}
