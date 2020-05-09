import { initializeApp, firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import * as t from "io-ts";
import * as H from "hyper-ts";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

import {
  sendError,
  Failure,
  badArgs,
  badInternalData,
  jsonError,
  notFound,
  badMethod,
} from "./errors";
import { Creature, Creatures, NewCreature } from "./validators";

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
const decodeNewCreatureBody = pipe(H.decodeBody(NewCreature.decode), H.mapLeft(badArgs));
const decodeCreatureBody = pipe(H.decodeBody(Creature.decode), H.mapLeft(badArgs));
const chainCreatureWithIdDecode = (data: unknown) =>
  TE.fromEither(E.mapLeft(badInternalData)(Creature.decode(data)));

/**
 * Params
 */
const hasId = pipe(H.decodeParam("id", t.string.decode), H.mapLeft(badArgs));

/**
 * Send JSON
 */
const sendJSON = <D>(d: D): H.Middleware<H.StatusOpen, H.ResponseEnded, Failure, void> =>
  pipe(
    H.status(H.Status.OK),
    H.ichain(() => H.json(d, jsonError))
  );

const closeOk = (): H.Middleware<H.StatusOpen, H.ResponseEnded, Failure, void> =>
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
  TE.chain((docs) => TE.fromEither(Creatures.decode(docs))),
  TE.mapLeft(badInternalData)
);

const getCreatureById = (id: string) =>
  pipe(
    TE.rightTask(() => creatureDb.doc(id).get()),
    TE.chain((snap) =>
      snap.exists ? TE.right({ ...snap.data(), id: snap.id }) : TE.left(notFound({ id }))
    ),
    TE.chain(chainCreatureWithIdDecode)
  );

const addCreature = (creature: NewCreature) =>
  pipe(
    TE.rightTask(() => creatureDb.add(creature)),
    TE.chain((ref) => getCreatureById(ref.id))
  );

const updateCreature = (id: string, creature: Creature) =>
  pipe(
    TE.rightTask(() => creatureDb.doc(id).get()),
    TE.chain((snap) =>
      snap.exists ? TE.rightTask(() => snap.ref.set(creature)) : TE.left(notFound({ id }))
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
  H.mapLeft(badMethod),
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
  decodeNewCreatureBody,
  H.ichain((creature) => H.fromTaskEither(addCreature(creature))),
  H.ichain(sendJSON),
  H.orElse(sendError)
);

const putCreatureById = (id: string) =>
  pipe(
    decodeCreatureBody,
    H.ichain((creature) => H.fromTaskEither(updateCreature(id, creature)))
  );

export const putCreatureHandler = pipe(
  hasId,
  H.ichain(putCreatureById),
  H.ichain(sendJSON),
  H.orElse(sendError)
);

export const deleteCreatureHandler = pipe(
  hasId,
  H.ichain((id) => H.fromTaskEither(deleteCreature(id))),
  H.ichain(() => closeOk()),
  H.orElse(sendError)
);
