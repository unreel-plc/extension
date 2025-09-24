import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SingleDateValue = Date | undefined;

interface DatePickerProps {
  value?: SingleDateValue;
  onChange?: (value: SingleDateValue) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<SingleDateValue>();
  const isControlled = value !== undefined || !!onChange;
  const date = isControlled ? value : internalDate;
  const setDate = (d?: Date) => {
    if (onChange) onChange(d);
    if (!isControlled) setInternalDate(d);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={`data-[empty=true]:text-muted-foreground w-full md:w-[240px] min-w-0 justify-start text-left font-normal gap-2 h-9 rounded-lg ${
            className ?? ""
          }`}
        >
          <CalendarIcon className="h-4 w-4 opacity-70" />
          {date ? (
            <span className="truncate">{format(date, "PPP")}</span>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
}
