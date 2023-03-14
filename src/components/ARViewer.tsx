import { GLTFLoaderPlugin, NavCubePlugin, Viewer } from "@xeokit/xeokit-sdk";
import { SparqlEndpointFetcher } from "fetch-sparql-endpoint";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { location } from "~/atoms";

export default function ARViewer(props: { height: string }) {
  const setCameraPosition = useSetRecoilState(location);

  async function getGeometry() {
    const sparql = `
    PREFIX bot: <https://w3id.org/bot#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX fog: <https://w3id.org/fog#>
    PREFIX omg: <https://w3id.org/omg#>
    PREFIX flupke: <http://flupke.archi/>
    select * where { 
      flupke:cubeGLTF ?p ?o.
    } limit 10 
    `;

    const myFetcher = new SparqlEndpointFetcher();

    const bindingsStream = await myFetcher.fetchBindings(
      "http://localhost:7200/repositories/test2",
      sparql
    );

    bindingsStream.on("data", (bindings: any) => console.log(bindings));
  }
  function test() {
    console.log("mytest");
  }

  useEffect(() => {
    test();
    getGeometry();
    const viewer = new Viewer({
      canvasId: "myCanvas",
      transparent: true,
    });

    const loader = new GLTFLoaderPlugin(viewer);

    const model = loader.load({
      id: "lol",
      src: "https://raw.githubusercontent.com/flol3622/AR-Linked-BIM-viewer/main/public/assets/database_1/cubeGLTF.gltf",
      edges: true,
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
  }, []);

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
