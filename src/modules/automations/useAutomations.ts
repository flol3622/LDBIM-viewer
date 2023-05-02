import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { autoMode, query } from "~/modules/atoms";
import { RefLRU, RefViewer } from "../refTypes";
import GeoSPARQLauto from "./GeoSPARQL";
import OBJauto from "./OBJ";

export default function useAutomations(viewer: RefViewer, LRU: RefLRU): void {
  const mode = useRecoilValue(autoMode);
  const setQuery = useSetRecoilState(query);

  useEffect(() => {
    let automation: NodeJS.Timer | undefined;

    switch (mode) {
      case "GEO":
        automation = GeoSPARQLauto(viewer, setQuery);
        break;
      case "BOT":
        // BOTauto(viewer, setQuery);
        break;
      case "OBJ":
        automation = OBJauto(viewer, setQuery);
        break;
      default:
        console.log("manual mode");
    }

    return () => {
      if (automation) clearInterval(automation);
    };
  }, [mode]);
}

export {};
