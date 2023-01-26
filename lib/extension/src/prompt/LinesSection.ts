import { BasicSection } from "./BasicSection";

export class LinesSection extends BasicSection {
  private readonly lines: Array<string>;

  constructor({ title, lines }: { title: string; lines: Array<string> }) {
    super({ title });
    this.lines = lines;
  }

  assembleContent(): string {
    return this.lines.join("\n");
  }
}
