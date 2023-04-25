import { TextField, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { GitHubLogoIcon, RocketIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  cleanStart,
  defaultEndpoints,
  endpoint,
  freezing,
} from "~/modules/atoms";
import Divider from "./Divider";
import Button from "./Button";

export default function Navbar() {
  const [clean, setClean] = useRecoilState(cleanStart);
  const [endpointValue, setEndpoint] = useRecoilState(endpoint);
  const dftEndpoints = useRecoilValue(defaultEndpoints);
  const freezingValue = useRecoilValue(freezing);
  const [tempEndpoint, setTempEndpoint] = useState("");

  const updateEndpoint = () => {
    setEndpoint(tempEndpoint);
    console.log("updated endpoint:", endpointValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      updateEndpoint();
    }
  };

  return (
    <div className="border-black absolute z-10 flex h-16 w-full items-center justify-between gap-2 border-b bg-white p-2 shadow">
      <div className="flex h-full flex-grow items-center gap-2">
        <Button tooltip="Clean viewer" onClick={() => setClean(!clean)}>
          <TrashIcon />
        </Button>
        <Divider />
        <Autocomplete
          key={clean.toString()}
          disabled={freezingValue}
          size="small"
          sx={{ flexGrow: 1, maxWidth: 600 }}
          freeSolo
          options={dftEndpoints}
          onInputChange={(_, input) => {
            setTempEndpoint(input);
          }}
          onKeyDown={handleKeyDown}
          renderInput={(params) => (
            <TextField {...params} label="Type endpoint" />
          )}
        />
        <Button
          onClick={updateEndpoint}
          tooltip="Go to database"
          disabled={freezingValue}
        >
          <RocketIcon />
        </Button>
      </div>
      <Divider />
      <h1 className="text-right">
        Pre-culling geometric linked building data
        <br />
        for lightweight viewers
        <br />
      </h1>
      <Button
        tooltip="info"
        href="https://github.com/flol3622/AR-Linked-BIM-viewer"
      >
        <GitHubLogoIcon height={20} width={20} />
      </Button>
    </div>
  );
}
