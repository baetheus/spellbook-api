import { tryCatch } from "fp-ts/lib/Either";

export const safeParse = (a: unknown) =>
  tryCatch(
    () => JSON.parse(a as string),
    (_) => "Failed to JSON parse input."
  );

export const notNil = <T>(t: T): t is NonNullable<T> => t !== null && t !== undefined;
