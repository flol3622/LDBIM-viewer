import { Viewer } from "@xeokit/xeokit-sdk";
import { LRUMap } from "lru_map";
import { useRef } from "react";
import { useAutomations } from "~/modules/automations";
import { MetadataLRU } from "~/modules/useCacheManagement";
import { LoaderType, useInitViewer, useLoadGeometry } from "~/modules/viewer";

export default function ARViewer() {
  const viewerRef = useRef<Viewer>();
  const loaderTypesRef = useRef<LoaderType>();
  const LRU = useRef<LRUMap<string, MetadataLRU>>();

  // initialize the setup
  useInitViewer(viewerRef, loaderTypesRef);

  // fetch the input query
  useLoadGeometry(viewerRef, loaderTypesRef, LRU);

  // automatic querries
  useAutomations(viewerRef, LRU);

  function test() {
    if (viewerRef.current) {
      viewerRef.current.scene.camera.eye = [5, 5, -5];
    }
  }

  return (
    <>
      <canvas id="myCanvas" className="mt-2 h-full w-full"></canvas>
      <canvas
        className="fixed right-0 bottom-0 h-40 w-40"
        id="myNavCubeCanvas"
      ></canvas>
      <button className="fixed top-24 left-0 z-10" onClick={test}>
        test
      </button>
    </>
  );
}
