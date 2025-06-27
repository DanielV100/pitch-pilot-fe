"use client"

import { FilePenLine, Info, Upload, Loader2 } from "lucide-react"
import * as React from "react"
import { defineStepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { FloatingLabelInput } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { InputTags } from "@/components/ui/input-tags"
import { PresentationUpload } from "@/components/mission-control/file-upload"
import { createPresentation } from "@/lib/api/presentation"

const { Stepper } = defineStepper(
    {
        id: "name",
        title: "Project Name",
        icon: <FilePenLine className="w-4 h-4" />,
    },
    {
        id: "background",
        title: "Mission Briefing",
        icon: <Info className="w-4 h-4" />,
    },
    {
        id: "upload",
        title: "Upload Slides",
        icon: <Upload className="w-4 h-4" />,
    },
    {
        id: "done",
        title: "Completed",
        icon: <Upload className="w-4 h-4" />,
    }
)

export default function PresentationSetupPage() {
    const [projectName, setProjectName] = React.useState("")
    const [projectDescription, setProjectDescription] = React.useState("")
    const [tags, setTags] = React.useState<string[]>([])
    const [pdfFile, setPdfFile] = React.useState<File[]>([])
    const [result, setResult] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (goTo: (stepId: "name" | "background" | "upload" | "done") => void) => {
        setLoading(true)
        setError(null)
        try {
            const response = await createPresentation({
                name: projectName,
                description: projectDescription,
                tags,
                file: pdfFile[0],
            })
            setResult(response)
            console.log("Presentation created successfully:", response)
            goTo("done")
        } catch (err) {
            setError("Something went wrong while launching your project. Please try again.")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="p-8 flex flex-col justify-center space-y-8">
                <Stepper.Provider className="space-y-6" variant="horizontal" labelOrientation="horizontal">
                    {({ methods }) => (
                        <>
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-primary">Let’s prepare your presentation for take-off!</h1>
                            </div>

                            <Stepper.Navigation className="mb-4">
                                {methods.all.map((step) => (
                                    <Stepper.Step
                                        key={step.id}
                                        of={step.id}
                                        onClick={() => methods.goTo(step.id)}
                                        icon={step.icon}
                                    >
                                        <Stepper.Title>{step.title}</Stepper.Title>
                                    </Stepper.Step>
                                ))}
                            </Stepper.Navigation>

                            {methods.switch({
                                name: () => (
                                    <Stepper.Panel className="p-4 bg-white rounded-md space-y-4">
                                        <h2 className="text-2xl font-bold">Step 1: Project Name</h2>
                                        <FloatingLabelInput
                                            id="project-name"
                                            label="Presentation Name"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            required
                                        />
                                    </Stepper.Panel>
                                ),

                                background: () => (
                                    <Stepper.Panel className="p-4 bg-white rounded-md space-y-4">
                                        <h2 className="text-2xl font-bold">Step 2: Mission Briefing</h2>
                                        <FloatingLabelInput
                                            id="description"
                                            label="Description"
                                            value={projectDescription}
                                            onChange={(e) => setProjectDescription(e.target.value)}
                                            required
                                        />
                                        <InputTags
                                            value={tags}
                                            onChange={setTags}
                                            placeholder="Enter tags, Captain..."
                                            className="w-full"
                                        />
                                    </Stepper.Panel>
                                ),

                                upload: () => (
                                    <Stepper.Panel className="p-4 bg-white rounded-md space-y-4">
                                        <h2 className="text-2xl font-bold">Step 3: Upload Slides</h2>
                                        <PresentationUpload file={pdfFile} setFile={setPdfFile} />
                                        {error && <p className="text-destructive text-sm">{error}</p>}
                                    </Stepper.Panel>
                                ),

                                done: () => (
                                    <Stepper.Panel className="p-4 bg-white rounded-md space-y-4">
                                        <h2 className="text-2xl font-bold">🎉 Project Successfully Launched</h2>
                                        <p className="text-muted-foreground">You’ve successfully launched your project.</p>

                                        <div className="bg-muted p-4 rounded-md space-y-2">
                                            <div>
                                                <strong>Project Name:</strong> {result?.name}
                                            </div>
                                            <div>
                                                <strong>Tags:</strong>{" "}
                                                {result?.tags?.map((tag: string) => (
                                                    <Badge key={tag} className="mr-1">{tag}</Badge>
                                                ))}
                                            </div>
                                            <div>
                                                <strong>Slides Processed:</strong> {result?.finding_entries?.[0]?.findings?.slides?.length ?? "–"}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex gap-4">
                                            <Button variant="default">🔍 Deck Inspection</Button>
                                            <Button variant="secondary">🎤 Practice your presentation</Button>
                                        </div>
                                    </Stepper.Panel>
                                ),
                            })}

                            <Stepper.Controls>
                                {!methods.isFirst && (
                                    <Button variant="secondary" onClick={methods.prev}>
                                        Back
                                    </Button>
                                )}

                                <Button
                                    onClick={() => {
                                        if (methods.current.id === "upload") {
                                            handleSubmit(methods.goTo)
                                        } else {
                                            methods.next()
                                        }
                                    }}
                                    disabled={
                                        loading ||
                                        (methods.current.id === "name" && projectName.trim() === "") ||
                                        (methods.current.id === "upload" && !pdfFile.length)
                                    }
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    ) : methods.isLast ? (
                                        "Finish Setup"
                                    ) : (
                                        "Next"
                                    )}
                                </Button>
                            </Stepper.Controls>
                        </>
                    )}
                </Stepper.Provider>
            </div>

            <div className="hidden md:flex items-center justify-center bg-secondary">
                <div className="text-center">
                    <p className="text-lg font-medium text-muted-foreground">🎥 CEO Video Placeholder</p>
                    <p className="text-sm text-muted-foreground mt-1">This is where your guide appears</p>
                </div>
            </div>
        </div>
    )
}
