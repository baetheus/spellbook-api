import { firestore } from "firebase-admin";

export type Firedata = firestore.DocumentSnapshot<firestore.DocumentData>;
