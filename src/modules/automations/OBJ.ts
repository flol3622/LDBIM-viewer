import { RefViewer } from "../refTypes";

export default function OBJauto(
  viewer: RefViewer,
  setQuery: (query: string) => void
): NodeJS.Timer {
  return setInterval(() => {
    const eye = viewer.current?.scene.camera.eye;
    if (eye && eye[0] && eye[2] && eye[1]) {
      const xcoord = Math.round(eye[0] * 1000).toString();
      const ycoord = Math.round(-eye[2] * 1000).toString();
      const zcoord = Math.round(eye[1] * 1000).toString();
      setQuery(`
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
    BIND("${xcoord},${ycoord},${zcoord}" as ?position)

    # select the room
    ?room a bot:Space .
    ?room fog:asObj ?obj .
    BIND(DATATYPE(?obj) AS ?type)  
    FILTER(?type = xsd:string)
    FILTER(jsfn:insideObjAABBox(?obj, ?position))

    # select the entities in the room
    ?room bot:containsElement|bot:adjacentElement ?entity .
    ?entity ?fog_geometry ?geometryData .
    FILTER(?fog_geometry IN (fog:asStl)) 
    BIND(DATATYPE(?geometryData) AS ?datatype)  
    FILTER(?datatype = xsd:anyURI)
    ?entity rdf:type ?botType .
    FILTER(STRSTARTS(str(?botType), "https://w3id.org/bot#"))
} 
LIMIT 20
        `);
    }
  }, 1000);
}
