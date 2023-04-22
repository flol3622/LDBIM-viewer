import { atom } from "recoil";

const cleanStart = atom<boolean>({
  key: "cleanStart",
  default: false,
});

export default cleanStart