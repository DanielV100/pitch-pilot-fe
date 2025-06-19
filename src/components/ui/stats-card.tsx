import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react"

interface StatCardProps {
    title: string
    value: string
    trend: string
    trendType?: "up" | "down" | "neutral"
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
    const trendColor =
        trendType === "up"
            ? "text-green-600"
            : trendType === "down"
                ? "text-red-600"
                : "text-muted-foreground"

    const TrendIcon =
        trendType === "up"
            ? ArrowUpRight
            : trendType === "down"
                ? ArrowDownRight
                : ArrowRightLeft

    return (
        <div className="rounded-xl border bg-background p-6 shadow-sm space-y-2 w-full">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{title}</span>
                <span className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />

                </span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm font-medium text-foreground">{subtitle}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
        </div>
    )
}
