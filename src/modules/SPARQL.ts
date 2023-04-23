import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { useRef } from "react";
import { EntryLRU, Format } from "./Cache";

export type FetchRequest = {
  id: string;
  format: Format;
  endpoint: string;
};

interface LoadGeometryData {
  (
    entry: EntryLRU,
    data: string,
    fetchGeometryData: (id: any, format: Format) => Promise<string>
  ): Promise<void>;
}

export function useSparqlExchange() {
  const fetcher = useRef(new SparqlEndpointFetcher());

  async function fetchGeometryData({ id, format, endpoint }: FetchRequest): Promise<string> {
    const geometryQuery = `SELECT ?geometryData 
      WHERE {
        <${id}> <${format}> ?geometryData .
      }
      LIMIT 1`;

    const bindingsStream = await fetcher.current.fetchBindings(endpoint, geometryQuery);
    return new Promise((resolve) => {
      bindingsStream.on("data", (bindings: any): void => {
        const data = bindings.geometryData.value;
        resolve(data);
      });
    });
  }

  async function fetchAndLoadGeometry(
    uiQueryValue: string,
    endpointValue: string,
    loadGeometryData: LoadGeometryData
  ) {
    const bindingsStream = await fetcher.current.fetchBindings(endpointValue, uiQueryValue);

    bindingsStream.on("data", (bindings: any) => {
      const entry: EntryLRU = {
        id: bindings.element.value,
        metadata: {
          format: bindings.fog_geometry.value,
          datatype: bindings.geometryData.datatype.value,
        },
      };

      loadGeometryData(entry, bindings.geometryData.value, fetchGeometryData);
    });
  }

  return { fetchGeometryData, fetchAndLoadGeometry };
}
