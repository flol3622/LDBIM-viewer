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
      <div className="absolute bottom-4 left-4 h-[500px] w-[400px] rounded border bg-white p-2 pb-10 shadow-lg flex flex-col">
        <h3>Query</h3>
        <hr/>
        <textarea
          spellCheck="false"
          defaultValue={queryValue}
          className="flex-grow text-xs"
          onChange={handleQueryChange}
          />
      </div>
      <PaperPlaneIcon className="absolute bottom-8 left-8 cursor-pointer"
      onClick={updateQuery}/>
    </>
  );
}
