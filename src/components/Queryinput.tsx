import { TextareaAutosize } from "@mui/base";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { autoMode, freezing, query, uiQuery } from "~/modules/atoms";

export default function QueryInput() {
  const [tempUiQuery, setTempUiQuery] = useRecoilState(uiQuery);
  const [queryValue, setQuery] = useRecoilState(query);
  const mode = useRecoilValue(autoMode);
  const freeze = useRecoilValue(freezing);

  useEffect(() => {
    setTempUiQuery(queryValue);
  }, [queryValue]);

  const updateQuery = () => {
    setQuery(tempUiQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log(e.key);
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      updateQuery();
    }
  };

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
          opacity: freeze ? 0.3 : 1,
        }}
        disabled={freeze}
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
