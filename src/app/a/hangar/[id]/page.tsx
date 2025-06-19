'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    LineChart,
    CartesianGrid,
    Line,
    XAxis,
    YAxis,
    BarChart,
    Bar,
} from "recharts"
import { useEffect, useState } from "react"
import { StatCard } from "@/components/ui/stats-card"
import { BarChart3, FileText, Notebook, Plus, Eye } from "lucide-react"
import { getPresentation } from "@/lib/api/presentation"
import { useParams } from "next/navigation"
import { HangarFindingsSection } from "@/components/hangar/hangar-finding-section"
import { FancySeparator } from "@/components/ui/fancy-separator"
import { Presentation, Training } from "@/types/presentation"
import { TrainingCard } from "@/components/hangar/training-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HangarPage() {
    const { id } = useParams()
    const [presentation, setPresentation] = useState<Presentation>()

    useEffect(() => {
        const load = async () => {
            const data = await getPresentation(id as string)
            setPresentation(data)
        }
        load()
    }, [id])

    if (!presentation) {
        return <p className="text-muted-foreground text-sm">Fueling hangar systems...</p>
    }

    const avgScore = (
        presentation.trainings.reduce((sum: number, t: any) => sum + t.total_score, 0) /
        presentation.trainings.length
    ).toFixed(1)

    const radarData = [
        //@ts-ignore
        { aspect: "Content", score: presentation.analytics?.content_score ?? 0 },
        //@ts-ignore
        { aspect: "Delivery", score: presentation.analytics?.delivery_score ?? 0 },
        //@ts-ignore
        { aspect: "Eye Contact", score: presentation.analytics?.engagement_score ?? 0 },
    ]

    const radarConfig = {
        score: { label: "Score", color: "var(--chart-1)" },
    } as const

    const lineChartData = presentation.trainings.map((t: any) => ({
        date: new Date(t.date).toLocaleDateString(),
        score: t.total_score,
    }))

    const lineConfig = {
        score: { label: "Score", color: "var(--chart-1)" },
    } as const

    return (
        <main className="p-6 space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg text-muted-foreground">Flight Deck → Hangar</h1>
                    <h2 className="text-3xl font-bold">{presentation.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {presentation.tags.map((tag: string) => (
                            <Badge key={tag}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
                <Button>
                    <Plus />
                    Start Training
                </Button>
            </div>

            <section>
                <FancySeparator label="Flight Dashboard" icon={<BarChart3 className="w-4 h-4" />} />



                <div className="flex flex-wrap gap-6">
                    <Card className="w-full lg:w-[48%]">
                        <CardHeader className="items-center pb-4">
                            <CardTitle>Training Focus</CardTitle>
                            <CardDescription>Content vs. Delivery vs. Eye Contact</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[220px] flex items-center justify-center">
                            <ChartContainer config={radarConfig} className="w-full h-full">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <PolarAngleAxis dataKey="aspect" />
                                    <PolarGrid />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar dataKey="score" fill="var(--color-score)" fillOpacity={0.6} />
                                </RadarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <div className="flex-1 flex flex-col justify-between gap-4 min-w-[200px]">
                        <StatCard
                            title="Trainings"
                            value={presentation.trainings.length.toString()}
                            trend="+2"
                            trendType="up"
                            subtitle="Sessions completed"
                            description="All past training flights"
                        />
                        <StatCard
                            title="Avg. Score"
                            value={`${avgScore}%`}
                            trend="+1.2%"
                            trendType="up"
                            subtitle="30-day trend"
                            description="Overall performance level"
                        />
                    </div>
                </div>

                <Card className="w-full mt-6">
                    <CardHeader>
                        <CardTitle>Score Over Time</CardTitle>
                        <CardDescription>Tracking your total training scores</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        <ChartContainer config={lineConfig} className="h-full w-full">
                            <LineChart data={lineChartData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis domain={[0, 100]} />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Line
                                    dataKey="score"
                                    type="natural"
                                    stroke="var(--color-score)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </section>
            <section>
                <FancySeparator label="Slide Intelligence Module" icon={<FileText className="w-4 h-4" />} />
                <div className="flex justify-end w-full">
                    <Button>
                        <Eye />
                        Inspect Deck
                    </Button>

                </div>
                <HangarFindingsSection />
            </section>
            <section>
                <FancySeparator label="Training Logbook" icon={<Notebook className="w-4 h-4" />} />


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {presentation.trainings.map((training: Training, index) => (
                        <TrainingCard key={index} onBoard={() => console.log('test')} training={training} />
                    ))}
                </div>
            </section>
        </main>
    )
}
