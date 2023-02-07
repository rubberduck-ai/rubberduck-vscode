import { Message } from "@rubberduck/common/build/webview-api";
import { Variable } from "../template/ConversationTemplate";
import { resolveVariable } from "./resolveVariable";
import { validateVariable } from "./validateVariable";

export async function resolveVariables(
  variables: Array<Variable> | undefined,
  {
    time,
    messages,
  }: {
    time: Variable["time"];
    messages?: Array<Message>;
  }
) {
  const variableValues: Record<string, unknown> = {
    messages,
  };

  for (const variable of variables ?? []) {
    if (variable.time !== time) {
      continue;
    }

    if (variableValues[variable.name] != undefined) {
      throw new Error(`Variable '${variable.name}' is already defined`);
    }

    const value = await resolveVariable(variable, { messages });

    validateVariable({ value, variable });

    variableValues[variable.name] = value;
  }

  return variableValues;
}
