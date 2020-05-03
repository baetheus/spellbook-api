import * as functions from "firebase-functions";
import * as express from "express";
import { toRequestHandler } from "hyper-ts/lib/express";
import {
  getCreaturesHandler,
  getCreatureByIdHandler,
  postCreatureHandler,
  putCreatureHanndler,
  deleteCreatureHandler,
} from "./routes";

/**
 * Initialize
 */
const app = express();

app
  .get("/", toRequestHandler(getCreaturesHandler))
  .get("/:id", toRequestHandler(getCreatureByIdHandler))
  .post("/", toRequestHandler(postCreatureHandler))
  .put("/:id", toRequestHandler(putCreatureHanndler))
  .delete("/:id", toRequestHandler(deleteCreatureHandler));

export const creatures = functions.https.onRequest(app);
