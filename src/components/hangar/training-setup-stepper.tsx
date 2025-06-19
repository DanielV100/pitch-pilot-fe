/* ---------------------------------------------------------
   FILE: components/hangar/training-setup-dialog.tsx
   ------------------------------------------------------ */
"use client"

import * as React from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Eye,
    MonitorSmartphone,
    Timer,
    ShieldCheck,
    Gauge,
    CheckCircle2,
    Loader2,
    Plus,
} from "lucide-react"
import { defineStepper } from "@/components/ui/stepper"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { FloatingLabelInput } from "@/components/ui/input"
import { createTraining } from "@/lib/api/trainings"
import { VisibilityMode, DifficultyLevel } from "@/types/presentation"


type Props = {
    presentationId: string
}

/* ──────────────────────────────
   1.  Stepper definition
   ──────────────────────────────*/
const { Stepper } = defineStepper(
    { id: "duration", title: "Duration", icon: <Timer className="w-4 h-4" /> },
    { id: "visibility", title: "Visibility", icon: <Eye className="w-4 h-4" /> },
    { id: "calibration", title: "Calibration", icon: <MonitorSmartphone className="w-4 h-4" /> },
    { id: "difficulty", title: "Difficulty", icon: <Gauge className="w-4 h-4" /> },
    { id: "done", title: "Summary", icon: <CheckCircle2 className="w-4 h-4" /> }
)

/* ──────────────────────────────
   2.  Main component
   ──────────────────────────────*/
