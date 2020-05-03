import * as H from "hyper-ts";
import { pipe } from "fp-ts/lib/pipeable";

/**
 * Errors
 */
export enum Errors {
  EntityNotFound = "EntityNotFound",
  InvalidArguments = "InvalidArguments",
  InvalidInternalData = "InvalidInternalData",
  InvalidMethod = "InvalidMethod",
  DatastoreFailure = "DatastoreFailure",
  JSONError = "JSONError",
}

const closeHeaders = H.ichain(() => H.closeHeaders());
const send = (message: string) => H.ichain(() => H.send(message));

export const sendError = (error: Errors) => {
  switch (error) {
    case Errors.DatastoreFailure:
      return pipe(
        H.status(H.Status.ServerError),
        closeHeaders,
        send("An error occurred while accessing the datastore.")
      );
    case Errors.EntityNotFound:
      return pipe(
        H.status(H.Status.NotFound),
        closeHeaders,
        send("The specified entity does not exist.")
      );
    case Errors.InvalidArguments:
      return pipe(
        H.status(H.Status.NotFound),
        closeHeaders,
        send("The supplied arguments are invalid.")
      );
    case Errors.InvalidMethod:
      return pipe(
        H.status(H.Status.BadRequest),
        closeHeaders,
        send("Invalid method for this request.")
      );
    case Errors.InvalidInternalData:
      return pipe(H.status(H.Status.NotFound), closeHeaders, send("Internal data is invalid."));
    case Errors.JSONError:
      return pipe(
        H.status(H.Status.NotFound),
        closeHeaders,
        send("An error occurred while parsing user supplied JSON.")
      );
    default:
      return pipe(H.status(H.Status.ServerError), closeHeaders, send("An unknown error occurred."));
  }
};
