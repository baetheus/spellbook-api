import { initializeApp, firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import * as t from "io-ts";
import * as H from "hyper-ts";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

import { Errors, sendError } from "./errors";
import { Creature, CreatureWithId, CreaturesWithIds } from "./validators";
import { Firedata } from "./types";

/**
 * Firestore
 */
const config = functions.firebaseConfig() ?? undefined; // Whoever built this is a punk
const app = initializeApp(config);
const db = firestore(app);
const creatureDb = db.collection("creatures");

/**
 * Decoders
 */
const decodeCreatureBody = pipe(
  H.decodeBody(Creature.decode),
  H.mapLeft(() => Errors.InvalidArguments)
);
const chainCreatureWithIdDecode = (data: unknown) =>
  TE.fromEither<Errors, CreatureWithId>(
    E.mapLeft(() => Errors.InvalidInternalData)(CreatureWithId.decode(data))
  );

/**
 * Params
 */
const hasId = pipe(
  H.decodeParam("id", t.string.decode),
  H.mapLeft(() => Errors.InvalidArguments)
);

/**
 * Send JSON
 */
export const sendJSON = <D>(d: D): H.Middleware<H.StatusOpen, H.ResponseEnded, Errors, void> =>
  pipe(
    H.status(H.Status.OK),
    H.ichain(() => H.json(d, () => Errors.JSONError))
  );

const closeOk = (): H.Middleware<H.StatusOpen, H.ResponseEnded, Errors, void> =>
  pipe(
    H.status(H.Status.OK),
    H.ichain(() => H.closeHeaders()),
    H.ichain(() => H.end())
  );

/**
 * Firebase Tasks
 */
const getCreatures = pipe(
  TE.rightTask(() => creatureDb.get()),
  TE.map((collection) => collection.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
  TE.chain((docs) => TE.fromEither(CreaturesWithIds.decode(docs))),
  TE.mapLeft(() => Errors.InvalidInternalData)
);

const getCreatureById = (id: string) =>
  pipe(
    TE.rightTask<Errors, Firedata>(() => creatureDb.doc(id).get()),
    TE.chain((snap) =>
      snap.exists ? TE.right({ ...snap.data(), id: snap.id }) : TE.left(Errors.EntityNotFound)
    ),
    TE.chain(chainCreatureWithIdDecode)
  );

const addCreature = (creature: Creature) =>
  pipe(
    TE.rightTask(() => creatureDb.add(creature)),
    TE.chain((ref) => getCreatureById(ref.id))
  );

const updateCreature = (id: string, creature: Creature) =>
  pipe(
    TE.rightTask(() => creatureDb.doc(id).get()),
    TE.chain((snap) =>
      snap.exists ? TE.rightTask(() => snap.ref.set(creature)) : TE.left(Errors.EntityNotFound)
    ),
    TE.chain(() => getCreatureById(id))
  );

const deleteCreature = (id: string) =>
  pipe(
    getCreatureById(id),
    TE.chain(() => TE.rightTask(() => creatureDb.doc(id).delete())),
    TE.map(() => undefined)
  );

/**
 * Middleware
 */
export const getCreaturesHandler = pipe(
  H.decodeMethod(t.literal("GET").decode),
  H.mapLeft(() => Errors.InvalidMethod),
  H.ichain(() => H.fromTaskEither(getCreatures)),
  H.map((creatures) => ({ creatures })),
  H.ichain(sendJSON),
  H.orElse(sendError)
);

export const getCreatureByIdHandler = pipe(
  hasId,
  H.ichain((id) => H.fromTaskEither(getCreatureById(id))),
  H.ichain(sendJSON),
  H.orElse(sendError)
);

export const postCreatureHandler = pipe(
  decodeCreatureBody,
  H.ichain((creature) => H.fromTaskEither(addCreature(creature))),
  H.ichain(sendJSON),
  H.orElse(sendError)
);

export const putCreatureHanndler = pipe(
  hasId,
  H.ichain((id) =>
    pipe(
      decodeCreatureBody,
      H.ichain((creature) => H.fromTaskEither(updateCreature(id, creature)))
    )
  ),
  H.ichain(sendJSON),
  H.orElse(sendError)
);

export const deleteCreatureHandler = pipe(
  hasId,
  H.ichain((id) => H.fromTaskEither(deleteCreature(id))),
  H.ichain(() => closeOk()),
  H.orElse(sendError)
);
