import { GLTFLoaderPlugin, NavCubePlugin } from "@xeokit/xeokit-sdk";
import { Viewer } from "@xeokit/xeokit-sdk/src/viewer/Viewer";
import { Component } from "react";

export default class ARViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const viewer = this.setViewer();

    new NavCubePlugin(viewer, {
      canvasId: "myNavCubeCanvas",
      visible: true,
    });

    const scene = viewer.scene;
    const camera = scene.camera;
    camera.prjection = "perspective";
  }

  setViewer() {
    const viewer = new Viewer({
      canvasId: "myCanvas",
      transparent: true,
    });
    return viewer;
  }

  render() {
    return (
      <div
        className="modelContainer"
        style={{ width: "100%", height: this.props.height }}
      >
        <canvas
          id="myCanvas"
          style={{ width: "100%", height: this.props.height }}
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
        <canvas
          id="mySectionPlanesOverviewCanvas"
          className="sections"
        ></canvas>
      </div>
    );
  }
}
