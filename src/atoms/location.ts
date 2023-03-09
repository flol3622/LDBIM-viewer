import { atom } from "recoil";

type visibility = any;

const location = atom<visibility>({
  key: "location",
  default: [0,0,0,0,0,0],
});

export default location;
