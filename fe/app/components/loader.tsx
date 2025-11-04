import type { DetailedHTMLProps } from "react";
import { cn } from "@/utils/tailwind";

export interface ILoaderProps
  extends DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  size?: string;
  showLabel?: boolean;
  color?: "black" | "white";
}

export default function Loader({
  color = "black",
  showLabel,
  ...props
}: ILoaderProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-center flex-col gap-4",
        props.className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full size-4 border-b-2",
          props.size,
          {
            ["border-primary"]: color === "black",
            ["border-white"]: color === "white",
          }
        )}
      ></div>

      {showLabel && <span>Loading...</span>}
    </div>
  );
}
