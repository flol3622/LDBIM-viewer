import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { endpoint, lruLimit, query } from "../atoms";
import { getEntities, getGeometry } from "../fetchSPARQL";
import { RefLRU, RefLoaderTypes, RefViewer } from "../refTypes";
import useCacheManagement, { EntryLRU } from "../useCacheManagement";
import { LoaderType } from "./useInitViewer";

async function loadGeometry(
  query: string,
  endpoint: string,
  loaderTypes: React.MutableRefObject<LoaderType | undefined>,
  evalLRU: (entry: EntryLRU) => boolean,
  syncViewer: () => void
) {
  await getEntities(query, endpoint, (bindings: any) => {
    try {
      const entry = {
        id: bindings.entity.value,
        metadata: {
          format: bindings.fog_geometry.value,
          datatype: bindings.datatype.value,
          botType: bindings.bot_type?.value,
        },
      } as EntryLRU;

      // cache management, stop if needed
      if (evalLRU(entry)) {
        const loaderType = loaderTypes.current?.[entry.metadata.format];
        getGeometry(entry.id, entry.metadata.format, endpoint)
          .then((data) => {
            // if the data is a literal, and is supported
            if (
              entry.metadata.datatype ===
                "http://www.w3.org/2001/XMLSchema#string" &&
              loaderType?.litParam
            ) {
              loaderType.loader.load({
                ...loaderType.params,
                id: entry.id,
                [loaderType.litParam]: data,
              });
            }
            // if the data is a uri, and is supported
            else if (
              entry.metadata.datatype ===
                "http://www.w3.org/2001/XMLSchema#anyURI" &&
              loaderType?.uriParam
            ) {
              loaderType.loader.load({
                ...loaderType.params,
                id: entry.id,
                [loaderType.uriParam]: data,
              });
            }
            // if the data source is not supported
            else console.log("unsupported / undefined data source", entry.id);
          })
          .catch((error) => {
            console.error("Error fetching geometry data:", error);
          });
      } else {
        console.log("Already in cache");
      }
    } catch (error) {
      console.error("Error loading geometry:", error);
    }
  });

  syncViewer();
}

export default function useLoadGeometry(
  viewer: RefViewer,
  loaderTypes: RefLoaderTypes,
  LRU: RefLRU
) {
  const limit = useRecoilValue(lruLimit);
  const queryValue = useRecoilValue(query);
  const endpointValue = useRecoilValue(endpoint);

  const { evalLRU, syncViewer } = useCacheManagement(viewer, LRU);

  useEffect(() => {
    if (endpointValue) {
      // ensures no loading on first render
      loadGeometry(queryValue, endpointValue, loaderTypes, evalLRU, syncViewer);
    }
  }, [endpointValue, queryValue, limit]);
}
