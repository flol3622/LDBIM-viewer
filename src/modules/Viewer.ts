import { useRef, useEffect } from "react";
import {
  GLTFLoaderPlugin,
  NavCubePlugin,
  OBJLoaderPlugin,
  STLLoaderPlugin,
  Viewer,
} from "@xeokit/xeokit-sdk";
import { EntryLRU, Format, MetadataLRU } from "./Cache";
import { FetchRequest } from "./SPARQL";
import { LRUMap } from "lru_map";

type LoaderType = {
  [key: string]: {
    loader: any; // could not find a general type for loaders
    params?: any;
    litParam?: string;
    uriParam?: "src";
  };
};

export function useViewerManager(
    setFreeze: (value: boolean) => void,
    destroyGeometry: (id: string) => void,
    LRU: React.MutableRefObject<LRUMap<string, MetadataLRU>>,
    fetchGeometryData: (id: any, format: Format) => Promise<string>
) {
  const viewerRef = useRef<Viewer | null>(null);
  const loaderTypesRef = useRef<LoaderType | null>(null);

  useEffect(() => {
    setFreeze(true);
    viewerRef.current?.scene.clear();

    viewerRef.current = new Viewer({
      canvasId: "myCanvas",
      transparent: true,
    });

    new NavCubePlugin(viewerRef.current, {
      canvasId: "myNavCubeCanvas",
      visible: true,
    });

    const scene = viewerRef.current.scene;
    const camera = scene.camera;
    camera.projection = "perspective";

    const gltfLoader = new GLTFLoaderPlugin(viewerRef.current);
    const objLoader = new OBJLoaderPlugin(viewerRef.current, {});
    const stlLoader = new STLLoaderPlugin(viewerRef.current);

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
      },
      "https://w3id.org/fog#asObj": {
        loader: objLoader,
        uriParam: "src",
      },
    };
    console.log("viewer initialized");
    setFreeze(false);
  }, [clean]);

  async function loadGeometryData(
    entry: EntryLRU,
    data: string,
  ) {
    try {
      if (!evalLoadLRU(entry)) return;

      const loaderType = loaderTypesRef.current?.[entry.metadata.format];
      const fetchedData = await fetchGeometryData(
        entry.id,
        entry.metadata.format,
        
      );
      console.log(fetchedData);

      if (
        entry.metadata.datatype === "http://www.w3.org/2001/XMLSchema#string" &&
        loaderType?.litParam
      ) {
        loaderType.loader.load({
          ...loaderType.params,
          id: entry.id,
          [loaderType.litParam]: data,
        });
      } else if (
        entry.metadata.datatype === "http://www.w3.org/2001/XMLSchema#anyURI" &&
        loaderType?.uriParam
      ) {
        loaderType.loader.load({
          ...loaderType.params,
          id: entry.id,
          [loaderType.uriParam]: data,
        });
      } else {
        console.log("unsupported / undefined data source", entry.id);
      }
    } catch (error) {
      console.error("Error loading geometry:", error);
    }
  }

  return { viewerRef, loaderTypesRef, loadGeometryData };
}
