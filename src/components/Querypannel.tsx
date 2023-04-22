import { PaperPlaneIcon } from "@radix-ui/react-icons";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { freezing, uiQuery } from "~/atoms";

export default function Querrypannel() {
  const freezingValue = useRecoilValue(freezing);
  const [queryValue, setQuery] = useRecoilState(uiQuery);
  const [tempQuery, setTempQuery] = useState("");

  useEffect(() => {
    setTempQuery(queryValue);
  }, []);

  const updateQuery = () => {
    setQuery(tempQuery);
    console.log("updated query");
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && e.shiftKey) {
      updateQuery();
    }
  };

  return (
    <div className="absolute bottom-4 left-4 flex w-[400px] flex-col rounded border bg-white p-2 shadow-lg">
      <h3 className="pb-1">Query</h3>
      <hr />
      <TextareaAutosize
        minRows={4}
        aria-label="maximum height"
        placeholder="Write query"
        defaultValue={tempQuery}
        spellCheck="false"
        style={{
          width: "100%",
          padding: "0.5rem",
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: "0.7rem",
          opacity: freezingValue ? 0.3 : 1,
        }}
        disabled={freezingValue}
        onChange={(e) => setTempQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {freezingValue && (
        <div className="absolute flex h-full w-full items-center justify-center ">
          <p className="bg-white p-2 ">
            Query is frozen while the viewer is initializing
          </p>
        </div>
      )}
      <div className="my-2 flex w-full items-center justify-between gap-2 px-2 ">
        <PaperPlaneIcon className="cursor-pointer" onClick={updateQuery} />
        <p className="text-sm opacity-50">shortcut: Shift + Enter</p>
      </div>
    </div>
  );
}
