import { atom } from "recoil";

const endpoint = atom<string>({
  key: "endpoint",
  default: "http://localhost:7200/repositories/test3",
});

export default endpoint;
