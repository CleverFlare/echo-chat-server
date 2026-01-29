import { frozen, list, map, set, tuple, udt } from "./collection";
import { types } from "./scalar";

export const cql = {
  scalar: types,
  list,
  map,
  set,
  frozen,
  tuple,
  udt,
};
