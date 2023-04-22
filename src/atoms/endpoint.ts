import { atom } from "recoil";

const endpoint = atom<string>({
  key: "endpoint",
  default: "",
});

const defaultEndpoints = atom<string[]>({
  key: "defaultEndpoints",
  default: [
    "http://localhost:7200/repositories/duplex-v1",
    "http://localhost:7200/repositories/test2",
    "http://localhost:7200/repositories/test3",
  ],
});

export { endpoint, defaultEndpoints };
