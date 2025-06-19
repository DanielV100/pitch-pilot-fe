

'use client'

import { LabelList, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'


type ScoreProps = {
    cockpit: number
    altitude: number
    flightPath: number
    preflight: number
}

const cfg = {
    val: { label: 'Score' },
    cockpit: { label: 'Cockpit', color: 'var(--chart-1)' },
    altitude: { label: 'Altitude', color: 'var(--chart-2)' },
    flightPath: { label: 'Flight Path', color: 'var(--chart-3)' },
    preflight: { label: 'Pre-flight', color: 'var(--chart-4)' },
} as const

const makeData = (s: ScoreProps) => [
    { name: 'Cockpit', val: s.cockpit, fill: cfg.cockpit.color },
    { name: 'Altitude', val: s.altitude, fill: cfg.altitude.color },
    { name: 'Flight Path', val: s.flightPath, fill: cfg.flightPath.color },
    { name: 'Pre-flight', val: s.preflight, fill: cfg.preflight.color },
]

export function ChartRadialLabel(scores: ScoreProps) {
    const data = makeData(scores)

    return (
        <div className='size-full '>
            <ChartContainer config={cfg} className="size-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        data={data}
                        innerRadius="40%"
                        outerRadius="95%"
                        startAngle={90}
                        endAngle={-270}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel nameKey="name" />}
                        />
                        <RadialBar
                            dataKey="val"
                            background

                        >

                            <LabelList
                                position="insideStart"
                                dataKey="name"
                                className="fill-white capitalize mix-blend-luminosity"
                                fontSize={11}
                            />
                        </RadialBar>
                    </RadialBarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>

    )
}
