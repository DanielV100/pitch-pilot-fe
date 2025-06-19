"use client"

import { FilePenLine, Info, Upload } from "lucide-react"
import * as React from "react"
import { defineStepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { FloatingLabelInput, Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
    }
)

export default function PresentationSetupPage() {
    const [projectName, setProjectName] = React.useState("")
    const [projectDescription, setProjectDescription] = React.useState("")
    const [tags, setTags] = React.useState<string[]>([])
    const [pdfFile, setPdfFile] = React.useState<File[]>([])



    const handleSubmit = async () => {
        try {
            const result = await createPresentation({
                name: projectName,
                description: projectDescription,
                tags,
                file: pdfFile[0],
            })

            console.log("Created presentation:", result)
            // Optional: redirect or toast
        } catch (err) {
            console.error("Presentation creation failed", err)
            // Optional: show error toast
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
                                        <p className="text-muted-foreground">Let’s name your project so you can easily find it later.</p>

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
                                        <p className="text-muted-foreground">What is your presentation about? Give us a short mission briefing.</p>
                                        <FloatingLabelInput
                                            id="description"
                                            label="Description"
                                            value={projectName}
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
                                        <p className="text-muted-foreground">Upload your presentation slides as a PDF.</p>
                                        <PresentationUpload file={pdfFile} setFile={setPdfFile} />
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
                                        if (methods.isLast) {
                                            handleSubmit();
                                        } else {
                                            methods.next();
                                        }
                                    }}

                                    disabled={
                                        (methods.current.id === "name" && projectName.trim() === "") ||
                                        (methods.current.id === "upload" && !pdfFile)
                                    }
                                >
                                    {methods.isLast ? "Finish Setup" : "Next"}
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