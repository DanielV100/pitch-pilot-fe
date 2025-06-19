'use client'

import { Plane, PlaneLanding, PlaneTakeoff, SendHorizonal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

type ProgressFlightProps = {
    score: number
    trainings: number
}

export function ProgressFlight({ score, trainings }: ProgressFlightProps) {
    const progress = Math.min(score, 100)
    const color = getColor(score)

    return (
        <div className="relative w-full my-4">



            <div className="flex items-center gap-2">
                <PlaneTakeoff className="text-gray-400 shrink-0" size={18} />
                <div className="relative flex-1 h-2">
                    <div
                        className={cn(
                            "absolute -top-12 text-xs whitespace-nowrap px-2 py-1 rounded-md border shadow-sm",
                            colorStyles[color].label,
                            "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent",
                            colorStyles[color].tail
                        )}
                        style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
                    >
                        {trainings}x · {score}%
                    </div>

                    <div className="absolute inset-0 rounded-full bg-[length:8px_2px] bg-[repeating-linear-gradient(to_right,theme(colors.gray.300)_0px,theme(colors.gray.300)_4px,transparent_4px,transparent_8px)]" />

                    <Progress
                        value={progress}
                        indicatorColor={colorStyles[color].indicatorColor}
                        className={cn(
                            "absolute top-0 left-0 h-2 rounded-full z-10",
                            colorStyles[color].bar
                        )}
                    />

                    <SendHorizonal
                        className={cn("absolute top-1/2 z-20 ms-2", colorStyles[color].planeColor)}
                        size={18}
                        style={{
                            left: `${progress}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                </div>

                <PlaneLanding className="text-gray-400 shrink-0" size={18} />
            </div>


        </div>
    )
}

type ColorKey = "green" | "yellow" | "red"

function getColor(score: number): ColorKey {
    if (score >= 75) return "green"
    if (score >= 40) return "yellow"
    return "red"
}

const colorStyles: Record<
    ColorKey,
    { label: string; tail: string; bar: string, indicatorColor: string, planeColor: string }
> = {
    green: {
        label: "bg-green-100 text-green-900 border-green-500",
        tail: "after:border-t-green-500",
        bar: "bg-transparent",
        indicatorColor: "bg-green-500",
        planeColor: "text-green-900",
    },
    yellow: {
        label: "bg-yellow-100 text-yellow-900 border-yellow-500",
        tail: "after:border-t-yellow-500",
        bar: "bg-transparent",
        indicatorColor: "bg-yellow-500",
        planeColor: "text-yellow-900",
    },

    red: {
        label: "bg-red-100 text-red-900 border-red-500",
        tail: "after:border-t-red-500",
        bar: "bg-transparent",
        indicatorColor: "bg-red-500",
        planeColor: "text-red-900",
    },
}
