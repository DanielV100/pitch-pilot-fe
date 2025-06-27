import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, CartesianGrid, Line, ReferenceArea } from "recharts"
import { AlertTriangle, Info, Zap } from "lucide-react"

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
            <Card className="border-green-300 shadow-green-100 w-full">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ProgressCircle percent={eyePercent} size={72} strokeWidth={10} color="#22c55e" />
                        <div>
                            <div className="text-lg font-semibold">Eye tracking</div>
                            <div className="text-xs text-green-700 font-bold">Minor Deviation</div>
                            <div className="text-xs text-muted-foreground">Severity: 3/10</div>
                            <div className="text-xs mt-2 font-mono">{eyePercent}%</div>
                            <div className="mt-2 text-sm text-muted-foreground">Keep your eyes engaged with the audience.</div>
                            <div className="flex gap-2 mt-1 text-xs text-green-600 items-center">
                                <Info className="w-4 h-4" /> Tips: Keep your gaze moving, don't focus too long!
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="rounded-xl bg-blue-50 text-blue-800 font-bold px-5 py-2 shadow text-lg">
                            Total score {audio_scores.total_score}/100
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Audio Level */}
            <Card className="border-yellow-300 shadow-yellow-100 w-full">
                <CardContent className="p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" /> Audio Level
                        <span className="text-xs text-yellow-700 ml-2 font-bold">Turbulence Detected</span>
                        <span className="ml-auto rounded-xl bg-gray-50 text-gray-700 px-4 py-1 text-xs font-medium">WPM: {wpm}</span>
                    </div>
                    <div className="text-xs text-yellow-700 font-bold">Severity: 7/10</div>
                    {/* Volume Line Chart */}
                    <div className="w-full" >
                        <ResponsiveContainer width="100%" height="100%">
                            <ChartContainer config={volumeConfig}>
                                <LineChart data={volumeChartData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="time"
                                        type="number"
                                        domain={['auto', 'auto']}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={t => t.toFixed(1)}
                                        axisLine={false}
                                        tickLine={false}
                                        minTickGap={16}
                                        label={{ value: "Time (s)", position: "insideBottom", offset: -3, fontSize: 11 }}
                                    />
                                    <YAxis
                                        dataKey="rms"
                                        type="number"
                                        domain={[0, Math.max(...volumeChartData.map(v => v.rms), 0.25)]}
                                        tick={{ fontSize: 12 }}
                                        width={40}
                                        axisLine={false}
                                        tickLine={false}
                                        label={{ value: "RMS", angle: -90, position: "insideLeft" }}
                                    />
                                    {/* Highlight background bands */}
                                    <ReferenceArea
                                        y1={0}
                                        y2={minRms}
                                        fill="#fde68a"   // yellow: too quiet
                                        strokeOpacity={0}
                                        ifOverflow="extendDomain"
                                    />
                                    <ReferenceArea
                                        y1={minRms}
                                        y2={maxRms}
                                        fill="#bbf7d0"   // green: good speaking range
                                        strokeOpacity={0}
                                        ifOverflow="extendDomain"
                                    />
                                    <ReferenceArea
                                        y1={maxRms}
                                        y2={Math.max(...volumeChartData.map(v => v.rms), maxRms + 0.05)}
                                        fill="#fca5a5"   // red: too loud
                                        strokeOpacity={0}
                                        ifOverflow="extendDomain"
                                    />
                                    <Tooltip formatter={(v: number) => v.toFixed(3)} />
                                    <Line
                                        type="monotone"
                                        dataKey="rms"
                                        stroke="#222"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ChartContainer>

                        </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        <span className="text-yellow-600">Gelb = zu leise,</span>
                        <span className="text-green-600"> Grün = gut,</span>
                        <span className="text-red-600"> Rot = zu laut</span>
                    </div>
                </CardContent>
            </Card>

            {/* Filler Words */}
            {fillerChartData.length > 0 && (
                <Card className="border-red-300 shadow-red-100 w-full">
                    <CardContent className="p-6 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Zap className="w-5 h-5 text-red-500" /> Filler words
                            <span className="ml-2 text-xs font-bold text-red-700">Mayday – Critical Issue</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-red-700">{fillerChartData.reduce((a, b) => a + b.count, 0)}</span>
                            <span className="text-xs text-muted-foreground">uses</span>
                        </div>
                        {/* Filler Bar Chart */}
                        <div className="w-full" >
                            <ChartContainer className="max-h-50 w-full" config={fillerConfig}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={fillerChartData}>
                                        <XAxis dataKey="word" fontSize={12} axisLine={false} tickLine={false} />
                                        <YAxis fontSize={12} allowDecimals={false} axisLine={false} tickLine={false} width={36} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                        <div className="flex gap-2 mt-1 text-xs text-red-600 items-center">
                            <Info className="w-4 h-4" /> Tips: Reduce filler words to improve clarity!
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
