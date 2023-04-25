import TextareaAutosize from "@mui/base/TextareaAutosize";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import {
  ArrowTopRightIcon,
  Cross1Icon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { autoMode, freezing, query } from "~/modules/atoms";
import { QueryMode } from "~/modules/atoms/query";
import { closeQuery } from "~/modules/atoms";
import Divider from "./Divider";
import Button from "./Button";

export default function Querypannel() {
  const [queryValue, setQuery] = useRecoilState(query);
  const [close, setClose] = useRecoilState(closeQuery);
  const freezingValue = useRecoilValue(freezing);
  const [mode, setMode] = useRecoilState(autoMode);
  const [tempUiQuery, setTempUiQuery] = useState("");

  useEffect(() => {
    setTempUiQuery(queryValue);
  }, []);

  const updateQuery = () => {
    setQuery(tempUiQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      updateQuery();
    }
  };

  const handleMode = (_: React.MouseEvent, newMode: QueryMode) => {
    setMode(newMode);
  };

  const changeClose = () => {
    setClose(!close);
  };

  function QueryInput() {
    if (mode === null) {
      return (
        <TextareaAutosize
          minRows={4}
          aria-label="maximum height"
          placeholder="Write query"
          defaultValue={tempUiQuery}
          spellCheck="false"
          style={{
            width: "100%",
            padding: "0.5rem",
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: "0.7rem",
            opacity: freezingValue ? 0.3 : 1,
          }}
          disabled={freezingValue}
          onChange={(e) => setTempUiQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      );
    } else {
      return (
        <p
          className="text-blue whitespace-pre-wrap p-2 text-[0.7rem] opacity-50"
          style={{ fontFamily: '"Fira code", "Fira Mono", monospace' }}
        >
          {queryValue}
        </p>
      );
    }
  }
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
