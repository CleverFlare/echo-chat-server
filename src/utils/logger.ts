import nprint from "@monitext/nprint";

export type Options = {
  x?: number;
  y?: number;
  hideDateTime?: boolean;
};

function formattedDateTime() {
  return nprint.cols.blue(new Date().toLocaleString());
}

const log =
  (...messages: string[]) =>
  (options?: Options) => {
    const dateTime = options?.hideDateTime ? [] : [formattedDateTime()];
    nprint.log(
      nprint.pad([...dateTime, ...messages].join(" "), {
        x: options?.x ?? 2,
        y: options?.y,
      }),
    );
  };

const error =
  (...messages: string[]) =>
  (options?: Options) => {
    const dateTime = options?.hideDateTime ? [] : [formattedDateTime()];
    nprint.error(
      nprint.pad(nprint.cols.red([...dateTime, ...messages].join(" ")), {
        x: options?.x ?? 2,
        y: options?.y ?? 0,
      }),
    );
  };

const logger = { log, error };

export default logger;