export function TrainingSetupDialog({ presentationId }: Props) {
    /* Local state */
    const [open, setOpen] = React.useState(false)
    const [duration, setDuration] = React.useState(600)          // seconds, default 10 min
    const [visibility, setVis] = React.useState<VisibilityMode>("solo")
    const [difficulty, setDiff] = React.useState<DifficultyLevel>("easy")
    const [calib, setCalib] = React.useState<Record<string, unknown> | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [resultId, setResultId] = React.useState<string | null>(null)

    /* Submit to API */
    const submit = async (goTo: (id: any) => void) => {
        setLoading(true)
        setError(null)
        try {
            const r = await createTraining({
                presentation_id: presentationId,
                duration_seconds: duration,
                visibility_mode: visibility,
                difficulty,
                eye_calibration: calib,
            })
            setResultId(r.id)
            goTo("done")
        } catch (e) {
            console.error(e)
            setError("Something went wrong, please try again.")
        } finally {
            setLoading(false)
        }
    }

    /* ────────────────────────── UI ──────────────────────────*/
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* The button that lives on HangarPage */}
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-1 w-4 h-4" />
                    Start Training
                </Button>
            </DialogTrigger>

            <DialogContent
                className="w-[100vw] sm:max-w-4xl"
            >

                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Prepare Your Training Flight
                    </DialogTitle>
                </DialogHeader>

                {/* ==========  STEPPER  ========== */}
                <Stepper.Provider variant="horizontal">
                    {({ methods }) => (
                        <>
                            {/* Navigation dots / labels */}
                            <Stepper.Navigation className="mb-6">
                                {methods.all.map((s) => (
                                    <Stepper.Step
                                        key={s.id}
                                        of={s.id}
                                        icon={s.icon}
                                        onClick={() => methods.goTo(s.id)}
                                    >
                                        <Stepper.Title>{s.title}</Stepper.Title>
                                    </Stepper.Step>
                                ))}
                            </Stepper.Navigation>

                            {/* Panels -------------------------------------------------- */}
                            {methods.switch({
                                /* --- Step 1: Duration ---------------------------- */
                                duration: () => (
                                    <Stepper.Panel className="space-y-6">
                                        <h3 className="font-semibold text-lg">1 · Select Duration</h3>
                                        <div>
                                            <Slider
                                                min={1}
                                                max={30}
                                                step={1}
                                                value={[duration / 60]}
                                                onValueChange={(v) => setDuration(v[0] * 60)}
                                            />
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {Math.round(duration / 60)} minutes
                                            </p>
                                        </div>
                                    </Stepper.Panel>
                                ),

                                /* --- Step 2: Visibility -------------------------- */
                                visibility: () => (
                                    <Stepper.Panel className="space-y-6">
                                        <h3 className="font-semibold text-lg">2 · Audience Visibility</h3>
                                        <ToggleGroup
                                            type="single"
                                            value={visibility}
                                            onValueChange={(v) => setVis(v as VisibilityMode)}
                                            className="w-full"
                                        >
                                            <ToggleGroupItem value="solo" className="flex-1">
                                                Solo
                                            </ToggleGroupItem>
                                            <ToggleGroupItem value="private" className="flex-1">
                                                Private
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </Stepper.Panel>
                                ),

                                /* --- Step 3: Calibration ------------------------- */
                                calibration: () => (
                                    <Stepper.Panel className="space-y-6">
                                        <h3 className="font-semibold text-lg">3 · Webcam Calibration</h3>
                                        {calib ? (
                                            <Badge>Calibration ✓</Badge>
                                        ) : (
                                            <>
                                                {/* You’d replace this block with the real calibration component */}
                                                <div className="border rounded-md p-4 text-center">
                                                    <p className="text-muted-foreground mb-4">
                                                        Click the button below and look at the dots to calibrate eye tracking.
                                                    </p>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() =>
                                                            setTimeout(() => {
                                                                /* simulate data */
                                                                setCalib({ points: [{ x: 0.2, y: 0.3 }] })
                                                            }, 1200)
                                                        }
                                                    >
                                                        Calibrate Now
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Stepper.Panel>
                                ),

                                /* --- Step 4: Difficulty -------------------------- */
                                difficulty: () => (
                                    <Stepper.Panel className="space-y-6">
                                        <h3 className="font-semibold text-lg">4 · Question Difficulty</h3>
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
                                    </Stepper.Panel>
                                ),

                                /* --- Step 5: Summary / Done ---------------------- */
                                done: () => (
                                    <Stepper.Panel className="space-y-4">
                                        <h3 className="font-semibold text-lg">✅ All Set!</h3>

                                        <ul className="space-y-2 text-sm">
                                            <li>
                                                <strong>Duration:</strong> {Math.round(duration / 60)} min
                                            </li>
                                            <li>
                                                <strong>Visibility:</strong> {visibility}
                                            </li>
                                            <li>
                                                <strong>Difficulty:</strong> {difficulty}
                                            </li>
                                            <li>
                                                <strong>Calibration:</strong>{" "}
                                                {calib ? "Completed" : "Not completed"}
                                            </li>
                                        </ul>

                                        {resultId && (
                                            <p className="text-green-600 text-sm">
                                                Training created successfully — ID {resultId}
                                            </p>
                                        )}
                                    </Stepper.Panel>
                                ),
                            })}

                            {/* Controls ------------------------------------------------ */}
                            <Stepper.Controls className="mt-6">
                                {!methods.isFirst && (
                                    <Button
                                        variant="secondary"
                                        onClick={methods.prev}
                                        disabled={loading}
                                    >
                                        Back
                                    </Button>
                                )}

                                {methods.current.id === "difficulty" ? (
                                    /* Submit on finishing diff step → goTo("done") inside submit() */
                                    <Button
                                        onClick={() => submit(methods.goTo)}
                                        disabled={
                                            loading ||
                                            !duration ||
                                            !visibility ||
                                            !difficulty ||
                                            !calib
                                        }
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finish"}
                                    </Button>
                                ) : methods.current.id === "done" ? (
                                    <DialogClose asChild>
                                        <Button variant="default">Close</Button>
                                    </DialogClose>
                                ) : (
                                    <Button
                                        onClick={methods.next}
                                        disabled={
                                            (methods.current.id === "duration" && !duration) ||
                                            (methods.current.id === "visibility" && !visibility) ||
                                            (methods.current.id === "calibration" && !calib)
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
