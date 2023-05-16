import { LRUMap } from "lru_map";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { cleanStart, lruLimit } from "./atoms";
import { RefLRU, RefViewer } from "./refTypes";
import { Datatype, Format } from "./viewer/types";
import { Console } from "console";

export type MetadataLRU = {
  format: Format;
  datatype: Datatype;
  botType?: string;
  [key: string]: string | undefined; // index signature to allow for additional properties
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
    if (lruValue !== undefined && JSON.stringify(lruValue) === JSON.stringify(entity.metadata)) {
      return false;
    }
    LRU.current?.set(entity.id, entity.metadata);
    return true;
  }

  function syncViewer(): void {
    const modelIds = viewer.current?.scene.modelIds;
    if (!modelIds) return;

    for (const id of modelIds) {
      const metadata = LRU.current?.get(id);
      const model = viewer.current?.scene.models[id];

      if (!metadata) {
        model?.destroy();
      } else if (metadata.color && model) {
        const color: number[] = JSON.parse(metadata.color);
        model.colorize = color;
      }
    }
  }

  return { evalLRU, syncViewer }; // to use when loading a new model
}
