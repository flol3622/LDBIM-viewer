import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { cleanStart, endpoint, freezing, lruLimit, uiQuery } from "~/atoms";
import { useCacheManager, EntryLRU } from "~/modules/Cache";
import { useViewerManager } from "~/modules/Viewer";
import { useSparqlExchange } from "~/modules/SPARQL";

export default function ARViewer() {
  const clean = useRecoilValue(cleanStart);
  const uiQueryValue = useRecoilValue(uiQuery);
  const setFreeze = useSetRecoilState(freezing);
  const endpointValue = useRecoilValue(endpoint);
  const lruLimitValue = useRecoilValue(lruLimit);

  const { LRU, evalLoadLRU, clearLRU, destroyGeometry } =
    useCacheManager(lruLimitValue);

  const { viewerRef, loaderTypesRef, loadGeometryData } = useViewerManager(
    clean,
    setFreeze,
    destroyGeometry
  );

  const { fetchGeometryData, fetchAndLoadGeometry } = useSparqlExchange();

  useEffect(() => {
    if (endpointValue) {
      fetchAndLoadGeometry(uiQueryValue, endpointValue, loadGeometryData);
    }
  }, [uiQueryValue, endpointValue]);

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
