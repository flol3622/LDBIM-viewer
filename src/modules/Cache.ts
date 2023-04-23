import { LRUMap } from "lru_map";
import { useRef } from "react";

// types
export type Format =
  | "https://w3id.org/fog#asGltf"
  | "https://w3id.org/fog#asObj"
  | "https://w3id.org/fog#asStl";

export type Datatype =
  | "http://www.w3.org/2001/XMLSchema#string"
  | "http://www.w3.org/2001/XMLSchema#anyURI";

export type MetadataLRU = {
  format: Format;
  datatype: Datatype;
};

export type EntryLRU = {
  id: string;
  metadata: MetadataLRU;
};

// caching algorithm around LRU
export function useCacheManager(lruLimitValue: number) {
  const LRU = useRef<LRUMap<string, MetadataLRU>>(new LRUMap(lruLimitValue));
  
  // destroy from viewer when unmount
  LRU.current.shift = function () {
    let entry = LRUMap.prototype.shift.call(this);
    // --------------------------------------------------needs destroy function
    return entry;
  };

  function clearLRU(): void {
    LRU.current.clear();
  }

  function addEntity(entity: EntryLRU): void {
    LRU.current.set(entity.id, entity.metadata);
  }

  function evalLoadLRU(entity: EntryLRU): boolean {
    if (LRU.current.get(entity.id) === entity.metadata) return false;
    addEntity(entity);
    return true;
  }

  return { LRU, clearLRU, addEntity, evalLoadLRU };
}
