import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { Format } from "./viewer/types";

const myFetcher = new SparqlEndpointFetcher();

// ----------------------------------------
// Fetch entities for a given query
// ----------------------------------------
async function getEntities(
  query: string,
  endpoint: string,
  forEachEntry: (bindings: any) => void
): Promise<void> {
  const bindingsStream = await myFetcher.fetchBindings(endpoint, query);

  bindingsStream.on("data", (bindings: any) => {
    forEachEntry(bindings);
  });

  bindingsStream.on("error", (error: any) => {
    console.error("Error fetching entities:", error);
  });
}

// ----------------------------------------
// Fetch geometry data of a given entity
// ----------------------------------------

function getGeometryQuery(id: any, format: Format): string {
  return `SELECT ?geometryData 
    WHERE {
      <${id}> <${format}> ?geometryData .
    }
    LIMIT 1`;
}

async function getGeometry(id: any, format: Format, endpoint: string) {
  return new Promise(async (resolve, reject) => {
    const bindingsStream = await myFetcher.fetchBindings(
      endpoint,
      getGeometryQuery(id, format)
    );

    bindingsStream.on("data", (bindings: any): void => {
      const data = bindings.geometryData.value;
      resolve(data);
    });

    bindingsStream.on("error", (error: any): void => {
      reject(error);
    });

    bindingsStream.on("end", (): void => {
      reject(new Error("No data found"));
    });
  });
}

export { getEntities, getGeometry };
