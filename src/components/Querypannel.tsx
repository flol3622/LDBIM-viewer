import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  ArrowTopRightIcon,
  Cross1Icon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { QueryMode, autoMode, closeQuery, freezing, query, uiQuery } from "~/modules/atoms";
import Button from "./Button";
import Divider from "./Divider";
import QueryInput from "./Queryinput";

export default function Querypannel() {
  const [close, setClose] = useRecoilState(closeQuery);
  const [mode, setMode] = useRecoilState(autoMode);
  const freezingValue = useRecoilValue(freezing);
  const tempUiQuery = useRecoilValue(uiQuery);
  const setQuery = useSetRecoilState(query);

  const updateQuery = () => {
    setQuery(tempUiQuery);
  };

  const handleMode = (_: React.MouseEvent, newMode: QueryMode) => {
    setMode(newMode);
  };

  const changeClose = () => {
    setClose(!close);
  };

  return (
    <>
      {!close && (
        <div className="fixed bottom-4 left-4 flex w-[400px] flex-col gap-2 rounded border bg-white p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <h3 className="flex-grow">Query</h3>
            <Divider />
            <div className="flex items-center gap-2">
              <p className="text-sm opacity-50">auto modes:</p>
              <ToggleButtonGroup
                color="primary"
                value={mode}
                exclusive
                onChange={handleMode}
                aria-label="Platform"
              >
                <ToggleButton size="small" value="OBJ">
                  OBJ
                </ToggleButton>
                <ToggleButton size="small" value="BOT">
                  BOT
                </ToggleButton>
                <ToggleButton size="small" value="GEO">
                  GEO
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
            <Divider />
            <Button tooltip="close editor" onClick={changeClose}>
              <Cross1Icon />
            </Button>
          </div>
          <hr />
          <QueryInput />
          {freezingValue && (
            <div className="absolute flex h-full w-full items-center justify-center ">
              <p className="bg-white p-2 ">
                Query is frozen while the viewer is initializing
              </p>
            </div>
          )}
          <div className="flex w-full items-center justify-between gap-2 px-2 ">
            <Button
              tooltip="update query"
              disabled={mode != null || freezingValue}
              onClick={updateQuery}
            >
              <PaperPlaneIcon />
            </Button>
            <p className="text-sm opacity-50">shortcut: Shift + Enter</p>
          </div>
        </div>
      )}
      {close && (
        <Button
          className="fixed bottom-4 left-4 rounded border bg-white shadow-lg"
          tooltip="open editor"
          onClick={changeClose}
        >
          <ArrowTopRightIcon />
        </Button>
      )}
    </>
  );
}
