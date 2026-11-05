"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"

interface ChartRadarDotsProps {
  data: any[]
  title?: string
  description?: string
  config?: ChartConfig
  dataKey?: string
}

const defaultChartConfig = {
  desktop: {
    label: "Revenu",
    color: "#171512",
  },
} satisfies ChartConfig

export function ChartRadarDots({ 
  data, 
  title = "Analyse des Commandes", 
  description = "Volume de commandes et revenus par période",
  config = defaultChartConfig,
  dataKey = "value"
}: ChartRadarDotsProps) {
  const totalOrders = data.reduce((acc, curr) => acc + (curr.orders || 0), 0);

  return (
    <Card className="rounded-[26px] bg-white border-black/[0.06] shadow-[0_1px_2px_rgba(20,18,12,0.04),0_16px_40px_-24px_rgba(20,18,12,0.18)] text-neutral-900 border">
      <CardHeader className="items-start pb-4">
        <CardTitle className="text-[17px] font-black tracking-tight text-neutral-900">{title}</CardTitle>
        <CardDescription className="text-neutral-400 font-medium">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[290px]"
        >
          <RadarChart data={data}>
            <ChartTooltip 
              cursor={false} 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-black/[0.08] p-3.5 rounded-2xl shadow-xl">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-black">{d.label}</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between gap-8 items-center">
                          <span className="text-[11px] text-neutral-500 font-bold">Commandes</span>
                          <span className="text-[12.5px] font-black text-neutral-900 tabular-nums">{d.orders}</span>
                        </div>
                        <div className="flex justify-between gap-8 items-center">
                          <span className="text-[11px] text-neutral-500 font-bold">Revenu</span>
                          <span className="text-[12.5px] font-black text-emerald-600 tabular-nums">{Number(d.revenue).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }} 
            />
            <PolarAngleAxis dataKey="label" tick={{ fill: 'rgba(20,18,12,0.38)', fontSize: 10, fontWeight: 700 }} />
            <PolarGrid stroke="rgba(20,18,12,0.07)" />
            <Radar
              dataKey={dataKey}
              name="Commandes"
              stroke="#171512"
              fill="#171512"
              fillOpacity={0.14}
              dot={{
                r: 3.5,
                fillOpacity: 1,
                fill: "#171512",
                strokeWidth: 0,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-5 border-t border-black/[0.05]">
        <div className="flex items-center gap-2 text-[12px] font-black text-neutral-700 leading-none">
          Total : <span className="text-neutral-900">{totalOrders}</span> commandes sur cette période <TrendingUp className="h-4 w-4 text-emerald-600" />
        </div>
      </CardFooter>
    </Card>
  )
}
