import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, CartesianGrid, Line, ReferenceArea } from "recharts"
import { AlertTriangle, Info, Zap } from "lucide-react"
import { EyeTrackingCard } from "./eye-tracking-score"
import { AudioLevelCard } from "./audio-level"
import { FillerWordsCard } from "./filler-word-card"

function ProgressCircle({ percent, size = 64, strokeWidth = 8, color = "green" }) {
    const r = (size - strokeWidth) / 2
    const c = 2 * Math.PI * r
    const p = percent / 100
    return (
        <svg width={size} height={size}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={c}
                strokeDashoffset={c * (1 - p)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s" }}
            />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize={size / 3} className="font-bold fill-black">
                {percent}%
            </text>
            <text x="50%" y="70%" textAnchor="middle" fontSize={size / 6} className="fill-gray-500">Gaze</text>
        </svg>
    )
}

export function FlightLogPanel({ result }) {
    if (!result?.audio_scores) return null
    const { eye_tracking_total_score, audio_scores } = result
    const wpm = audio_scores.wpm
    const fillers = (audio_scores.fillers || []).filter((f) => f.count > 0)
    const volumeTimeline = audio_scores.volume_timeline || []

    const eyePercent = Math.round((eye_tracking_total_score ?? 0) * 100)
    const fillerChartData = fillers.map((f) => ({
        word: f.word,
        count: f.count,
    }))
    const minRms = 0.05;
    const maxRms = 0.2;

    const volumeChartData = volumeTimeline.map((v: any) => ({
        time: v.t,
        rms: v.rms
    }));

    // Configs for ChartContainer (required for useChart)
    const volumeConfig = {
        volume: { label: "Volume", color: "#eab308" }
    }
    const fillerConfig = {
        count: { label: "Filler uses", color: "#ef4444" }
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-full">
            {/* Eye tracking */}
            <EyeTrackingCard eyePercent={eyePercent} totalScore={92} />
            {/* Audio Level */}
            <AudioLevelCard
                wpm={wpm}
                volumeConfig={volumeConfig}
                volumeChartData={volumeChartData}
                minRms={minRms}
                maxRms={maxRms}
            />
            {/* Filler Words */}
            <FillerWordsCard fillerChartData={fillerChartData} fillerConfig={fillerConfig} />
        </div>
    )
}
