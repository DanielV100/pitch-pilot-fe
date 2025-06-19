'use client'

import { cn } from "@/lib/utils"
import { Paperclip } from "lucide-react"

interface FancySeparatorProps {
    label?: string
    icon?: React.ReactNode
    className?: string
}

export function FancySeparator({
    label = "Section Divider",
    icon = <Paperclip className="w-4 h-4 text-muted-foreground" />,
    className,
}: FancySeparatorProps) {
    return (
        <div className={cn("relative my-12 flex items-center justify-center", className)}>
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-muted-foreground/30" />
            </div>
            <span className="relative z-10 bg-background px-4 flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                {icon}
                {label}
            </span>
        </div>
    )
}
