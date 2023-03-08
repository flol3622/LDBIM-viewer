import { Viewer } from "@xeokit/xeokit-sdk";

type ARViewerProps = {
  src?: string;
  height: string;
  models?: string[];
};

export default function ARViewer(props: ARViewerProps) {
  const myViewer = new Viewer({
    canvasId: "myCanvas",
    transparent: true,
  });

  return (
    <div
      className="modelContainer"
      style={{ width: "100%", height: props.height }}
    >
      <canvas id="myCanvas" style={{ width: "100%", height: props.height }} />
    </div>
  );
}
