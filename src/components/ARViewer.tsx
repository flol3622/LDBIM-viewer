import {
  GLTFLoaderPlugin,
  NavCubePlugin,
  OBJLoaderPlugin,
  STLLoaderPlugin,
  Viewer,
} from "@xeokit/xeokit-sdk";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { endpoint, uiQuery } from "~/atoms";

export default function ARViewer() {
  const uiQueryValue = useRecoilValue(uiQuery);
  const endpointValue = useRecoilValue(endpoint);

  // create the viewer
  useEffect(() => {
    // initialize the viewer
    const viewer = new Viewer({
      canvasId: "myCanvas",
      transparent: true,
    });

    // initialize the navcube
    new NavCubePlugin(viewer, {
      canvasId: "myNavCubeCanvas",
      visible: true,
    });

    // identify the scene and camera
    const scene = viewer.scene;
    const camera = scene.camera;
    camera.projection = "perspective";

    // log the camera position
    camera.on("viewMatrix", function (matrix: any) {
      console.log("eye", camera.eye);
      console.log("look", camera.look);
      console.log("up", camera.up);
      console.log("testje", matrix);
    });

    // fetch the geometry to the viewer
    getGeometry(viewer);
  }, []);

  // fetching function
  async function getGeometry(viewer: any) {
    console.log("getGeometry");

    // fetch the data from the sparql endpoint, using the uiQuery
    const myFetcher = new SparqlEndpointFetcher();
    const bindingsStream = await myFetcher.fetchBindings(
      endpointValue,
      uiQueryValue
    );

    // initialize the loaders
    const gltfLoader = new GLTFLoaderPlugin(viewer);
    const objLoader = new OBJLoaderPlugin(viewer, {});
    const stlLoader = new STLLoaderPlugin(viewer);

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
        params: { edges: true },
        litParam: "gltf",
      },
      "https://w3id.org/fog#asStl": {
        loader: stlLoader,
        params: { edges: true },
        litParam: "stl",
      },
      "https://w3id.org/fog#asObj": {
        loader: objLoader,
        params: {},
        litParam: "src", // will be converted to a blob
      },
    };

    // temporary blob for viewers that need a file
    function blobToUrl(blob: string) {
      const url = URL.createObjectURL(new Blob([blob]));
      return url;
    }
    function revokeBlobUrl(url: string) {
      URL.revokeObjectURL(url);
    }

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
        // if the data is a literal, or can be converted to a blob
        if (
          dataType === "http://www.w3.org/2001/XMLSchema#string" &&
          loaderType.litParam
        ) {
          // if data needs to be converted to a blob
          if (loaderType.litParam === "src") {
            const blobUrl = blobToUrl(data);
            loaderType.loader.load({
              ...loaderType.params,
              id: element,
              src: blobUrl,
            });
            revokeBlobUrl(blobUrl);
          } else {
            loaderType.loader.load({
              ...loaderType.params,
              id: element,
              [loaderType.litParam]: data,
            });
          }
        }

        // if the data is an uri
        else if (dataType === "http://www.w3.org/2001/XMLSchema#anyURI") {
          loaderType.loader.load({
            ...loaderType.params,
            id: element,
            src: data,
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
      <canvas id="myCanvas" className=""></canvas>
      <canvas
        className="fixed right-0 bottom-0 h-40 w-40"
        id="myNavCubeCanvas"
      ></canvas>
    </>
  );
}
