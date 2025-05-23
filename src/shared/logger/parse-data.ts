import { ResponseType } from "./types";

export function parseData(data: ResponseType): string {
  try {
    return JSON.stringify(JSON.parse(data as string), null, 2);
  } catch {
    return data as string;
  }
}
