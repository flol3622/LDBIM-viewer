import { atom } from "recoil";

const uiQuery = atom<string>({
  key: "uiQuery",
  default: `
  PREFIX bot: <https://w3id.org/bot#>
  PREFIX fog: <https://w3id.org/fog#>
  PREFIX omg: <https://w3id.org/omg#>
  PREFIX flupke: <http://flupke.archi#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX inst: <https://172.16.10.122:8080/projects/1001/>
  select ?element ?fog_geometry ?geometryData
  where { 
  # inst:room_1xS3BCk291UvhgP2dvNvkU bot:containsElement ?element .
  #	?element omg:hasGeometry ?geometry .
  #	?geometry ?fog_geometry ?geometryData .
      ?element ?fog_geometry ?geometryData
    FILTER(?fog_geometry IN (fog:asStl)) 
  	FILTER(datatype(?geometryData) = xsd:anyURI)
  } 
  #ORDER BY (?element) (?fog_geometry)
  #LIMIT 20
  `,
});

export default uiQuery;