import { GLTFLoaderPlugin, NavCubePlugin } from "@xeokit/xeokit-sdk";
import { Viewer } from "@xeokit/xeokit-sdk/src/viewer/Viewer";
import { Component } from "react";

import { useEffect } from "react";

export default function ARViewer(props) {
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

    model.on("loaded", () => {
      viewer.cameraFlight.jumpTo(model);
    });

    new NavCubePlugin(viewer, {
      canvasId: "myNavCubeCanvas",
      visible: true,
    });

    const scene = viewer.scene;
    const camera = scene.camera;
    camera.prjection = "perspective";

    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <div className="modelContainer" style={{ width: "100%", height: props.height }}>
      <canvas id="myCanvas" style={{ width: "100%", height: props.height }}></canvas>
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
      <canvas id="mySectionPlanesOverviewCanvas" className="sections"></canvas>
    </div>
  );
}
