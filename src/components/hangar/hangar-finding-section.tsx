'use client'

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PdfPreviewCard } from "../ui/pdf-preview-card"

//@ToDo: get findings from Backend
const findings = [
    { type: "Cockpit", importance: 10, confidence: 9, severity: 1 },
    { type: "Flight path", importance: 10, confidence: 9, severity: 1 },
    { type: "Altitude", importance: 9, confidence: 10, severity: 2 },
    { type: "Altitude", importance: 10, confidence: 9, severity: 2 },
    { type: "Altitude", importance: 9, confidence: 9, severity: 2 },
    { type: "Altitude", importance: 10, confidence: 10, severity: 2 },
    { type: "Pre flight", importance: 9, confidence: 10, severity: 2 },
    { type: "Pre flight", importance: 10, confidence: 9, severity: 2 },
    { type: "Pre flight", importance: 9, confidence: 10, severity: 3 },
]

const grouped = findings.reduce((acc, f) => {
    const key = f.type
    const bucket = f.importance + f.confidence

    if (!acc[key]) acc[key] = { low: 0, mid: 0, high: 0 }

    if (bucket >= 18 && bucket < 19) acc[key].low++
    else if (bucket >= 19 && bucket < 20) acc[key].mid++
    else if (bucket >= 20) acc[key].high++

    return acc
}, {} as Record<string, { low: number; mid: number; high: number }>)

const chartData = Object.entries(grouped).map(([type, values]) => ({
    type,
    low: values.low,
    mid: values.mid,
    high: values.high,
}))

const chartConfig = {
    low: { label: "Low", color: "var(--chart-1)" },
    mid: { label: "Medium", color: "var(--chart-2)" },
    high: { label: "High", color: "var(--chart-3)" },
} as const

export function HangarFindingsSection() {

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {/* Slide preview mockup */}
            <PdfPreviewCard url="/test_pdf.pdf" aspectRatio="16/9" />


            {/* Findings chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Deck Inspection</CardTitle>
                    <CardDescription>
                        Your slides have been scanned. We found{" "}
                        <span className="font-semibold text-primary underline">17 areas</span>{" "}
                        that need your attention before takeoff.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <BarChart data={chartData} barCategoryGap={32}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="type"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar
                                dataKey="low"
                                stackId="a"
                                fill="var(--color-low)"
                                radius={[0, 0, 0, 0]}
                                isAnimationActive={true}
                            />
                            <Bar
                                dataKey="mid"
                                stackId="a"
                                fill="var(--color-mid)"
                                radius={[0, 0, 0, 0]}
                                isAnimationActive={true}
                            />
                            <Bar
                                dataKey="high"
                                stackId="a"
                                fill="var(--color-high)"
                                radius={[0, 0, 0, 0]}
                                isAnimationActive={true}
                            />

                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
