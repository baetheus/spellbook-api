import * as C from "io-ts/lib/Codec";

export const CreatureSource = C.literal(
  "Monster Manual",
  "Players Handbook",
  "Dungeon Masters Guide",
  "Explorers Guide to Wildemount",
  "Custom"
);

/** Creature */
export const Creature = C.intersection(
  C.type({
    id: C.string,
    name: C.string,
    type: C.string,
    rating: C.number,
    experience: C.number,
    ac: C.number,
    hp: C.number,
    speed: C.string,
    str: C.number,
    dex: C.number,
    con: C.number,
    int: C.number,
    wis: C.number,
    cha: C.number,
    features: C.string,
    traits: C.string,
    source: CreatureSource,
  }),
  C.partial({
    armor: C.string,
    actions: C.string,
    reactions: C.string,
    page: C.number,
  })
);
export type Creature = C.TypeOf<typeof Creature>;

/** Creatures */
export const Creatures = C.array(Creature);
export type Creatures = C.TypeOf<typeof Creatures>;

/** New Creature */
export const NewCreature = C.intersection(
  C.type({
    ac: C.number,
    cha: C.number,
    con: C.number,
    dex: C.number,
    experience: C.number,
    features: C.string,
    hp: C.number,
    int: C.number,
    name: C.string,
    rating: C.number,
    source: CreatureSource,
    speed: C.string,
    str: C.number,
    traits: C.string,
    type: C.string,
    wis: C.number,
  }),
  C.partial({
    actions: C.string,
    armor: C.string,
    page: C.number,
    reactions: C.string,
  })
);
export type NewCreature = C.TypeOf<typeof NewCreature>;
