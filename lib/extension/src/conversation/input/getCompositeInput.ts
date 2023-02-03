import { getInput } from "./getInput";

export const getCompositeInput =
  <Inputs extends Record<string, getInput<unknown>>>(
    inputs: Inputs
  ): getInput<Map<keyof Inputs, unknown>> =>
  async () => {
    const result: Map<keyof Inputs, unknown> = new Map();

    for (const [key, input] of Object.entries(inputs)) {
      const inputResult = await input();

      if (inputResult.type === "unavailable") {
        return inputResult;
      }

      result.set(key, inputResult.data);
    }

    return {
      type: "success",
      data: result,
    };
  };
