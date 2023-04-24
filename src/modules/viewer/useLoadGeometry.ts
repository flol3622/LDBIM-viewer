import { useEffect } from "react";
import { getEntities, getGeometry } from "../fetchSPARQL";
import { EntryLRU } from "../useCacheManagement";
import { LoaderType } from "./useInitViewer";

async function loadGeometry(
  uiQuerry: string,
  endpoint: string,
  loaderTypes: React.MutableRefObject<LoaderType | undefined>,
  evalLRU: (entry: EntryLRU) => boolean
) {
  await getEntities(uiQuerry, endpoint, (bindings: any) => {
    try {
      const entry = {
        id: bindings.element.value,
        metadata: {
          format: bindings.fog_geometry.value,
          datatype: bindings.geometryData.datatype.value,
        },
      } as EntryLRU;

      // cache management, stop if needed
      if (!evalLRU(entry)) throw new Error("Already in cache");

      // else fetch geometry data
      const loaderType = loaderTypes.current?.[entry.metadata.format];
      getGeometry(entry.id, entry.metadata.format, endpoint)
        .then((data) => {
          console.log(data);
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

export function useLoadGeometry(
  uiQuerry: string,
  endpoint: string,
  loaderTypes: React.MutableRefObject<LoaderType | undefined>,
  evalLRU: (entry: EntryLRU) => boolean
) {
  useEffect(() => {
    if (endpoint) {
      // ensures no loading on first render
      loadGeometry(uiQuerry, endpoint, loaderTypes, evalLRU);
    }
  }, [endpoint, uiQuerry]);
}
