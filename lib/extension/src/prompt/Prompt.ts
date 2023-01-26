import { Section } from "./Section";

export const assemblePrompt = ({
  sectionSeparator = "\n \n",
  sections,
}: {
  sections: Array<Section>;
  sectionSeparator?: string;
}): string =>
  sections.map((section) => section.assemble()).join(sectionSeparator);
