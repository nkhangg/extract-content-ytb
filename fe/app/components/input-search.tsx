import { Search, X } from "lucide-react";
import { useState, useEffect, type ComponentProps } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/utils/tailwind";

export default function InputSearch(props: ComponentProps<"input">) {
  const [value, setValue] = useState(String(props.value ?? ""));

  // Đồng bộ khi value từ props thay đổi
  useEffect(() => {
    setValue(String(props.value ?? ""));
  }, [props.value]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    props.onChange?.({
      ...({} as any), // Type trick
      target: { value: newValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        {...props}
        className={cn("pl-10", props.className)}
        onChange={(e) => handleChange(e.target.value)}
        value={value}
      />
      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => handleChange("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
