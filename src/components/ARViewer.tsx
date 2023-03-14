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

export default function ARViewer(props: { height: string }) {
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

    // camera.on("viewMatrix", function (matrix: any) {
    //   console.log("eye", camera.eye);
    //   console.log("look", camera.look);
    //   console.log("up", camera.up);
    //   console.log("testje", matrix);
    // });

    getGeometry(viewer);
  }, []);

  async function getGeometry(viewer: any) {

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
    
    // loop through the incoming stream and load the geometry
    bindingsStream.on("data", (bindings: any) => {

      // define loaders for the different geometry formats
      const gltfLoader = new GLTFLoaderPlugin(viewer);
      const objLoader = new OBJLoaderPlugin(viewer, {});
      const stlLoader = new STLLoaderPlugin(viewer);

      // if defined as url
      if (
        bindings.geometryData.datatype.value ===
        "http://www.w3.org/2001/XMLSchema#anyURI"
      ) {

        // if the geometry is in gltf format
        if (bindings.fog_geometry.value === "https://w3id.org/fog#asGltf") {
          gltfLoader.load({
            id: bindings.element.value,
            src: bindings.geometryData.value,
            edges: true,
          });
          console.log("gltf loaded", bindings.element.value);
        } 

        // if the geometry is in obj format
        else if (
          bindings.fog_geometry.value === "https://w3id.org/fog#asObj"
        ) {
          objLoader.load({
            id: bindings.element.value,
            src: bindings.geometryData.value,
          });
          console.log("obj loaded", bindings.element.value);
        } 

        // if the geometry is in stl format
        else if (
          bindings.fog_geometry.value === "https://w3id.org/fog#asStl"
        ) {
          stlLoader.load({
            id: bindings.element.value,
            src: bindings.geometryData.value,
            edges: true,
          });
          console.log("stl loaded", bindings.element.value);
        } 
        
        // if the geometry format is not yet implemented
        else {
          console.log(
            "this geometry format, incoming from an url, is not yet implemented"
          );
        }
      } 
      
      // if defined as literal
      else if (
        bindings.geometryData.datatype.value ===
        "http://www.w3.org/2001/XMLSchema#string"
      ) {
        console.log({ format: bindings.fog_geometry.value });

        // if the geometry is in gltf format
        if (bindings.fog_geometry.value === "https://w3id.org/fog#asGltf") {
          gltfLoader.load({
            id: bindings.element.value,
            gltf: bindings.geometryData.value,
            edges: true,
          });
          console.log("gltf literal loaded", bindings.element.value);
        } 
        
        // if the geometry is in stl format
        else if (
          bindings.fog_geometry.value === "https://w3id.org/fog#asStl"
        ) {
          stlLoader.load({
            id: bindings.element.value,
            stl: bindings.geometryData.value,
            edges: true,
          });
          console.log("stl literal loaded", bindings.element.value);
        } 
        
        // if the geometry format is not yet implemented
        else {
          console.log(
            "this geometry format, incoming from a literal, is not yet implemented"
          );
        }
      } 
      
      // if the geometry source is undefined | wrong
      else {
        console.log("wrong or undefined data source");
      }
    });
  }

  return (
    <div
      className="modelContainer"
      style={{ width: "100%", height: props.height }}
    >
      <canvas
        id="myCanvas"
        style={{ width: "100%", height: props.height }}
        className="border-2 border-red-500"
      ></canvas>
      <canvas
        style={{
          height: "200px",
          width: "200px",
          position: "fixed",
          right: 0,
          bottom: 0,
        }}
        className="navCube"
        id="myNavCubeCanvas"
      ></canvas>
      <button>test sparql fetch</button>
    </div>
  );
}
