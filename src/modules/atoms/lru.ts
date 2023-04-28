import { atom } from "recoil";

const lruLimit = atom<number>({
  key: "lruLimit",
  default: 20,
});

export default lruLimit;
