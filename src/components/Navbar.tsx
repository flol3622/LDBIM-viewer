import ShareIcon from "@mui/icons-material/Share";
import { IconButton, TextField, Tooltip } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import InfoIcon from "@mui/icons-material/Info";

export default function Navbar() {
  return (
    <div className="border-black flex h-14 items-center gap-2 border-b px-2">
      <Tooltip title="Got to database">
        <IconButton>
          <ExitToAppIcon sx={{ color: "#1E64C8" }} />
        </IconButton>
      </Tooltip>
      <TextField
        sx={{ flexGrow: 1 }}
        variant="filled"
        label="Database url"
        defaultValue="http://localhost:7200/repositories/test3"
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
