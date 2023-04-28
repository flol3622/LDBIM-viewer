import { Viewer } from "@xeokit/xeokit-sdk";
import { LRUMap } from "lru_map";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { cleanStart, lruLimit } from "./atoms";
import { Datatype, Format } from "./viewer/types";

export type MetadataLRU = {
  format: Format;
  datatype: Datatype;
  botType?: string;
};
export type EntryLRU = {
  id: string;
  metadata: MetadataLRU;
};

export default function useCacheManagement(
  viewer: React.MutableRefObject<Viewer | undefined>
) {
  const clean = useRecoilValue(cleanStart);
  const limit = useRecoilValue(lruLimit);

  const LRU = useRef<LRUMap<string, MetadataLRU>>();
  // initialize the LRU cache
  useEffect(() => {
    console.log("cache initialized");
    LRU.current = new LRUMap(limit);
    LRU.current.clear();
  }, [limit]);

  // clear the cache when the clean prop changes
  useEffect(() => {
    LRU.current?.clear();
    console.log("cache cleared");
  }, [clean]);

  // evaluate need to add to Viewer, move entity to head of LRU
  function evalLRU(entity: EntryLRU): boolean {
    if (LRU.current?.get(entity.id) === entity.metadata) return false;
    LRU.current?.set(entity.id, entity.metadata);
    return true;
  }

  function syncViewer(): void {
    const modelIds = viewer.current?.scene.modelIds;
    if (!modelIds) return; // if no models
    for (const id of modelIds) {
      if (!LRU.current?.has(id)) viewer.current?.scene.models[id]?.destroy();
    }
  }

  return { evalLRU, syncViewer }; // to use when loading a new model
}
