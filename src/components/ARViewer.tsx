import { GLTFLoaderPlugin, NavCubePlugin, Viewer } from "@xeokit/xeokit-sdk";
import { useSetRecoilState } from "recoil";
import { useEffect } from "react";
import { location } from "~/atoms";

export default function ARViewer(props: { height: string }) {
  const setCameraPosition = useSetRecoilState(location);

  useEffect(() => {
    const viewer = new Viewer({
      canvasId: "myCanvas",
      transparent: true,
    });

    const loader = new GLTFLoaderPlugin(viewer);

    const model = loader.load({
      id: "lol",
      src: "https://raw.githubusercontent.com/xeokit/xeokit-sdk/master/assets/models/gltf/Box/glTF-Embedded/Box.gltf",
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
    </div>
  );
}
