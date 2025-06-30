"use client"

import * as React from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Timer, User, HelpCircle, CheckCircle2, Loader2, Plus } from "lucide-react"
import { defineStepper } from "@/components/ui/stepper"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { createTraining } from "@/lib/api/trainings"
import { VisibilityMode, DifficultyLevel } from "@/types/presentation"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

type Props = {
    presentationId: string,
    tId: string,
    setTid: (id: string) => void
}

const { Stepper } = defineStepper(
    { id: "duration", title: "Timer Settings", icon: <Timer className="w-4 h-4" /> },
    { id: "visibility", title: "Audience Preferences", icon: <User className="w-4 h-4" /> },
    { id: "difficulty", title: "Question Difficulty", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "done", title: "Summary", icon: <CheckCircle2 className="w-4 h-4" /> }
)

export function TrainingSetupDialog({ presentationId, tId, setTid }: Props) {
    const [open, setOpen] = React.useState(false)
    const [duration, setDuration] = React.useState(600)
    const [visibility, setVis] = React.useState<VisibilityMode>("solo")
    const [difficulty, setDiff] = React.useState<DifficultyLevel>("easy")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const router = useRouter()

    const submit = async (goTo: (id: any) => void) => {
        setLoading(true)
        setError(null)
        try {
            const r = await createTraining({
                presentation_id: presentationId,
                duration_seconds: duration,
                visibility_mode: visibility,
                difficulty,
            })
            setTid(r.id)
            goTo("done")
        } catch (e) {
            console.error(e)
            setError("Something went wrong, please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-1 w-4 h-4" />
                    Start Training
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[100vw] sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold">Prepare Your Training Flight</DialogTitle>
                </DialogHeader>

                <Stepper.Provider variant="horizontal">
                    {({ methods }) => (
                        <>
                            <Stepper.Navigation className="mb-6 flex flex-wrap gap-2">
                                {methods.all.map((s) => (
                                    <Stepper.Step
                                        key={s.id}
                                        of={s.id}
                                        icon={s.icon}
                                        onClick={() => methods.goTo(s.id)}
                                        className={`rounded-xl transition-colors p-2 ${
                                            methods.current.id === s.id ? "ring-2 ring-primary" : "hover:bg-muted"
                                        }`}
                                    >
                                        <Stepper.Title>{s.title}</Stepper.Title>
                                    </Stepper.Step>
                                ))}
                            </Stepper.Navigation>

                            <motion.div
                                key={methods.current.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {methods.switch({
                                    duration: () => (
                                        <Card className="p-6 space-y-4">
                                            <h2 className="text-4xl font-extrabold text-primary">Step 1: Timer Settings</h2>
                                            <h3 className="text-lg font-semibold text-primary">
                                                <span className="inline-flex items-center gap-2">
                                                    <Timer className="w-6 h-6 text-primary" />
                                                    Every great flight needs a schedule.
                                                </span>
                                            </h3>
                                            <p className="text-muted-foreground">
                                                Let us know how long your presentation should last and we'll set the timer to help you achieve the perfect landing.
                                            </p>
                                            <Slider
                                                min={1}
                                                max={30}
                                                step={1}
                                                value={[duration / 60]}
                                                onValueChange={(v) => setDuration(v[0] * 60)}
                                            />
                                            <p className="text-sm text-muted-foreground">{Math.round(duration / 60)} minutes</p>
                                        </Card>
                                    ),
                                    visibility: () => (
                                        <Card className="p-6 space-y-4">
                                            <h2 className="text-4xl font-extrabold text-primary">Audience Preferences</h2>
                                            <h3 className="text-lg font-semibold text-primary">
                                                <span className="inline-flex items-center gap-2">
                                                    <User className="w-6 h-6 text-primary" />
                                                    Who’s on board for your test flight?
                                                </span>
                                            </h3>
                                            <p className="text-muted-foreground">
                                                Simulate presenting alone or invite real people to join your test flight as a live audience.
                                            </p>
                                            <ToggleGroup
                                                type="single"
                                                value={visibility}
                                                onValueChange={(v) => setVis(v as VisibilityMode)}
                                                className="w-full"
                                            >
                                                <ToggleGroupItem value="solo" className="flex-1">Solo</ToggleGroupItem>
                                                <ToggleGroupItem value="private" className="flex-1">Private</ToggleGroupItem>
                                            </ToggleGroup>
                                        </Card>
                                    ),
                                    difficulty: () => (
                                        <Card className="p-6 space-y-4">
                                            <h2 className="text-4xl font-extrabold text-primary">Step 3: Question Difficulty</h2>
                                            <h3 className="text-lg font-semibold text-primary">
                                                <span className="inline-flex items-center gap-2">
                                                    <HelpCircle className="w-6 h-6 text-primary" />
                                                    Turbulence ahead? You decide.
                                                </span>
                                            </h3>
                                            <p className="text-muted-foreground">
                                                Select how tough the follow-up questions should be — from a smooth cruise to a challenging storm.
                                            </p>
                                            <ToggleGroup
                                                type="single"
                                                value={difficulty}
                                                onValueChange={(v) => setDiff(v as DifficultyLevel)}
                                                className="w-full"
                                            >
                                                <ToggleGroupItem value="easy" className="flex-1">Easy</ToggleGroupItem>
                                                <ToggleGroupItem value="medium" className="flex-1">Medium</ToggleGroupItem>
                                                <ToggleGroupItem value="hard" className="flex-1">Hard</ToggleGroupItem>
                                            </ToggleGroup>
                                        </Card>
                                    ),
                                    done: () => (
                                        <Card className="p-6 space-y-4">
                                            <h2 className="text-4xl font-extrabold text-primary">You're cleared for takeoff</h2>
                                            <h3 className="text-lg font-semibold text-primary">
                                                <span className="inline-flex items-center gap-2">
                                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                                    All systems ready for your training flight.
                                                </span>
                                            </h3>
                                            <ul className="space-y-1 text-sm">
                                                <li><strong>Duration:</strong> {Math.round(duration / 60)} min</li>
                                                <li><strong>Visibility:</strong> {visibility}</li>
                                                <li><strong>Difficulty:</strong> {difficulty}</li>
                                            </ul>
                                            {tId && (
                                                <Badge variant="success" className="mt-2 w-fit">
                                                    Training ID: {tId}
                                                </Badge>
                                            )}
                                        </Card>
                                    ),
                                })}
                            </motion.div>

                            <Stepper.Controls className="mt-6 flex justify-end space-x-2">
                                {!methods.isFirst && (
                                    <Button variant="secondary" onClick={methods.prev} disabled={loading}>
                                        Back
                                    </Button>
                                )}
                                {methods.current.id === "difficulty" ? (
                                    <Button
                                        onClick={() => submit(methods.goTo)}
                                        disabled={loading || !duration || !visibility || !difficulty}
                                    >
                                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Finish
                                    </Button>
                                ) : methods.current.id === "done" ? (
                                    <DialogClose asChild>
                                        <Button
                                            onClick={() => router.push(`/a/hangar/${presentationId}/training/${tId}`)}
                                            variant="default"
                                        >
                                            Train
                                        </Button>
                                    </DialogClose>
                                ) : (
                                    <Button
                                        onClick={methods.next}
                                        disabled={
                                            (methods.current.id === "duration" && !duration) ||
                                            (methods.current.id === "visibility" && !visibility)
                                        }
                                    >
                                        Next
                                    </Button>
                                )}
                            </Stepper.Controls>

                            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                        </>
                    )}
                </Stepper.Provider>
            </DialogContent>
        </Dialog>
    )
}
