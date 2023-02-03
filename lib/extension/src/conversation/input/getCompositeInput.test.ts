import { assert, describe, expect, it } from "vitest";
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
      input.type === "success",
      `Expected "success", received "${input.type}"`
    );
    expect(input.data.get("first")).toEqual(firstInputData);
    expect(input.data.get("second")).toEqual(secondInputData);
  });

  it("should return an error if one composed function fails", async () => {
    const errorMessage = "Something failed";

    const getInput = getCompositeInput({
      first: createGetInputThatReturns(firstInputData),
      second: createGetInputThatFails(errorMessage),
    });

    const input = await getInput();
    assert(
      input.type === "unavailable",
      `Expected "unavailable", received "${input.type}"`
    );
    expect(input.message).toEqual(errorMessage);
  });
});

function createGetInputThatReturns<DATA>(data: DATA): getInput<DATA> {
  return async () => ({
    type: "success",
    data,
  });
}

function createGetInputThatFails(message: string): getInput<unknown> {
  return async () => ({
    type: "unavailable",
    display: "info",
    message,
  });
}
