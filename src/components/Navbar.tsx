import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import InfoIcon from "@mui/icons-material/Info";
import { IconButton, TextField, Tooltip } from "@mui/material";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { endpoint } from "~/atoms";

export default function Navbar() {
  const [endpointValue, setEndpoint] = useRecoilState(endpoint);
  const [tempEndpoint, setTempEndpoint] = useState(
    "http://localhost:7200/repositories/duplex-v1"
  );

  const handleEnpointChange = (event: any) => {
    setTempEndpoint(event.target.value);
  };

  const updateEndpoint = () => {
    setEndpoint(tempEndpoint);
    console.log("updated endpoint:", endpointValue);
  };

  return (
    <div className="border-black flex h-14 items-center gap-2 border-b px-2">
      <Tooltip title="Got to database">
        <IconButton onClick={updateEndpoint}>
          <ExitToAppIcon sx={{ color: "#1E64C8" }} />
        </IconButton>
      </Tooltip>
      <TextField
        label="Endpoint"
        variant="filled"
        sx={{ flexGrow: 1 }}
        defaultValue={tempEndpoint}
        onChange={handleEnpointChange}
      />
      <h1>
        Pre-culling linked building data
        <br />
        <p className="text-xs">for augmented reality on the building site</p>
      </h1>

      <Tooltip title="info">
        <IconButton>
          <InfoIcon sx={{ color: "#1E64C8" }} />
        </IconButton>
      </Tooltip>
    </div>
  );
}
