import * as H from "hyper-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { notNil } from "./utilities";

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

// Data must be serializable and customer accessible.
export type Failure = { type: Errors; data?: any };

export const notFound = (data?: any): Failure => ({ type: Errors.EntityNotFound, data });
export const badArgs = (data?: any): Failure => ({ type: Errors.InvalidArguments, data });
export const badInternalData = (data?: any): Failure => ({
  type: Errors.InvalidInternalData,
  data,
});
export const badMethod = (data?: any): Failure => ({ type: Errors.InvalidMethod, data });
export const datastoreFail = (data?: any): Failure => ({ type: Errors.DatastoreFailure, data });
export const jsonError = (data?: any): Failure => ({ type: Errors.JSONError, data });

const closeHeaders = H.ichain(() => H.closeHeaders());
const send = (message: string, data?: any) => {
  const body = notNil(data) ? `${message}\n\n${JSON.stringify(data, null, 2)}` : message;
  return H.ichain(() => H.send(body));
};

export const sendError = (failure: Failure) => {
  console.error(JSON.stringify(failure));

  switch (failure.type) {
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
        H.status(H.Status.BadRequest),
        closeHeaders,
        send("The supplied arguments are invalid.", failure.data)
      );
    case Errors.InvalidMethod:
      return pipe(
        H.status(H.Status.BadRequest),
        closeHeaders,
        send("Invalid method for this request.")
      );
    case Errors.InvalidInternalData:
      return pipe(H.status(H.Status.ServerError), closeHeaders, send("Internal data is invalid."));
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
