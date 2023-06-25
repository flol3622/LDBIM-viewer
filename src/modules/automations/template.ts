import { RefViewer } from "../refTypes";

export default function GeoSPARQLauto(
    viewer: RefViewer,
    setQuery: (query: string) => void
): NodeJS.Timer {
    return setInterval(() => {
        const eye = viewer.current?.scene.camera.eye;

        // String construction of query
        setQuery(" ");
    }, 1000);
}
