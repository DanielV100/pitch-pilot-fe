import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, Info } from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceArea,
    ResponsiveContainer,
} from "recharts"

interface Props {
    wpm: number
    volumeConfig: any
    volumeChartData: any[]
    minRms: number
    maxRms: number
}

export function AudioLevelCard({ wpm, volumeConfig, volumeChartData, minRms, maxRms }: Props) {
    const maxY = Math.max(...volumeChartData.map(v => v.rms), maxRms + 0.05, 0.25)
    return (
        <Card className="w-full border-2 border-yellow-200 bg-gradient-to-br from-yellow-50/80 to-white shadow-yellow-100 shadow-xl rounded-2xl">
            <CardHeader className="pb-2 flex flex-row items-center gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <div>
                    <CardTitle className="text-lg font-bold tracking-tight text-yellow-800">Audio Level</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md">
                            Turbulence Detected
                        </span>
                    </CardDescription>
                </div>
                <div className="flex-1" />
                <span className="bg-gray-50 text-gray-700 px-4 py-1 rounded-xl text-xs font-semibold ml-auto shadow-inner border border-gray-200">
                    WPM: {wpm}
                </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 py-4">

                <div className="w-full h-40 md:h-48 rounded-xl bg-white border border-gray-100 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                        <ChartContainer config={volumeConfig} className="w-full h-full">
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
                                    domain={[0, maxY]}
                                    tick={{ fontSize: 12 }}
                                    width={40}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ value: "RMS", angle: -90, position: "insideLeft", fontSize: 12 }}
                                />
                                {/* Highlight background bands */}
                                <ReferenceArea
                                    y1={0}
                                    y2={minRms}
                                    fill="#fde68a"
                                    fillOpacity={0.7}
                                    strokeOpacity={0}
                                    ifOverflow="extendDomain"
                                />
                                <ReferenceArea
                                    y1={minRms}
                                    y2={maxRms}
                                    fill="#bbf7d0"
                                    fillOpacity={0.7}
                                    strokeOpacity={0}
                                    ifOverflow="extendDomain"
                                />
                                <ReferenceArea
                                    y1={maxRms}
                                    y2={maxY}
                                    fill="#fca5a5"
                                    fillOpacity={0.6}
                                    strokeOpacity={0}
                                    ifOverflow="extendDomain"
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                                    formatter={(v: number) => v.toFixed(3)}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rms"
                                    stroke="#eab308"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200 inline-block" /> <span className="text-yellow-700">Gelb = zu leise</span></span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> <span className="text-green-700">Grün = gut</span></span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> <span className="text-red-700">Rot = zu laut</span></span>
                </div>
                <div className="flex gap-2 mt-1 text-xs text-yellow-700 items-center">
                    <Info className="w-4 h-4" /> <span>Tips: Aim for a stable, moderate volume. Avoid whispering or shouting.</span>
                </div>
            </CardContent>
        </Card>
    )
}
