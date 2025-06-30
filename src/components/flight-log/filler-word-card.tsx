import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, Info } from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

export function FillerWordsCard({ fillerChartData, fillerConfig }) {
    const totalFillerUses = fillerChartData.reduce((a, b) => a + b.count, 0)

    if (!fillerChartData.length) return null

    return (
        <Card className="w-full border-2 border-red-200 bg-gradient-to-br from-red-50/80 to-white shadow-red-100 shadow-xl rounded-2xl">
            <CardHeader className="pb-2 flex flex-row items-center gap-4">
                <Zap className="w-6 h-6 text-red-500" />
                <div>
                    <CardTitle className="text-lg font-bold tracking-tight text-red-800">Filler Words</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                            Mayday – Critical Issue
                        </span>
                    </CardDescription>
                </div>
                <div className="flex-1" />
                <span className="bg-gray-50 text-gray-700 px-4 py-1 rounded-xl text-xs font-semibold ml-auto shadow-inner border border-gray-200">
                    Total: {totalFillerUses}
                </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 py-4">
                <div className="flex items-end gap-2 pl-1">
                    <span className="text-3xl font-extrabold text-red-700">{totalFillerUses}</span>
                    <span className="text-xs text-muted-foreground mb-1">uses detected</span>
                </div>
                {/* Bar Chart */}
                <div className="w-full h-44 md:h-48 rounded-xl bg-white border border-gray-100 shadow-inner px-2 pt-2 pb-0">
                    <ChartContainer className="w-full h-full" config={fillerConfig}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={fillerChartData}>
                                <XAxis
                                    dataKey="word"
                                    fontSize={13}
                                    axisLine={false}
                                    tickLine={false}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis
                                    fontSize={12}
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    width={36}
                                />
                                <Tooltip
                                    cursor={{ fill: "#fca5a5", opacity: 0.1 }}
                                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                                />
                                <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div className="flex gap-2 text-xs text-red-600 items-center mt-2">
                    <Info className="w-4 h-4" />
                    <span className="font-semibold">Tips:</span> Reduce filler words to improve clarity!
                </div>
            </CardContent>
        </Card>
    )
}
