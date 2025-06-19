'use client'

import { useEffect, useState } from "react"
import { PresentationCard } from "@/components/cockpit/presentation-card"
import { getPresentationsWithTrainings } from "@/lib/api/presentation"
import { Presentation } from "@/types/presentation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { StatCard } from "@/components/ui/stats-card"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"


export default function DashboardPage() {
    const [presentations, setPresentations] = useState<Presentation[]>([])
    const { user } = useCurrentUser()
    const [loading, setLoading] = useState(true)
    const [avgScore, setAvgScore] = useState<string>("–")

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPresentationsWithTrainings()
                setPresentations(data)

                // calculate average score
                const allTrainings = data.flatMap((p) => p.trainings)
                const totalScore = allTrainings.reduce((sum, t) => sum + t.total_score, 0)
                const average = allTrainings.length > 0
                    ? (totalScore / allTrainings.length).toFixed(1)
                    : "–"
                setAvgScore(average)
            } catch (err) {
                console.error("Failed to load presentations:", err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])



    return (
        <main className="p-6">
            <h1 className="text-4xl font-bold mb-4">🛬 Welcome aboard, Captain {user?.username}!</h1>
            <p className="text-sm text-muted-foreground mb-8">
                Your last missions are ready for take-off.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 2-full">

            </div>

            {loading ? (
                <p className="text-sm text-muted-foreground">Loading presentations…</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Presentations"
                        value={presentations.length.toString()}
                        trend="+1"
                        trendType="up"
                        subtitle="New mission logged this week"
                        description="All current and archived flights onboard"
                    />

                    <StatCard
                        title="Trainings"
                        value={presentations.reduce((acc, p) => acc + p.trainings.length, 0).toString()}
                        trend="-8%"
                        trendType="down"
                        subtitle="Flight simulations slowing down"
                        description="Training runs across all decks"
                    />

                    <StatCard
                        title="Avg. Training Score"
                        value={avgScore + "%"}
                        trend="+3.2%"
                        trendType="up"
                        subtitle="Trajectory improving"
                        description="Scoring based on past 30 days"
                    />

                    {presentations.map((p) => (
                        <PresentationCard
                            key={p.id}
                            name={p.name}
                            tags={p.tags}
                            trainings={p.trainings}
                            onBoard={() => {
                                window.location.href = `/a/hangar/${p.id}`
                            }}
                        />
                    ))}
                </div>
            )}
        </main>
    )
}
