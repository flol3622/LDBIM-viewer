import { atom } from "recoil";

const query = atom<string>({
  key: "query",
  default: `PREFIX bot: <https://w3id.org/bot#>
PREFIX fog: <https://w3id.org/fog#>
PREFIX omg: <https://w3id.org/omg#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
select ?element ?fog_geometry ?datatype
where { 
    ?element ?fog_geometry ?geometryData .
    BIND(datatype(?geometryData) AS ?datatype)
    FILTER NOT EXISTS { ?element rdf:type bot:Space }
    FILTER(?fog_geometry IN (fog:asStl)) 
    FILTER(?datatype = xsd:anyURI)
} 
#ORDER BY (?element) (?fog_geometry)
LIMIT 20`,
});

const uiQuery = atom<string>({
  key: "uiQuery",
  default: "",
});

export type QueryMode = null | "BOT" | "GEO";

const autoMode = atom<QueryMode>({
  key: "autoMode",
  default: null,
});

export { query, autoMode, uiQuery };
