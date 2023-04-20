import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { uiQuery } from "~/atoms";

export default function Querrypannel() {
  const [tempQuery, setTempQuery] = useState("");
  const [queryValue, setQuery] = useRecoilState(uiQuery);

  const handleQueryChange = (event: any) => {
    setTempQuery(event.target.value);
  };

  const updateQuery = () => {
    setQuery(tempQuery);
    console.log("updated Query:", queryValue);
  };
  return (
    <>
      <div className="absolute bottom-4 left-4 flex h-[500px] w-[400px] flex-col rounded border bg-white p-2 pb-10 shadow-lg">
        <h3>Query</h3>
        <hr />
        <textarea
          spellCheck="false"
          defaultValue={queryValue}
          className="flex-grow text-xs p-3"
          onChange={handleQueryChange}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
          }}
        />
      </div>
      <PaperPlaneIcon
        className="absolute bottom-8 left-8 cursor-pointer"
        onClick={updateQuery}
      />
    </>
  );
}
