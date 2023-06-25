import { Viewer } from "@xeokit/xeokit-sdk";
import { RefLRU, RefViewer } from "../refTypes";

function findRoom(viewer: RefViewer, position?: number[], lru?: RefLRU) {
  const down = [0, -1, 0];
  const up = [0, 1, 0];

  // const rooms = <string[]>[];
  // lru.current?.forEach((value, key) => {
  //   if (value.botType === "Space") {
  //     rooms.push(key);
  //   }
  // });

  position = position || viewer.current?.scene.camera.eye;

  function pick(direction: number[]) {
    return viewer.current?.scene.pick({
      origin: position,
      direction: direction,
      pickSurface: true,
      // includeEntities: rooms,
    });
  }

  console.log("pick(down)", pick(down));

  const resultDown = pick(down)?.entity?.id;
  const resultUp = pick(up)?.entity?.id;

  return [resultDown, resultUp, position];

  // if (resultDown?.entity === resultUp?.entity) {
  //   return resultDown?.entity?.id;
  // }
}

export default function BOTauto(
  viewer: React.MutableRefObject<Viewer | undefined>,
  setQuery: (query: string) => void
): NodeJS.Timer {
  return setInterval(() => {
      const [resultDown, resultUp, position] = findRoom(viewer);
      setQuery(`
# bottom hit:
# ${resultDown}
# top hit:
# ${resultUp}
# position:
# ${position}
PREFIX bot: <https://w3id.org/bot#>
PREFIX fog: <https://w3id.org/fog#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX inst: <https://172.16.10.122:8080/projects/1001/>
PREFIX jsfn: <http://www.ontotext.com/js#>

SELECT ?entity ?fog_geometry ?datatype ?botType
WHERE {
    ?entity rdf:type bot:Space .
    ?entity ?fog_geometry ?geometryData .
    FILTER(?fog_geometry IN (fog:asStl)) 
    BIND(DATATYPE(?geometryData) AS ?datatype)  
    FILTER(?datatype = xsd:anyURI)
    ?entity rdf:type ?botType .
    FILTER(STRSTARTS(str(?botType), "https://w3id.org/bot#"))
} 
LIMIT 20
      `);
  }, 1000);
}
