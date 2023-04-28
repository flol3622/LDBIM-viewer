import { LRUMap } from "lru_map";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { cleanStart, lruLimit } from "./atoms";
import { RefLRU, RefViewer } from "./refTypes";
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

export default function useCacheManagement(viewer: RefViewer, LRU: RefLRU) {
  const clean = useRecoilValue(cleanStart);
  const limit = useRecoilValue(lruLimit);

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
    const lruValue = LRU.current?.get(entity.id);
    if (lruValue != undefined) {
      if (JSON.stringify(lruValue) != JSON.stringify(entity.metadata)) {
        viewer.current?.scene.models[entity.id]?.destroy();
        return true;
      } else {
        return false;
      }
    }
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
