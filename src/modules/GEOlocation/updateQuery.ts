import { Viewer } from "@xeokit/xeokit-sdk";

function GeoSPARQLauto(
  viewer: Viewer | undefined,
  setQuery: (query: string) => void
):void {
    setInterval(() => {
        viewer?.scene.camera.eye;
    }, 5000);
}

export { GeoSPARQLauto };