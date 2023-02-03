export type getInput<DATA> = () => Promise<
  | {
      type: "success";
      data: DATA;
    }
  | {
      type: "unavailable";
      display: "info";
      message: string;
    }
>;
