import { omit } from "lodash";

/**
 * Removes specified keys from an object.
 * @param obj The object to omit keys from.
 * @param keys The keys to remove from the object.
 * @returns A new object with the specified keys omitted.
 */
export function omitKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  return omit(obj, keys) as Omit<T, K>;
}
