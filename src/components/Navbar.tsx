import { TextField, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import {
  CheckIcon,
  GitHubLogoIcon,
  RocketIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  cleanStart,
  defaultEndpoints,
  endpoint,
  freezing,
  lruLimit,
} from "~/modules/atoms";
import Divider from "./Divider";
import Button from "./Button";

export default function Navbar() {
  const [clean, setClean] = useRecoilState(cleanStart);
  const [endpointValue, setEndpoint] = useRecoilState(endpoint);
  const [limit, setLimit] = useRecoilState(lruLimit);
  const dftEndpoints = useRecoilValue(defaultEndpoints);
  const freezingValue = useRecoilValue(freezing);
  const [tempEndpoint, setTempEndpoint] = useState("");
  const [tempLimit, setTempLimit] = useState<number>(0);

  useEffect(() => {
    setTempLimit(limit);
  }, []);

  const handleTempLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempLimit(parseInt(event.target.value));
  };

  const updateEndpoint = () => {
    setEndpoint(tempEndpoint);
    console.log("updated endpoint:", endpointValue);
  };

  const updateLimit = () => {
    setLimit(tempLimit);
  };

  const handleKeyDownEndpoint = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      updateEndpoint();
    }
  };

  const handleKeyDownLRU = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      updateLimit();
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
          onKeyDown={handleKeyDownEndpoint}
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
      <TextField
        type="number"
        size="small"
        label="Max. objects"
        sx={{ width: 100 }}
        value={tempLimit}
        onKeyDown={handleKeyDownLRU}
        onChange={(e) => setTempLimit(parseInt(e.target.value))}
      />
      <Button onClick={updateLimit} tooltip="Update LRU limit">
        <CheckIcon />
      </Button>
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
