import { Tooltip } from "@mui/material";

type ButtonProps = {
  children: React.ReactElement;
  tooltip: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
};

export default function Button(props: ButtonProps) {
  function base(props: ButtonProps) {
    return (
      <button
        onClick={props.onClick}
        className={`p-2 hover:bg-ugent hover:bg-opacity-20 ${props.className}`}
        disabled={props.disabled}
        style={{ opacity: props.disabled ? "0.5" : "1" }}
      >
        <Tooltip title={props.tooltip}>{props.children}</Tooltip>
      </button>
    );
  }

  if (props.href) {
    return (
      <a href={props.href} target="_blank">
        {base(props)}
      </a>
    );
  } else {
    return base(props);
  }
}
