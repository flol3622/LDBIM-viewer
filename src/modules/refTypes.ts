import { Viewer } from "@xeokit/xeokit-sdk";
import { LoaderType } from "./viewer";
import { LRUMap } from "lru_map";

export type RefViewer = React.MutableRefObject<Viewer | undefined>;
export type RefLoaderTypes = React.MutableRefObject<LoaderType | undefined>;
export type RefLRU = React.MutableRefObject<LRUMap<string, any> | undefined>;
