"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DateFieldProps {
  name: string
  value: string
  path: string
  onChange: (path: string, value: string | null) => void
}

export function DateField({ name, value, path, onChange }: DateFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={path} className="capitalize text-xs">
        {name}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal h-7 text-xs", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            {value ? format(new Date(value), "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              if (date) {
                // Preserve time component if it exists
                const currentDate = value ? new Date(value) : new Date()
                date.setHours(currentDate.getHours())
                date.setMinutes(currentDate.getMinutes())
                date.setSeconds(currentDate.getSeconds())
                onChange(path, date.toISOString())
              } else {
                onChange(path, null)
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
