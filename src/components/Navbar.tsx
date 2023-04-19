import ShareIcon from "@mui/icons-material/Share";
import { IconButton, InputBase, TextField, Tooltip } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import InfoIcon from "@mui/icons-material/Info";
import { useRecoilState } from "recoil";
import { endpoint } from "~/atoms";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [tempEndpoint, setTempEndpoint] = useState("");
  const [endpointValue, setEndpoint] = useRecoilState(endpoint);
  
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
        defaultValue={endpointValue}
        onChange={handleEnpointChange}
      />
      <h1>
        Pre-culling linked building data
        <br />
        <p className="text-xs">for augmented reality on the building site</p>
      </h1>

      <Tooltip title="info">
        <IconButton onClick={updateEndpoint}>
          <InfoIcon sx={{ color: "#1E64C8" }} />
        </IconButton>
      </Tooltip>
    </div>
  );
}
