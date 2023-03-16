import {
  GLTFLoaderPlugin,
  NavCubePlugin,
  OBJLoaderPlugin,
  STLLoaderPlugin,
  Viewer,
} from "@xeokit/xeokit-sdk";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { location } from "~/atoms";

export default function ARViewer() {
  const setCameraPosition = useSetRecoilState(location);

  useEffect(() => {
    const viewer = new Viewer({
      canvasId: "myCanvas",
      transparent: true,
    });

    new NavCubePlugin(viewer, {
      canvasId: "myNavCubeCanvas",
      visible: true,
    });

    const scene = viewer.scene;
    const camera = scene.camera;
    camera.projection = "perspective";

    camera.on("viewMatrix", function (matrix: any) {
      console.log("eye", camera.eye);
      console.log("look", camera.look);
      console.log("up", camera.up);
      console.log("testje", matrix);
    });

    getGeometry(viewer);
  }, []);

  async function getGeometry(viewer: any) {
    console.log("getGeometry");
    // sparql query to get all compatible geometry data from a room
    const sparql = `
    PREFIX bot: <https://w3id.org/bot#>
    PREFIX fog: <https://w3id.org/fog#>
    PREFIX omg: <https://w3id.org/omg#>
    PREFIX flupke: <http://flupke.archi#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    select ?element ?fog_geometry ?geometryData
    where { 
      flupke:room1 bot:containsElement ?element .
        ?element omg:hasGeometry ?geometry .
        ?geometry ?fog_geometry ?geometryData .
        FILTER(?fog_geometry IN (fog:asObj, fog:asStl, fog:asGltf)) 
        #FILTER(datatype(?geometryData) = xsd:anyURI)
    } 
    #ORDER BY (?element) (?fog_geometry)
    LIMIT 20
    `;

    // fetch the data from the sparql endpoint
    const myFetcher = new SparqlEndpointFetcher();
    const bindingsStream = await myFetcher.fetchBindings(
      "http://localhost:7200/repositories/test3",
      sparql
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
      },
    };

    // for every incoming result, load the geometry
    bindingsStream.on("data", (bindings: any) => {
      const format = bindings.fog_geometry.value;
      const data = bindings.geometryData.value;
      const dataType = bindings.geometryData.datatype.value;
      const element = bindings.element.value;

      const loaderType = loaderTypes[format];

      // check if the format is supported
      if (loaderType) {
        // if the data is a literal, and is supported
        if (
          dataType === "http://www.w3.org/2001/XMLSchema#string" &&
          loaderType.litParam
        ) {
          loaderType.loader.load({
            ...loaderType.params,
            id: element,
            [loaderType.litParam]: data,
          });
        }

        // if the data is a uri
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
      <canvas id="myCanvas" className="h-full w-full"></canvas>
      <canvas
        className="fixed right-0 bottom-0 h-40 w-40"
        id="myNavCubeCanvas"
      ></canvas>
    </>
  );
}
