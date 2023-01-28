import { Section } from "./Section";

export class NullSection implements Section {
  assemble(): string {
    return "";
  }
}
