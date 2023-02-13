import { RetrievalAugmentation } from "../template/RubberduckTemplate";

// TODO need a "load repository file" function

export async function executeRetrievalAugmentation({}: {
  retrievalAugmentation: RetrievalAugmentation;
  variables: Record<string, unknown>;
}): Promise<string | undefined> {
  // TODO and parse file (TODOmeasure time)

  return undefined;
}
