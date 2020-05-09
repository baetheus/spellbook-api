import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import * as pino from "express-pino-logger";
import { toRequestHandler } from "hyper-ts/lib/express";

import {
  getCreaturesHandler,
  getCreatureByIdHandler,
  postCreatureHandler,
  putCreatureHandler,
  deleteCreatureHandler,
} from "./routes";

/**
 * Initialize App
 */
const app = express();
const logger = pino({ level: "debug" });

app.disable("x-powered-by");
app.use(cors({ origin: true }));
app.use(logger);

/**
 * Spellbook Route
 */
const spellbook = express.Router();
spellbook
  .get("/creatures", toRequestHandler(getCreaturesHandler))
  .get("/creatures/:id", toRequestHandler(getCreatureByIdHandler))
  .post("/creatures", toRequestHandler(postCreatureHandler))
  .put("/creatures/:id", toRequestHandler(putCreatureHandler))
  .delete("/creatures/:id", toRequestHandler(deleteCreatureHandler));

/**
 * Setup All Routes
 */
app.use("/spellbook", spellbook);

export const api = functions.https.onRequest(app);
