import { Viewer } from "@xeokit/xeokit-sdk";
import { LRUMap } from "lru_map";

interface LRUWithFilter extends LRUMap<string, any> {
  filter(callback: (key: string) => boolean): string[];
}

function findRoom(viewer: Viewer, position: number[], lru: LRUWithFilter) {
  const down = [0, -1, 0];
  const up = [0, 1, 0];
  const rooms = lru.filter((key) => key.startsWith("room"));

  function pick(direction: number[]) {
    return viewer.scene.pick({
      origin: position,
      direction: direction,
      pickSurface: true,
      includeEntities: rooms,
    });
  }

  const resultDown = pick(down);
  const resultUp = pick(up);

  if (resultDown?.entity === resultUp?.entity) {
    return resultDown?.entity?.id;
  }
}

export { findRoom };
