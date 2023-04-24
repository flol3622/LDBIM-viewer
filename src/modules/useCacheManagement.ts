import { LRUMap } from "lru_map";
import { Datatype, Format } from "./viewer/types";
import { useRef } from "react";
import { Viewer } from "@xeokit/xeokit-sdk";

export type MetadataLRU = {
  format: Format;
  datatype: Datatype;
};
export type EntryLRU = {
  id: string;
  metadata: MetadataLRU;
};

export function useCacheManagement(limit: number, viewer: Viewer | undefined) {
  const LRU = useRef<LRUMap<string, MetadataLRU>>(new LRUMap(limit));

  LRU.current.shift = function () {
    let entry = LRUMap.prototype.shift.call(this);
    viewer?.scene.models[entry?.[0]]?.destroy();
    return entry;
  };

  function clearLRU(): void {
    LRU.current.clear();
  }

  function addLRU(entity: EntryLRU): void {
    LRU.current.set(entity.id, entity.metadata);
  }

  function evalLRU(entity: EntryLRU): boolean {
    if (LRU.current.get(entity.id) === entity.metadata) return false;
    addLRU(entity);
    return true;
  }

  return { clearLRU, evalLRU };
}
