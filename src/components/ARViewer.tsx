import {
  GLTFLoaderPlugin,
  NavCubePlugin,
  OBJLoaderPlugin,
  STLLoaderPlugin,
  Viewer,
} from "@xeokit/xeokit-sdk";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { endpoint, uiQuery } from "~/atoms";

export default function ARViewer() {
  const uiQueryValue = useRecoilValue(uiQuery);
  const endpointValue = useRecoilValue(endpoint);
  const viewerRef = useRef<Viewer | null>(null);

  // --------------------------------
  // initialize the setup
  // --------------------------------
  useEffect(() => {
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
    const scene = viewerRef.current;
    const camera = scene.camera;
    camera.projection = "perspective";

    // log the camera position
    // camera.on("viewMatrix", function (matrix: any) {
    //   console.log("eye", camera.eye);
    //   console.log("look", camera.look);
    //   console.log("up", camera.up);
    //   console.log("testje", matrix);
    // });

    // initialize the loaders
    const gltfLoader = new GLTFLoaderPlugin(viewerRef.current);
    const objLoader = new OBJLoaderPlugin(viewerRef.current, {});
    const stlLoader = new STLLoaderPlugin(viewerRef.current);

    // Define loaders for each format
    type LoaderType = {
      [key: string]: {
        loader: any;
        params: any;
        litParam?: string;
      };
    };

    const loaderTypes: LoaderType = {
      "https://w3id.org/fog#asGltf": {
        loader: gltfLoader,
        params: { edges: true , matrix: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},
        litParam: "gltf",
      },
      "https://w3id.org/fog#asStl": {
        loader: stlLoader,
        params: { edges: true, matrix: [0.001,0,0,0,0,0.001,0,0,0,0,0.001,0,0,0,0,1] },
        litParam: "stl",
      },
      "https://w3id.org/fog#asObj": {
        loader: objLoader,
        params: { matrix: [0.001,0,0,0,0.001,0,0,0,0,0.001,0,0,0,0,1] },
      },
    };
    // fetch the geometry to the viewer
    getGeometry(loaderTypes);
  }, [endpointValue]);

  // --------------------------------
  // fetching function
  // --------------------------------
  async function getGeometry(loaderTypes: any) {
    console.log("getGeometry");

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
      const loaderType = loaderTypes[format];

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
            console.log("loaded uri of format:", format);
            viewerRef.current?.cameraFlight.flyTo(sceneModel);
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
            console.log("loaded uri of format:", format);
            viewerRef.current?.cameraFlight.flyTo(sceneModel);
          });
        }

        // if the data source is not supported
        else console.log("unsupported / undefined data source", element);
      }

      // if the format is not supported
      else console.log("unsupported / undefined geometry format", element);
    });
  }

  return (
    <>
      <canvas id="myCanvas" className="h-full w-full"></canvas>
      <canvas
        className="fixed right-0 bottom-0 h-40 w-40"
        id="myNavCubeCanvas"
      ></canvas>
    </>
  );
}
