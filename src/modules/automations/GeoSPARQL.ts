import { Viewer } from "@xeokit/xeokit-sdk";
import { RefViewer } from "../refTypes";

export default function GeoSPARQLauto(
  viewer: RefViewer,
  setQuery: (query: string) => void
): NodeJS.Timer {
  return setInterval(() => {
    const eye = viewer.current?.scene.camera.eye;
    if (eye && eye[0] && eye[2]) {
      const xcoord = Math.round(eye[0] * 1000).toString();
      const ycoord = Math.round(-eye[2] * 1000).toString();
      console.log(xcoord, ycoord);
      setQuery(`
PREFIX bot: <https://w3id.org/bot#>
PREFIX fog: <https://w3id.org/fog#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX inst:<https://172.16.10.122:8080/projects/1001/>

SELECT ?entity ?fog_geometry ?datatype
WHERE {
  {
    ?entity geo:asWKT ?entityWKT .
    FILTER(geof:sfWithin("POINT(${xcoord} ${ycoord})", ?entityWKT))
  }
  UNION
  {
    # elements in the room
    ?room rdf:type bot:Space .
    ?room geo:asWKT ?roomWKT .
    FILTER(geof:sfWithin("POINT(${xcoord} ${ycoord})", ?roomWKT))
    
    # get elements in the room
    ?room bot:containsElement|bot:adjacentElement ?entity .
  }
  FILTER NOT EXISTS { ?entity rdf:type bot:Space }
  ?entity ?fog_geometry ?geometryData .
  FILTER(?fog_geometry IN (fog:asStl)) 
  BIND(DATATYPE(?geometryData) AS ?datatype)  
  FILTER(?datatype = xsd:anyURI)
} 
LIMIT 20
          `);
    }
  }, 1000);
}
