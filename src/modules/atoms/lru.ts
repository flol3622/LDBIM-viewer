import { atom } from "recoil";

const lruLimit = atom<number>({
  key: "lruLimit",
  default: 30,
});

export default lruLimit;
