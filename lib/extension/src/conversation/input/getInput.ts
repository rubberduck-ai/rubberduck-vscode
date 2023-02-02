export type getInput<DATA> = () => Promise<
  | {
      result: "success";
      data: DATA;
    }
  | {
      result: "unavailable";
      type: "info";
      message: string;
    }
>;
