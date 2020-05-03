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
