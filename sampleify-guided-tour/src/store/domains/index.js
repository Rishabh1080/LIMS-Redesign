// Lab types offered in onboarding. Order here is the tile order.
// To add one: create a pack file next to these (copy an existing one) and
// list it below.
//
// Visitors can pick several lab types. A lab id is then the picked ids joined
// with commas, in the order they were picked (e.g. "food,water"); the first
// one leads. `multi` is the general lab used for visitors saved before lab
// types existed. It is no longer offered as a tile.
import food from './food';
import pharma from './pharma';
import water from './water';
import construction from './construction';
import metals from './metals';
import textiles from './textiles';
import multi from './multi';
import { composePack } from './compose';

export const domainPacks = [food, pharma, water, construction, metals, textiles];
export const fallbackPack = multi;

const byId = new Map([...domainPacks, multi].map((pack) => [pack.id, pack]));
const tileIds = new Set(domainPacks.map((pack) => pack.id));
const composed = new Map();

export const DEFAULT_DOMAIN = multi.id;

/** The tile ids inside a lab id, de-duplicated, unknown ids dropped. */
export function domainIdsOf(id) {
  if (typeof id !== 'string') return [];
  if (byId.has(id)) return [id];
  return [...new Set(id.split(',').map((part) => part.trim()))].filter((part) => tileIds.has(part));
}

/** Lab id for a selection of tile ids: one id, or several joined with commas. */
export function domainIdFor(ids) {
  return domainIdsOf(ids.join(',')).join(',');
}

export function isDomainId(id) {
  return domainIdsOf(id).length > 0;
}

export function getPack(id) {
  if (byId.has(id)) return byId.get(id);
  const ids = domainIdsOf(id);
  if (ids.length === 0) return multi;
  if (ids.length === 1) return byId.get(ids[0]);
  const key = ids.join(',');
  if (!composed.has(key)) composed.set(key, composePack(ids.map((part) => byId.get(part))));
  return composed.get(key);
}
