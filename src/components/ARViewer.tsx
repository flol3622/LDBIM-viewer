import {
  GLTFLoaderPlugin,
  NavCubePlugin,
  OBJLoaderPlugin,
  Plugin,
  STLLoaderPlugin,
  Viewer,
} from "@xeokit/xeokit-sdk";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { TypeOf } from "zod";
import { endpoint, uiQuery } from "~/atoms";

export default function ARViewer() {
  const [clean, setClean] = useState<boolean>(false);
  const uiQueryValue = useRecoilValue(uiQuery);
  const endpointValue = useRecoilValue(endpoint);

  // Refs to store viewer and loaderTypes
  const viewerRef = useRef<Viewer | null>(null);
  // Define loaders for each format
  type LoaderType = {
    [key: string]: {
      loader: any;
      params: any;
      litParam?: string;
    };
  };
  const loaderTypesRef = useRef<LoaderType | null>(null);

  // --------------------------------
  // initialize the setup
  // --------------------------------
  useEffect(() => {
    viewerRef.current?.scene.clear();
    // destroy every loader in the loaderTypesRef
    if (loaderTypesRef.current) {
      for (const key in loaderTypesRef.current) {
        loaderTypesRef.current[key]?.loader.destroy();
      }
    }
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
      },
      "https://w3id.org/fog#asStl": {
        loader: stlLoader,
        params: { edges: true, rotation: [180, 0, 0] },
        litParam: "stl",
      },
      "https://w3id.org/fog#asObj": {
        loader: objLoader,
        params: {},
      },
    };
    console.log("initialized");
  }, [clean]);

  // --------------------------------
  // Fetch geometry when uiQueryValue or endpointValue changes
  // --------------------------------
  useEffect(() => {
    if (viewerRef.current && loaderTypesRef.current) {
      // fetch the geometry to the viewer
      getGeometry();
    }
  }, [uiQueryValue, endpointValue, viewerRef, loaderTypesRef]);


  // --------------------------------
  // fetching function
  // --------------------------------
  async function getGeometry() {
    console.log("getting geometry");

    // fetch the data from the sparql endpoint, using the uiQuery
    const myFetcher = new SparqlEndpointFetcher();
    const bindingsStream = await myFetcher.fetchBindings(
      endpointValue,
      uiQueryValue
    );

    // for every incoming result, load the geometry
    bindingsStream.on("data", (bindings: any) => {
      const format = bindings.fog_geometry.value;
      const data = bindings.geometryData.value;
      const dataType = bindings.geometryData.datatype.value;
      const element = bindings.element.value;

      // select the right loader
      const loaderType = loaderTypesRef.current?.[format];

      // check if the format is supported
      if (loaderType) {
        // if the data is a literal, and is supported
        if (
          dataType === "http://www.w3.org/2001/XMLSchema#string" &&
          loaderType.litParam
        ) {
          const sceneModel = loaderType.loader.load({
            ...loaderType.params,
            id: element,
            [loaderType.litParam]: data,
          });
          sceneModel.on("loaded", () => {
            // console.log("loaded literal of format:", format);
          });
        }

        // if the data is a uri
        else if (dataType === "http://www.w3.org/2001/XMLSchema#anyURI") {
          const sceneModel = loaderType.loader.load({
            ...loaderType.params,
            id: element,
            src: data,
          });
          sceneModel.on("loaded", () => {
            // console.log("loaded uri of format:", format);
            // console.log(sceneModel.id);
          });
        }

        // if the data source is not supported
        else console.log("unsupported / undefined data source", element);
      }

      // if the format is not supported
      else console.log("unsupported / undefined geometry format", element);
    });
  }

  function select() {
    viewerRef.current?.scene.setObjectsSelected(
      ["https://172.16.10.122:8080/projects/1001/floor_1xS3BCk291UvhgP2dvNYcU"],
      true
    );
    console.log("testje");
  }

  const viewer = viewerRef.current;
  viewer?.scene.input.on("mouseclicked", function (coords) {
    var hit = viewer.scene.pick({
      canvasPos: coords,
    });

    console.log(hit);
  });

  return (
    <>
      <canvas id="myCanvas" className="h-full w-full"></canvas>
      <canvas
        className="fixed right-0 bottom-0 h-40 w-40"
        id="myNavCubeCanvas"
      ></canvas>
      <button className="fixed top-20" onClick={() => select()}>
        test
      </button>
      <button className="fixed top-28" onClick={() => setClean(!clean)}>
        clean
      </button>
    </>
  );
}
