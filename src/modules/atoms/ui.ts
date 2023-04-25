import { atom } from "recoil";

const freezing = atom<boolean>({
  key: "freezing",
  default: true,
});

const closeQuery = atom<boolean>({
  key: "closeQuery",
  default: false,
});

export { freezing, closeQuery };
