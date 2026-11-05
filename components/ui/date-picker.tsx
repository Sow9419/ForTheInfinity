"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  /** Valeur au format "YYYY-MM-DDTHH:mm" (ou chaîne vide) */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
}

const pad = (n: number) => String(n).padStart(2, "0")

function toInputValue(date: Date, hours: string, minutes: string) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${hours}:${minutes}`
}

function parseValue(value: string): { date?: Date; hours: string; minutes: string } {
  if (!value) return { date: undefined, hours: "23", minutes: "59" }
  const [datePart, timePart] = value.split("T")
  const [y, m, d] = datePart.split("-").map(Number)
  const [h, min] = (timePart || "23:59").split(":").map(Number)
  const date = y && m && d ? new Date(y, m - 1, d) : undefined
  return {
    date,
    hours: pad(Number.isFinite(h) ? h : 23),
    minutes: pad(Number.isFinite(min) ? min : 59),
  }
}

/**
 * Sélecteur de date + heure — shadcn/ui (Popover + Calendar),
 * style "Chalk & Ink" aligné sur le design system admin.
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = "Choisir une date",
  className,
  id,
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const parsed = parseValue(value)
  const [date, setDate] = React.useState<Date | undefined>(parsed.date)
  const [hours, setHours] = React.useState(parsed.hours)
  const [minutes, setMinutes] = React.useState(parsed.minutes)

  // Re-synchronise l'état interne quand la valeur change de l'extérieur
  React.useEffect(() => {
    const p = parseValue(value)
    setDate(p.date)
    setHours(p.hours)
    setMinutes(p.minutes)
  }, [value])

  const commit = (nextDate: Date | undefined, h = hours, m = minutes) => {
    if (!nextDate) {
      onChange("")
      return
    }
    const nextHours = Math.min(23, Math.max(0, Number(h) || 0))
    const nextMinutes = Math.min(59, Math.max(0, Number(m) || 0))
    onChange(toInputValue(nextDate, pad(nextHours), pad(nextMinutes)))
  }

  const display = parsed.date
    ? `${parsed.date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} à ${parsed.hours}:${parsed.minutes}`
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-11 w-full items-center gap-2.5 rounded-2xl border border-black/[0.07] bg-neutral-50 px-4 text-left text-[13px] font-bold transition-all",
              "hover:border-neutral-900/20 focus:outline-none focus:ring-4 focus:ring-neutral-900/[0.05] focus:bg-white",
              "disabled:pointer-events-none disabled:opacity-50",
              className
            )}
          >
            <CalendarIcon size={15} className="shrink-0 text-neutral-400" />
            <span className={cn("flex-1 truncate", display ? "text-neutral-900" : "text-neutral-300 font-semibold")}>
              {display || placeholder}
            </span>
            {value && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Effacer la date"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange("")
                  setOpen(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange("")
                    setOpen(false)
                  }
                }}
                className="shrink-0 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-900"
              >
                <X size={13} />
              </span>
            )}
          </button>
        }
      />

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto rounded-[22px] border border-black/[0.07] bg-white p-3 shadow-[0_24px_60px_-24px_rgba(20,18,12,0.35)]"
      >
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          locale={fr}
          captionLayout="dropdown"
          onSelect={(next) => {
            setDate(next)
            if (next) commit(next)
          }}
          className="[--cell-size:--spacing(9)]"
        />

        {/* Heure */}
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-black/[0.06] px-2 pt-3">
          <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-neutral-400">Heure</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => {
                const v = e.target.value
                setHours(v)
                if (date) commit(date, v, minutes)
              }}
              className="h-9 w-14 rounded-xl border border-black/[0.07] bg-neutral-50 px-2 text-center text-[13px] font-black tabular-nums outline-none focus:border-neutral-900/25 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.05]"
              aria-label="Heures"
            />
            <span className="text-[13px] font-black text-neutral-300">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => {
                const v = e.target.value
                setMinutes(v)
                if (date) commit(date, hours, v)
              }}
              className="h-9 w-14 rounded-xl border border-black/[0.07] bg-neutral-50 px-2 text-center text-[13px] font-black tabular-nums outline-none focus:border-neutral-900/25 focus:bg-white focus:ring-4 focus:ring-neutral-900/[0.05]"
              aria-label="Minutes"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 px-1 pb-0.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onChange("")
              setDate(undefined)
              setOpen(false)
            }}
            className="h-8 rounded-full px-3 text-[11px] font-bold text-neutral-500 hover:bg-neutral-100"
          >
            Effacer
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (date) commit(date)
              setOpen(false)
            }}
            disabled={!date}
            className="h-8 rounded-full bg-neutral-900 px-4 text-[11px] font-bold text-white hover:bg-neutral-800"
          >
            Terminé
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
