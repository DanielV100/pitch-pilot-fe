'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle, TicketDivider } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plane, PlaneTakeoff, PlaneLanding } from "lucide-react"
import { Training } from "@/types/presentation"
import { Badge } from "../ui/badge"
import { ProgressFlight } from "../ui/progress-flight"
import { PdfPreviewCard } from "../ui/pdf-preview-card"
import { useEffect, useState } from "react"


type PresentationCardProps = {
    name: string
    tags: string[]
    trainings: Training[]
    onBoard?: () => void
    fileUrl: string
}

export function PresentationCard({ name, tags, trainings, onBoard, fileUrl }: PresentationCardProps) {
    const lastSession = trainings.at(-1)
    const avgScore =
        trainings.length > 0
            ? Math.round(trainings.reduce((sum, t) => sum + t.total_score, 0) / trainings.length)
            : null

    const travelProgress = Math.min(avgScore ?? 0, 100)



    return (
        <Card className="relative rounded-[24px] border border-gray-200 shadow-none! overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">{name}</CardTitle>
                <div className="text-xs text-muted-foreground mb-2">
                    Last session: {lastSession ? new Date(lastSession.date).toLocaleDateString() : "–"}
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                    {tags.map((tag) => (
                        <Badge className="text-xs" key={tag} >
                            {tag}
                        </Badge>

                    ))}
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <ProgressFlight score={travelProgress} trainings={trainings.length} />

                <div className="aspect-video bg-blue-100 rounded-xl mb-6">
                    <PdfPreviewCard url={fileUrl} aspectRatio="16/9" />
                </div>


            </CardContent>
            <TicketDivider />
            <CardFooter>
                <Button className="w-full font-semibold text-white bg-[#1F2A37] hover:bg-[#111827]" onClick={onBoard}>
                    Board now
                </Button>
            </CardFooter>

        </Card>
    )
}
