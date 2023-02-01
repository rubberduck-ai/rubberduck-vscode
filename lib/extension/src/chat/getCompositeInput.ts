import { getInput } from "./getInput";

export const getCompositeInput =
  (inputs: Record<string, getInput<unknown>>): getInput<Map<string, unknown>> =>
  async () => {
    const result: Map<string, unknown> = new Map();

    for (const [key, input] of Object.entries(inputs)) {
      const inputResult = await input();

      if (inputResult.result === "unavailable") {
        return inputResult;
      }

      result.set(key, inputResult.data);
    }

    return {
      result: "success",
      data: result,
    };
  };
