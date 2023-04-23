import {
  GLTFLoaderPlugin,
  NavCubePlugin,
  OBJLoaderPlugin,
  STLLoaderPlugin,
  Viewer,
} from "@xeokit/xeokit-sdk";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { LRUMap } from "lru_map";
import { useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { cleanStart, endpoint, freezing, lruLimit, uiQuery } from "~/atoms";

export default function ARViewer() {
  const clean = useRecoilValue(cleanStart);
  const uiQueryValue = useRecoilValue(uiQuery);
  const setFreeze = useSetRecoilState(freezing);
  const endpointValue = useRecoilValue(endpoint);
  const lruLimitValue = useRecoilValue(lruLimit);
  // --------------------------------
  // LRU cache management
  // --------------------------------
  // Define types
  type Format =
    | "https://w3id.org/fog#asGltf"
    | "https://w3id.org/fog#asObj"
    | "https://w3id.org/fog#asStl";
  type Datatype =
    | "http://www.w3.org/2001/XMLSchema#string"
    | "http://www.w3.org/2001/XMLSchema#anyURI";
  type MetadataLRU = {
    format: Format;
    datatype: Datatype;
  };
  type EntryLRU = {
    id: string;
    metadata: MetadataLRU;
  };

  // Define the LRU cache
  const LRU = useRef<LRUMap<string, MetadataLRU>>(new LRUMap(lruLimitValue));

  // Define the LRU exit function
  // (called when an entity is removed from the cache)
  LRU.current.shift = function () {
    let entry = LRUMap.prototype.shift.call(this);
    destroyGeometry(entry?.[0]);
    return entry;
  };

  function clearLRU() {
    LRU.current.clear();
  }

  function addEntity(entity: EntryLRU) {
    LRU.current.set(entity.id, entity.metadata);
  }

  function evalLoadLRU(entity: EntryLRU) {
    // if the entity is already in the cache and is the same: do nothing
    if (LRU.current.get(entity.id) === entity.metadata) return false;
    // else: add the entity to the cache
    addEntity(entity);
    return true;
  }

  // --------------------------------
  // initialize the setup
  // --------------------------------
  // Refs to store viewer and loaderTypes
  const viewerRef = useRef<Viewer | null>(null);
  // Define loaders for each format
  type LoaderType = {
    [key: string]: {
      loader: any; // could not find a general type for loaders
      params?: any;
      litParam?: string;
      uriParam?: "src";
    };
  };
  const loaderTypesRef = useRef<LoaderType | null>(null);

  useEffect(() => {
    // freeze the query and endpoint inputs
    setFreeze(true);
    // clear the existing canvas
    viewerRef.current?.scene.clear();

    // initialize the viewer
    viewerRef.current = new Viewer({
      canvasId: "myCanvas",
      transparent: true,
    });

    // initialize the navcube
    new NavCubePlugin(viewerRef.current, {
      canvasId: "myNavCubeCanvas",
      visible: true,
    });

    // identify the scene and camera
    const scene = viewerRef.current.scene;
    const camera = scene.camera;
    camera.projection = "perspective";

    // initialize the loaders
    const gltfLoader = new GLTFLoaderPlugin(viewerRef.current);
    const objLoader = new OBJLoaderPlugin(viewerRef.current, {});
    const stlLoader = new STLLoaderPlugin(viewerRef.current);

    // store the loaders in a ref
    loaderTypesRef.current = {
      "https://w3id.org/fog#asGltf": {
        loader: gltfLoader,
        params: { edges: true },
        litParam: "gltf",
        uriParam: "src",
      },
      "https://w3id.org/fog#asStl": {
        loader: stlLoader,
        params: { edges: true, rotation: [180, 0, 0] },
        litParam: "stl",
        uriParam: "src",
      },
      "https://w3id.org/fog#asObj": {
        loader: objLoader,
        uriParam: "src",
      },
    };
    console.log("viewer initialized");
    setFreeze(false);
  }, [clean]);

  // --------------------------------
  // Fetch geometry when uiQueryValue or endpointValue changes
  // --------------------------------
  useEffect(() => {
    if (endpointValue) {
      // ensures no loading on first render
      loadGeometry();
    }
  }, [uiQueryValue, endpointValue]);

  // --------------------------------
  // fetching functions
  // --------------------------------
  // Define Fetcher
  const myfetcher = useRef(new SparqlEndpointFetcher());

  // fetch data of a single instance
  async function fetchGeometryData(id: any, format: Format): Promise<string> {
    const geometryQuery = `SELECT ?geometryData 
      WHERE {
        <${id}> <${format}> ?geometryData .
      }
      LIMIT 1`;

    return new Promise(async (resolve, reject) => {
      try {
        const bindingsStream = await myfetcher.current.fetchBindings(
          endpointValue,
          geometryQuery
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
      } catch (error) {
        reject(error);
      }
    });
  }

  // fetch the main query
  async function loadGeometry() {
    // fetch the data from the sparql endpoint, using the uiQuery
    const myFetcher = new SparqlEndpointFetcher();
    const bindingsStream = await myFetcher.fetchBindings(
      endpointValue,
      uiQueryValue
    );

    // for every incoming result, load the geometry
    bindingsStream.on("data", (bindings: any) => {
      try {
        const entry = {
          id: bindings.element.value,
          metadata: {
            format: bindings.fog_geometry.value,
            datatype: bindings.geometryData.datatype.value,
          },
        } as EntryLRU;

        // cache management, stop if needed
        if (!evalLoadLRU(entry)) return;

        // else fetch geometry data
        const loaderType = loaderTypesRef.current?.[entry.metadata.format];
        // const data = fetchGeometryData(entry.id, entry.metadata.format);
        fetchGeometryData(entry.id, entry.metadata.format)
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

  function destroyGeometry(id: string) {
    viewerRef.current?.scene.models[id]?.destroy();
  }

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
