import _ from "lodash";
export function removeFalsyValues<T extends object>(obj: T): Partial<T> {
  return _.pickBy(obj, Boolean);
}

export function removeUndefinedValues<T extends object>(obj: T): Partial<T> {
  return _.pickBy(obj, (value) => value !== undefined);
}

export function removeNullishValues<T extends object>(obj: T): Partial<T> {
  return _.pickBy(obj, (value) => value != null);
}
