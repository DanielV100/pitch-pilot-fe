import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Presentation, CircleSlash, Plane } from "lucide-react"

interface StatCardProps {
    title: string
    value: string
    trend: string
    trendType?: "presentation" | "training" | "neutral"
    subtitle: string
    description: string
}

export const StatCard = ({
    title,
    value,
    trend,
    trendType = "neutral",
    subtitle,
    description,
}: StatCardProps) => {


    const TrendIcon =
        trendType === "presentation"
            ? Presentation
            : trendType === "training"
                ? Plane
                : CircleSlash

    return (
        <div className="rounded-xl border bg-background p-6 shadow-sm space-y-2 w-full">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{title}</span>
                <span className={`flex items-center gap-1`}>
                    <TrendIcon className="h-4 w-4" />

                </span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm font-medium text-foreground">{subtitle}</div>
        </div>
    )
}
