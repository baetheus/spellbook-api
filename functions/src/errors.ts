import * as H from "hyper-ts";
import { pipe } from "fp-ts/lib/pipeable";

/**
 * Errors
 */
export const Err = {
  EntityNotFound: "EntityNotFound",
  InvalidArguments: "InvalidArguments",
  InvalidInternalData: "InvalidInternalData",
  DatastoreFailure: "DatastoreFailure",
  JSONError: "JSONError",
} as const;

export type Errors = typeof Err[keyof typeof Err];

const closeHeaders = H.ichain(() => H.closeHeaders());
const send = (message: string) => H.ichain(() => H.send(message));

export const sendError = (error: Errors) => {
  switch (error) {
    case "DatastoreFailure":
      return pipe(
        H.status(H.Status.ServerError),
        closeHeaders,
        send("An error occurred while accessing the datastore.")
      );
    case "EntityNotFound":
      return pipe(
        H.status(H.Status.NotFound),
        closeHeaders,
        send("The specified entity does not exist.")
      );
    case "InvalidArguments":
      return pipe(
        H.status(H.Status.NotFound),
        closeHeaders,
        send("The supplied arguments are invalid.")
      );
    case "InvalidInternalData":
      return pipe(H.status(H.Status.NotFound), closeHeaders, send("Internal data is invalid."));
    case "JSONError":
      return pipe(
        H.status(H.Status.NotFound),
        closeHeaders,
        send("An error occurred while parsing user supplied JSON.")
      );
  }
};
