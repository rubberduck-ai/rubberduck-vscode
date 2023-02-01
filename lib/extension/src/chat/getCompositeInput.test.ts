import { assert, describe, it } from "vitest";
import { getCompositeInput } from "./getCompositeInput";
import { getInput } from "./getInput";

describe("getCompositeInput", () => {
  const firstInputData = { firstData: "irrelevant" };
  const secondInputData = "irrelevant second input data";

  it("should return composed result if all functions resolve", async () => {
    const getInput = getCompositeInput({
      first: createGetInputThatReturns(firstInputData),
      second: createGetInputThatReturns(secondInputData),
    });

    const input = await getInput();
    assert(
      input.result === "success",
      `Expected "success", received "${input.result}"`
    );
    assert.equal(input.data.get("first"), firstInputData);
    assert.equal(input.data.get("second"), secondInputData);
  });

  it("should return an error if one composed function fails", async () => {
    const errorMessage = "Something failed";

    const getInput = getCompositeInput({
      first: createGetInputThatReturns(firstInputData),
      second: createGetInputThatFails(errorMessage),
    });

    const input = await getInput();
    assert(
      input.result === "unavailable",
      `Expected "unavailable", received "${input.result}"`
    );
    assert.equal(input.message, errorMessage);
  });
});

function createGetInputThatReturns<DATA>(data: DATA): getInput<DATA> {
  return async () => ({
    result: "success",
    data,
  });
}

function createGetInputThatFails(message: string): getInput<unknown> {
  return async () => ({
    result: "unavailable",
    type: "info",
    message,
  });
}
