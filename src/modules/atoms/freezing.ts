import { atom } from "recoil";

const freezing = atom<boolean>({
  key: "freezing",
  default: true,
});

export default freezing;
