import * as functions from "firebase-functions";
import * as express from "express";
import * as pino from "express-pino-logger";
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
const logger = pino();

app.use(logger);

app
  .get("/creatures", toRequestHandler(getCreaturesHandler))
  .get("/creatures/:id", toRequestHandler(getCreatureByIdHandler))
  .post("/creatures", toRequestHandler(postCreatureHandler))
  .put("/creatures/:id", toRequestHandler(putCreatureHanndler))
  .delete("/creatures/:id", toRequestHandler(deleteCreatureHandler));

export const api = functions.https.onRequest(app);
