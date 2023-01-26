import { Section } from "./Section";

export class BasicSection implements Section {
  private readonly title: string;

  constructor({ title }: { title: string }) {
    this.title = title;
  }

  assemble(): string {
    return `## ${this.title}
${this.assembleContent()}`;
  }

  protected assembleContent(): string {
    return "";
  }
}
