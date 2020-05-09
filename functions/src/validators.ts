import * as t from "io-ts";

export const CreatureSource = t.keyof({
  "Monster Manual": null,
  "Players Handbook": null,
  "Dungeon Masters Guide": null,
  "Explorers Guide to Wildemount": null,
  Custom: null,
});

/** Creature */
export const Creature = t.intersection([
  t.type({
    id: t.string,
    name: t.string,
    type: t.string,
    rating: t.number,
    experience: t.number,
    ac: t.number,
    hp: t.number,
    speed: t.string,
    str: t.number,
    dex: t.number,
    con: t.number,
    int: t.number,
    wis: t.number,
    cha: t.number,
    features: t.string,
    traits: t.string,
    source: CreatureSource,
  }),
  t.partial({
    armor: t.string,
    actions: t.string,
    reactions: t.string,
    page: t.number,
  }),
]);
export type Creature = t.TypeOf<typeof Creature>;

/** Creatures */
export const Creatures = t.array(Creature);
export type Creatures = t.TypeOf<typeof Creatures>;

/** New Creature */
export const NewCreature = t.intersection([
  t.type({
    ac: t.number,
    cha: t.number,
    con: t.number,
    dex: t.number,
    experience: t.number,
    features: t.string,
    hp: t.number,
    int: t.number,
    name: t.string,
    rating: t.number,
    source: CreatureSource,
    speed: t.string,
    str: t.number,
    traits: t.string,
    type: t.string,
    wis: t.number,
  }),
  t.partial({
    actions: t.string,
    armor: t.string,
    page: t.number,
    reactions: t.string,
  }),
]);
export type NewCreature = t.TypeOf<typeof NewCreature>;
