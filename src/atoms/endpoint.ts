import { atom } from "recoil";

const endpoint = atom<string>({
  key: "endpoint",
  default: "",
});

export default endpoint;
