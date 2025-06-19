'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle, TicketDivider } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plane, PlaneTakeoff, PlaneLanding } from "lucide-react"
import { Training } from "@/types/presentation"
import { Badge } from "../ui/badge"
import { ProgressFlight } from "../ui/progress-flight"
import { PdfPreviewCard } from "../ui/pdf-preview-card"


type PresentationCardProps = {
    onBoard?: () => void
    training: Training
}

export function TrainingCard({ training, onBoard }: PresentationCardProps) {


    return (
        <Card className="relative rounded-[24px] border border-gray-200 shadow-none! overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">Flight-No.: {training.id.substring(0, 4).toUpperCase()}</CardTitle>
                <div className="text-xs text-muted-foreground mb-2">
                    Date: {training.date}
                </div>

            </CardHeader>

            <CardContent className="pt-0">
                <ProgressFlight score={training.total_score} trainings={1} />
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
