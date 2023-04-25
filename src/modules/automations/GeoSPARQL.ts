import { Viewer } from "@xeokit/xeokit-sdk";

export default function GeoSPARQLauto(
  viewer: React.MutableRefObject<Viewer | undefined>,
  setQuery: (query: string) => void
): NodeJS.Timer {
  return setInterval(() => {
    console.log(viewer.current?.scene.camera.eye);
  }, 1000);
}
