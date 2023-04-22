import InfoIcon from "@mui/icons-material/Info";
import { TextField, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { RocketIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { cleanStart, defaultEndpoints, endpoint, freezing } from "~/atoms";

function Divider() {
  return <div className="border-black self-stretch border-l border-dashed" />;
}

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
        <Tooltip title="Clean viewer">
          <TrashIcon className="mx-2" onClick={() => setClean(!clean)} />
        </Tooltip>
        <Divider />
        <Autocomplete
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
        <Tooltip title="Got to database">
          <button disabled={freezingValue} onClick={updateEndpoint}>
            <RocketIcon
              className="mx-2"
              style={{ color: freezingValue ? "gray" : "black" }}
            />
          </button>
        </Tooltip>
      </div>
      <Divider />
      <h1 className="text-right">
        Pre-culling geometric linked building data
        <br />
        for lightweight viewers
        <br />
      </h1>

      <Tooltip title="info">
        <div className="mx-2 flex items-center">
          <InfoIcon />
        </div>
      </Tooltip>
    </div>
  );
}
