'use client'

import React, { useEffect, useState } from "react"
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import {
    ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts"
import { PdfPreviewCard } from "../ui/pdf-preview-card"
import { useParams, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { getFindingBars } from "@/lib/api/presentation"

export function HangarFindingsSection() {
    const { id: presentationId } = useParams()

    const [findings, setFindings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getFindingBars(presentationId as string)
                setFindings(data)
            } catch (err) {
                console.error("Failed to load findings", err)
            } finally {
                setLoading(false)
            }
        }
        if (presentationId) fetchData()
    }, [presentationId])

    const grouped = findings.reduce((acc: Record<string, { low: number; mid: number; high: number }>, f) => {
        const key = f.type
        const bucket = f.importance + f.confidence
        if (!acc[key]) acc[key] = { low: 0, mid: 0, high: 0 }
        if (bucket >= 18 && bucket < 19) acc[key].low++
        else if (bucket >= 19 && bucket < 20) acc[key].mid++
        else if (bucket >= 20) acc[key].high++
        return acc
    }, {})

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            <PdfPreviewCard url="/test_pdf.pdf" aspectRatio="16/9" />

            <Card>
                <CardHeader>
                    <CardTitle>Deck Inspection</CardTitle>
                    <CardDescription>
                        Your slides have been scanned. We found{" "}
                        <span className="font-semibold text-primary underline">
                            {loading ? "..." : findings.length}
                        </span>{" "}
                        areas that need your attention before takeoff.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-[240px] w-full rounded-md" />
                    ) : (
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
                                <Bar dataKey="low" stackId="a" fill="var(--color-low)" />
                                <Bar dataKey="mid" stackId="a" fill="var(--color-mid)" />
                                <Bar dataKey="high" stackId="a" fill="var(--color-high)" />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
