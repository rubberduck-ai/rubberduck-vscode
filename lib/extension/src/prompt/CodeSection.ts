import { BasicSection } from "./BasicSection";

export class CodeSection extends BasicSection {
  private readonly code: string;

  constructor({ title = "Code", code }: { title?: string; code: string }) {
    super({ title });
    this.code = code;
  }

  assembleContent(): string {
    return `\`\`\`
${this.code}
\`\`\``;
  }
}
