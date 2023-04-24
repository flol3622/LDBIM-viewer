import { Viewer } from "@xeokit/xeokit-sdk";
import { useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { cleanStart, endpoint, freezing, lruLimit, uiQuery } from "~/atoms";
import { useCacheManagement } from "~/modules/useCacheManagement";
import { LoaderType, useInitViewer } from "~/modules/viewer/useInitViewer";
import { useLoadGeometry } from "~/modules/viewer/useLoadGeometry";

export default function ARViewer() {
  const clean = useRecoilValue(cleanStart);
  const uiQueryValue = useRecoilValue(uiQuery);
  const setFreeze = useSetRecoilState(freezing);
  const endpointValue = useRecoilValue(endpoint);
  const lruLimitValue = useRecoilValue(lruLimit);

  const viewerRef = useRef<Viewer>();
  const loaderTypesRef = useRef<LoaderType>();

  // LRU cache management
  const { clearLRU, evalLRU } = useCacheManagement(
    lruLimitValue,
    viewerRef.current
  );

  // initialize the setup
  useInitViewer(viewerRef.current, loaderTypesRef, clean, setFreeze);

  // fetch the main query
  useLoadGeometry(uiQueryValue, endpointValue, loaderTypesRef, evalLRU);

  return (
    <>
      <canvas id="myCanvas" className="mt-2 h-full w-full"></canvas>
      <canvas
        className="fixed right-0 bottom-0 h-40 w-40"
        id="myNavCubeCanvas"
      ></canvas>
    </>
  );
}
