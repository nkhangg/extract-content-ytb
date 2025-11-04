import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface IInputPasswordProps {}

export default function InputPassword(props: ComponentProps<"input">) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Input {...props} type={open ? "text" : "password"} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
