import { atom } from "recoil";

const uiQuery = atom<string>({
  key: "uiQuery",
  default: `
  PREFIX bot: <https://w3id.org/bot#>
  PREFIX fog: <https://w3id.org/fog#>
  PREFIX omg: <https://w3id.org/omg#>
  PREFIX flupke: <http://flupke.archi#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  select ?element ?fog_geometry ?geometryData
  where { 
    flupke:room1 bot:containsElement ?element .
      ?element omg:hasGeometry ?geometry .
      ?geometry ?fog_geometry ?geometryData .
      FILTER(?fog_geometry IN (fog:asObj, fog:asStl, fog:asGltf)) 
      #FILTER(datatype(?geometryData) = xsd:anyURI)
  } 
  #ORDER BY (?element) (?fog_geometry)
  LIMIT 20
  `,
});

export default uiQuery;
