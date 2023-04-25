import { LRUMap } from "lru_map";
import { Datatype, Format } from "./viewer/types";
import { useEffect, useRef } from "react";
import { Viewer } from "@xeokit/xeokit-sdk";

export type MetadataLRU = {
  format: Format;
  datatype: Datatype;
};
export type EntryLRU = {
  id: string;
  metadata: MetadataLRU;
};

export function useCacheManagement(
  limit: number,
  viewer: React.MutableRefObject<Viewer | undefined>,
  clean: any
) {
  // initialize the LRU cache
  const LRU = useRef<LRUMap<string, MetadataLRU>>(new LRUMap(limit));

  // clear the cache when the clean prop changes
  useEffect(() => {
    LRU.current.clear();
    console.log("cache cleared");
  }, [clean]);

  // call destroy function when an entry is removed from the cache
  LRU.current.shift = function () {
    let entry = LRUMap.prototype.shift.call(this);
    // neeeds acccess to the viewer
    viewer.current?.scene.models[entry?.[0]]?.destroy();
    return entry;
  };

  function addLRU(entity: EntryLRU): void {
    LRU.current.set(entity.id, entity.metadata);
  }

  // evaluate need to add to Viewer, move entity to head of LRU
  function evalLRU(entity: EntryLRU): boolean {
    if (LRU.current.get(entity.id) === entity.metadata) return false;
    addLRU(entity);
    return true;
  }

  return { evalLRU }; // to use when loading a new model
}
