"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Document, Page, pdfjs } from "react-pdf"
import {
    ChevronLeft,
    ChevronRight,
    Camera,
    Mic,
    NotebookText,
    MoreVertical,
    CircleDot,
    Play,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { newPeer, wireSignalling } from "@/lib/websocket/webrtc"
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision"

import {
    startRecording,
    finishRecording,
    presignRecording,
} from "@/lib/api/recordings"
import { useFaceTracking } from "@/hooks/useFaceTracking"


pdfjs.GlobalWorkerOptions.workerSrc =
    `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`

const pdfUrl = "/test_pdf.pdf"

function RemoteVideo({ stream }: { stream: MediaStream }) {
    const ref = React.useRef<HTMLVideoElement>(null)
    React.useEffect(() => {
        if (ref.current) {
            ref.current.srcObject = stream
            ref.current.play().catch(() => { })
        }
    }, [stream])
    return (
        <video
            ref={ref}
            autoPlay
            playsInline
            muted
            className="bg-black rounded-md h-24 w-full object-cover"
        />
    )
}

export default function TrainingPage() {
    const { tid: tid } = useParams<{ tid: string }>()
    const [localStream, setLocalStream] = React.useState<MediaStream>()
    const previewRef = React.useRef<HTMLVideoElement>(null as unknown as HTMLVideoElement)
    const [numPages, setNumPages] = React.useState(0)
    const [page, setPage] = React.useState(1)
    const [secs, setSecs] = React.useState(0)
    const blendshapes = useFaceTracking(previewRef, tid);
    const timer = new Date(secs * 1_000).toISOString().substring(14, 19)
    const [isVideoReady, setIsVideoReady] = React.useState(false)

    React.useEffect(() => {
        const t = setInterval(() => setSecs((s) => s + 1), 1_000)
        return () => clearInterval(t)
    }, [])

    React.useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((s) => {
            setLocalStream(s)
            if (previewRef.current) {
                previewRef.current.srcObject = s
                previewRef.current.onloadeddata = () => setIsVideoReady(true)
                previewRef.current.oncanplay = () => setIsVideoReady(true)
                previewRef.current.play().catch(() => { })
            }
        })
    }, [])



    React.useEffect(() => {
        if (blendshapes) {
            console.log("Blendshapes from hook:", blendshapes);
            const jawOpen = blendshapes.find(shape => shape.categoryName === 'jawOpen')?.score || 0;
        }
    }, [blendshapes]);

    const [streams, setStreams] = React.useState<MediaStream[]>([])
    React.useEffect(() => {
        if (!tid) return
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/v1/ws/signaling/join`)
        const pc = newPeer()
        wireSignalling(pc, ws, tid, false)
        pc.ontrack = (ev) =>
            setStreams((cur) =>
                cur.find((s) => s.id === ev.streams[0].id) ? cur : [...cur, ev.streams[0]],
            )
        ws.onopen = () => ws.send(JSON.stringify({ type: "join", tid }))
        return () => {
            pc.close(); ws.close()
        }
    }, [tid])

    const [isRec, setIsRec] = React.useState(false)
    const [playUrl, setPlayUrl] = React.useState<string | null>(null)

    const putUrls = React.useRef<string[]>([])
    const partIdx = React.useRef(0)
    const prefix = React.useRef<string>(null)
    const recorder = React.useRef<MediaRecorder>(null)

    async function startRec() {
        if (!localStream) return
        const { prefix: pre, urls } = await startRecording(tid)
        prefix.current = pre
        putUrls.current = urls
        partIdx.current = 0
        setPlayUrl(null)

        const mr = new MediaRecorder(localStream, { mimeType: "video/webm;codecs=vp8,opus" })
        const TARGET = 5 * 1024 * 1024
        let bucket: Blob[] = []
        let size = 0

        mr.ondataavailable = async (e) => {
            if (!e.data.size) return
            bucket.push(e.data); size += e.data.size
            if (size >= TARGET || partIdx.current === putUrls.current.length - 1) {
                const blob = new Blob(bucket, { type: "video/webm" })
                bucket = []; size = 0
                const url = putUrls.current[partIdx.current++]
                await fetch(url, { method: "PUT", body: blob, credentials: "omit" })
            }
        }

        mr.onstop = async () => {
            if (bucket.length) {
                const blob = new Blob(bucket, { type: "video/webm" })
                const url = putUrls.current[partIdx.current++]
                await fetch(url, { method: "PUT", body: blob, credentials: "omit" })
            }
            await finalizeRecording()
        }

        mr.start(5_000)
        recorder.current = mr
        setIsRec(true)
    }

    /* finish → compose → presign */
    async function finalizeRecording() {
        setIsRec(false)
        const { object, url } = await finishRecording(tid, prefix.current!)
        console.log("Recording finished:", object, url)
    }

    function toggleRec() {
        isRec ? recorder.current?.stop() : startRec()
    }

    React.useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, numPages))
            if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 1))
        }
        window.addEventListener("keydown", h)
        return () => window.removeEventListener("keydown", h)
    }, [numPages])

    return (
        <div className="relative h-full w-full flex">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-36 z-20">
                <video
                    ref={previewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full rounded-md bg-black object-cover"
                />

                {!isVideoReady && (
                    <div className="absolute inset-0 bg-muted/80 flex items-center justify-center rounded-md z-10">
                        <div className="animate-spin h-6 w-6 border-4 border-t-transparent border-gray-400 rounded-full" />
                    </div>
                )}
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-hidden px-4 py-4">
                <div className="flex items-start justify-between pt-40">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-900 border-yellow-300">
                        {timer}
                    </Badge>

                    <div className="flex items-center gap-6">
                        <Play
                            className={`w-5 h-5 cursor-pointer ${playUrl ? "text-primary" : "text-muted-foreground"}`}
                            onClick={() => playUrl && window.open(playUrl, "_blank")}
                        />
                        <CircleDot
                            className={`w-5 h-5 cursor-pointer ${isRec ? "text-red-600" : ""}`}
                            onClick={toggleRec}
                        />
                        <div className="h-6 w-px bg-border" />
                        <Camera className="w-5 h-5" />
                        <Mic className="w-5 h-5" />
                        <NotebookText className="w-5 h-5" />
                        <MoreVertical className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 bg-sky-100 rounded-md flex items-center justify-center">
                        <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                            <Page pageNumber={page} width={900} renderAnnotationLayer={false} renderTextLayer={false} />
                        </Document>
                    </div>

                    <aside className="hidden xl:flex flex-col gap-4 pl-4 w-56">
                        {streams.length
                            ? streams.map((s) => <RemoteVideo key={s.id} stream={s} />)
                            : dummy.map((p) => (
                                <div key={p.id} className="bg-muted rounded-md h-24 flex items-center justify-center">
                                    <Avatar className="h-12 w-12"><AvatarFallback>{initials(p.name)}</AvatarFallback></Avatar>
                                </div>
                            ))}
                    </aside>
                </div>
                <div className="flex items-center justify-center gap-6 select-none">
                    <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    {page}
                    <span className="text-muted-foreground">/ {numPages || "…"}</span>
                    <Button variant="ghost" size="icon" disabled={page === numPages} onClick={() => setPage((p) => p + 1)}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

const dummy = [
    { id: "1", name: "Alex Johnson" },
    { id: "2", name: "Sam Wong" },
    { id: "3", name: "Taylor Smith" },
]
function initials(n: string) {
    return n.split(" ").map((p) => p[0]).join("").toUpperCase()
}
