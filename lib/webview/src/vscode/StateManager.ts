import { vscodeApi } from "./VsCodeApi";

let state = vscodeApi.getState<any>();
let updateListener: any = undefined;

const updateState = (newState: any | undefined) => {
  vscodeApi.setState(newState);
  state = newState;

  if (updateListener != null) {
    updateListener(state);
  }
};

const processMessage = (event: any) => {
  const message = event.data;
  if (message.type === "updateState") {
    updateState(message.state);
  }
};

window.addEventListener("message", processMessage);

// exposed as Singleton that is managed outside of React
// (to prevent schema change errors from breaking the UI)

export const registerUpdateListener = (
  listener: (state: any | undefined) => void
) => {
  updateListener = listener;
};
