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
  ChartTooltipContent,
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
    color: "#A855F7",
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
    <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl text-white">
      <CardHeader className="items-center pb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-white/40">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadarChart data={data}>
            <ChartTooltip 
              cursor={false} 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-black/90 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">{data.label}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-8 items-center">
                          <span className="text-xs text-white/70">Commandes</span>
                          <span className="text-sm font-black text-purple-400">{data.orders}</span>
                        </div>
                        <div className="flex justify-between gap-8 items-center">
                          <span className="text-xs text-white/70">Revenu</span>
                          <span className="text-sm font-black text-emerald-400">{data.revenue.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }} 
            />
            <PolarAngleAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <Radar
              dataKey={dataKey}
              name="Commandes"
              stroke="#A855F7"
              fill="#A855F7"
              fillOpacity={0.3}
              dot={{
                r: 4,
                fillOpacity: 1,
                fill: "#A855F7"
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 leading-none font-medium text-purple-400">
          Total : {totalOrders} commandes sur cette période <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}
