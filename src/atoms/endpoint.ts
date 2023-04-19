import { atom } from "recoil";

const endpoint = atom<string>({
  key: "endpoint",
  default: "http://localhost:7200/repositories/duplex-v1",
});

export default endpoint;
