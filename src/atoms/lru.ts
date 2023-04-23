import { atom } from "recoil";

const lruLimit = atom<number>({
  key: "lruLimit",
  default: 10,
});

export default lruLimit;
