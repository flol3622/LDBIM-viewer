import {
  GLTFLoaderPlugin,
  NavCubePlugin,
  OBJLoaderPlugin,
  STLLoaderPlugin,
  Viewer,
} from "@xeokit/xeokit-sdk";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { cleanStart, freezing } from "../atoms";
import { RefLoaderTypes, RefViewer } from "../refTypes";

export type LoaderType = {
  [key: string]: {
    loader: any; // could not find a general type for loaders
    params?: any;
    litParam?: string;
    uriParam?: "src";
  };
};

export default function useInitViewer(
  viewer: RefViewer,
  loaderTypes: RefLoaderTypes
) {
  const clean = useRecoilValue(cleanStart);
  const setFreeze = useSetRecoilState(freezing);

  useEffect(() => {
    // freeze the query and endpoint inputs
    setFreeze(true);
    // clear the existing canvas
    viewer.current?.scene.clear();

    // initialize the viewer
    viewer.current = new Viewer({
      canvasId: "myCanvas",
      transparent: true,
    });

    // initialize the navcube
    new NavCubePlugin(viewer.current, {
      canvasId: "myNavCubeCanvas",
      visible: true,
    });

    // identify the scene and camera
    const scene = viewer.current?.scene;
    const camera = scene.camera;
    camera.projection = "perspective";

    // initialize the loaders
    const gltfLoader = new GLTFLoaderPlugin(viewer.current);
    const objLoader = new OBJLoaderPlugin(viewer.current, {});
    const stlLoader = new STLLoaderPlugin(viewer.current);

    // store the loaders in a ref
    loaderTypes.current = {
      "https://w3id.org/fog#asGltf": {
        loader: gltfLoader,
        params: { edges: true },
        litParam: "gltf",
        uriParam: "src",
      },
      "https://w3id.org/fog#asStl": {
        loader: stlLoader,
        params: { edges: true, rotation: [180, 0, 0] },
        litParam: "stl",
        uriParam: "src",
      },
      "https://w3id.org/fog#asObj": {
        loader: objLoader,
        uriParam: "src",
      },
    };
    console.log("viewer initialized");
    setFreeze(false);
  }, [clean]);
}
