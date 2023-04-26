import { useEffect } from "react";
import { getEntities, getGeometry } from "../fetchSPARQL";
import useCacheManagement, { EntryLRU } from "../useCacheManagement";
import { LoaderType } from "./useInitViewer";
import { useRecoilValue } from "recoil";
import { endpoint, query } from "../atoms";
import { Viewer } from "@xeokit/xeokit-sdk";

async function loadGeometry(
  query: string,
  endpoint: string,
  loaderTypes: React.MutableRefObject<LoaderType | undefined>,
  evalLRU: (entry: EntryLRU) => boolean
) {
  await getEntities(query, endpoint, (bindings: any) => {
    try {
      const entry = {
        id: bindings.element.value,
        metadata: {
          format: bindings.fog_geometry.value,
          datatype: bindings.datatype.value,
        },
      } as EntryLRU;

      // cache management, stop if needed
      if (!evalLRU(entry)) throw new Error("Already in cache");

      // else fetch geometry data
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
    } catch (error) {
      console.error("Error loading geometry:", error);
    }
  });
}

export default function useLoadGeometry(
  viewer: React.MutableRefObject<Viewer | undefined>,
  loaderTypes: React.MutableRefObject<LoaderType | undefined>
) {
  const queryValue = useRecoilValue(query);
  const endpointValue = useRecoilValue(endpoint);
  const { evalLRU } = useCacheManagement(viewer);

  useEffect(() => {
    if (endpointValue) {
      // ensures no loading on first render
      loadGeometry(queryValue, endpointValue, loaderTypes, evalLRU);
    }
  }, [endpointValue, queryValue]);
}
