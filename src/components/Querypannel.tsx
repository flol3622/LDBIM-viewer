import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { uiQuery } from "~/atoms";

export default function Querrypannel() {
  const [queryValue, setQuery] = useRecoilState(uiQuery);
  const [tempQuery, setTempQuery] = useState("");

  useEffect(() => {
    setTempQuery(queryValue);
  }, []);

  return (
    <>
      <div className="absolute bottom-4 left-4 flex h-[500px] w-[400px] flex-col rounded border bg-white p-2 pb-10 shadow-lg">
        <h3>Query</h3>
        <hr />
        <textarea
          spellCheck="false"
          defaultValue={tempQuery}
          className="flex-grow p-3 text-xs"
          onChange={(e) => setTempQuery(e.target.value)}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
          }}
        />
      </div>
      <PaperPlaneIcon
        className="absolute bottom-8 left-8 cursor-pointer"
        onClick={() => {
          setQuery(tempQuery);
          console.log("queryValue", queryValue);
        }}
      />
    </>
  );
}
