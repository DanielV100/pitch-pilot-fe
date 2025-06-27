'use client'

import { useEffect, useState } from "react"
import { PresentationCard } from "@/components/cockpit/presentation-card"
import { getPresentationsWithTrainings } from "@/lib/api/presentation"
import { Presentation } from "@/types/presentation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { StatCard } from "@/components/ui/stats-card"


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
                <div className="flex flex-col items-center justify-center">
                    <img
                        src="/loading/pp_animation.gif"
                        alt="Loading…"
                        className="size-full animate-spin-slow"
                        style={{ objectFit: "contain" }}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Presentations"
                        value={presentations.length.toString()}
                        trend="+1"
                        trendType="presentation"
                        description="New mission logged this week"
                        subtitle="Number of presentations in the hangar"
                    />

                    <StatCard
                        title="Trainings"
                        value={presentations.reduce((acc, p) => acc + p.trainings.length, 0).toString()}
                        trend="-8%"
                        trendType="training"
                        description="Flight simulations slowing down"
                        subtitle="Number of training flights completed"
                    />

                    <StatCard
                        title="Avg. Training Score"
                        value={avgScore + "%"}
                        trend="+3.2%"
                        trendType="neutral"
                        description="Trajectory improving"
                        subtitle="Average score across all training flights"
                    />

                    {presentations.map((p) => (
                        <PresentationCard
                            key={p.id}
                            name={p.name}
                            tags={p.tags}
                            trainings={p.trainings}
                            fileUrl={p.file_url!}
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
