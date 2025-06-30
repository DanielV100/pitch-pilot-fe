"use client"

import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Eye } from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"
import {
    RadialBarChart,
    RadialBar,
    PolarRadiusAxis,
    Label,
    PolarGrid,
} from "recharts"

interface EyeTrackingCardProps {
    eyePercent: number
    totalScore: number
}

const chartConfig = {
    gaze: { label: "Eye Contact", color: "#22c55e" },
}

function getEyeFeedback(eyePercent: number) {
    if (eyePercent >= 85) {
        return {
            label: "Excellent 👀",
            badge: (
                <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-md">
                    Perfect Gaze!
                </span>
            ),
            message: "You maintained great eye contact. The audience feels engaged and connected!",
            tip: "Just keep it up – your gaze is on point!",
            color: "text-green-700",
            bg: "from-green-50/80 to-white",
            border: "border-green-300",
            shadow: "shadow-green-100"
        }
    }
    if (eyePercent >= 65) {
        return {
            label: "Good",
            badge: (
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                    Minor Deviation
                </span>
            ),
            message: "Your eye contact was mostly good. Occasional drifting, but overall engaging.",
            tip: "Try to keep scanning the audience evenly for an even stronger connection.",
            color: "text-green-700",
            bg: "from-green-100/80 to-white",
            border: "border-green-300",
            shadow: "shadow-green-100"
        }
    }
    if (eyePercent >= 40) {
        return {
            label: "Needs Improvement",
            badge: (
                <span className="text-xs font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-md">
                    Noticeable Deviation
                </span>
            ),
            message: "You missed your audience’s eyes too often. Engagement suffered as a result.",
            tip: "Try to look up more, use mental reminders or scan the room between sentences.",
            color: "text-yellow-800",
            bg: "from-yellow-50/80 to-white",
            border: "border-yellow-300",
            shadow: "shadow-yellow-100"
        }
    }
    return {
        label: "Poor",
        badge: (
            <span className="text-xs font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-md">
                Low Eye Contact
            </span>
        ),
        message: "Your eye contact was too low. The audience likely felt disconnected.",
        tip: "Practice looking up and sweeping your gaze across the room. It gets easier with repetition.",
        color: "text-red-800",
        bg: "from-red-50/80 to-white",
        border: "border-red-300",
        shadow: "shadow-red-100"
    }
}

export function EyeTrackingCard({ eyePercent, totalScore }: EyeTrackingCardProps) {
    const feedback = getEyeFeedback(eyePercent)

    const data = [
        {
            name: "Gaze",
            gaze: eyePercent,
            fill: "url(#eye-gradient)",
        },
    ]

    return (
        <Card className={`border-2 bg-gradient-to-br ${feedback.bg} ${feedback.border} ${feedback.shadow} shadow-xl rounded-2xl w-full`}>
            <CardHeader className="pb-2 flex flex-row items-center gap-4">
                <Eye className={`w-6 h-6 ${feedback.color}`} />
                <div>
                    <CardTitle className={`text-lg font-bold tracking-tight ${feedback.color}`}>Eye Tracking</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                        {feedback.badge}
                    </CardDescription>
                </div>
                <div className="flex-1" />
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-8 py-6">
                <div className="w-[125px] h-[125px] flex-shrink-0">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <RadialBarChart
                            width={125}
                            height={125}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={80}
                            barSize={12}
                            data={data}
                            startAngle={90}
                            endAngle={-360 * (eyePercent / 100) + 90}
                        >
                            <defs>
                                <linearGradient id="eye-gradient" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#4ade80" />
                                    <stop offset="100%" stopColor="#22d3ee" />
                                </linearGradient>
                            </defs>
                            <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="none"
                                className="first:fill-muted last:fill-background"
                                polarRadius={[56, 48]}
                            />
                            <RadialBar
                                background
                                dataKey="gaze"
                                cornerRadius={24}
                            />
                            <PolarRadiusAxis
                                type="number"
                                domain={[0, 100]}
                                tick={false}
                                axisLine={false}
                            >
                                <Label
                                    position="center"
                                    content={({ viewBox }) => {
                                        const { cx, cy } = viewBox
                                        return (
                                            <>
                                                <text
                                                    x={cx}
                                                    y={cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-2xl font-extrabold fill-green-700"
                                                >
                                                    {eyePercent}%
                                                </text>
                                                <text
                                                    x={cx}
                                                    y={cy + 18}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-xs fill-gray-400"
                                                >
                                                    Gaze
                                                </text>
                                            </>
                                        )
                                    }}
                                />
                            </PolarRadiusAxis>
                        </RadialBarChart>
                    </ChartContainer>
                </div>
                <div className="flex flex-col justify-center items-start gap-2 w-full max-w-xs">
                    <div className={`text-sm mb-1 ${feedback.color}`}>
                        {feedback.message}
                    </div>
                    <div className={`flex gap-2 items-center ${feedback.color} text-xs font-semibold`}>
                        <Info className="w-4 h-4" />
                        Tips: {feedback.tip}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
