declare module "node-mbox" {
  function MboxStream(
    inputStream: ReadStream,
    options: Record<string, any>,
  ): {
    on: <TEvent extends "data" | "error" | "finish">(
      arg: TEvent,
      callBack: (arg: TEvent extends "data" ? Buffer : any) => void,
    ) => void;
  };

  export = {
    MboxStream,
  };
}
