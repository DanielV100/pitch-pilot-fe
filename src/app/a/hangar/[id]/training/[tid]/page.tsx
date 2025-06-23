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
    ReplyAll,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { newPeer, wireSignalling } from "@/lib/websocket/webrtc"
import {
    startRecording,
    finishRecording,
} from "@/lib/api/recordings"
import { useFaceTracking } from "@/hooks/useFaceTracking"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

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

// ------- MAIN PAGE -------
export default function TrainingPage() {
    const { tid } = useParams<{ tid: string }>()
    // State for media, timer, recording
    const [localStream, setLocalStream] = React.useState<MediaStream>()
    const previewRef = React.useRef<HTMLVideoElement>(null as unknown as HTMLVideoElement)
    const [numPages, setNumPages] = React.useState(0)
    const [page, setPage] = React.useState(1)
    const [secs, setSecs] = React.useState(0)
    const [status, setStatus] = React.useState<'idle' | 'recording' | 'finished'>('idle')
    const timerRef = React.useRef<NodeJS.Timeout>(null)
    const [recStart, setRecStart] = React.useState<number | null>()
    const [slideEvents, setSlideEvents] = React.useState<{ timestamp: number, page: number }[]>([])
    const slideEventsRef = React.useRef<{ timestamp: number, page: number }[]>([]);
    const [isVideoReady, setIsVideoReady] = React.useState(false)
    const [playUrl, setPlayUrl] = React.useState<string | null>(null)
    const [streams, setStreams] = React.useState<MediaStream[]>([])
    const [isRec, setIsRec] = React.useState(false)
    const blendshapes = useFaceTracking(previewRef, tid, status === "recording")
    const timer = new Date(secs * 1_000).toISOString().substring(14, 19)
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
    function updateSlideEvents(events: { timestamp: number, page: number }[]) {
        slideEventsRef.current = events;
        setSlideEvents(events);
    }
    const goToPrevPage = React.useCallback(() => {
        setPage((prev) => {
            const next = Math.max(prev - 1, 1)
            if (next !== prev && status === "recording") recordSlideChange(next)
            return next
        })
    }, [status])
    const goToNextPage = React.useCallback(() => {
        setPage((prev) => {
            const next = Math.min(prev + 1, numPages)
            if (next !== prev && status === "recording") recordSlideChange(next)
            return next
        })
    }, [status, numPages])
    const recordSlideChange = React.useCallback((newPage: number) => {
        if (status !== "recording") return;
        const now = ((Date.now() - (recStart ?? 0)) / 1000);
        const prevEvents = slideEventsRef.current;
        if (prevEvents.length && prevEvents[prevEvents.length - 1].page === newPage) return;
        const nextEvents = [...prevEvents, { timestamp: now, page: newPage }];
        updateSlideEvents(nextEvents);
    }, [status, recStart]);

    React.useEffect(() => {
        if (status === "recording" && slideEvents.length === 0) {
            recordSlideChange(page)
        }
    }, [status, slideEvents.length, page, recordSlideChange])

    React.useEffect(() => {
        if (status === "recording") {
            timerRef.current = setInterval(() =>
                setSecs(Math.floor((Date.now() - (recStart ?? 0)) / 1000)), 1000
            )
        } else {
            clearInterval(timerRef.current!)
        }
        return () => clearInterval(timerRef.current!)
    }, [status, recStart])

    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 's' || e.key === 'S') handleStart()
            if (e.key === 'e' || e.key === 'E') handleEnd()
            if (e.key === 'r' || e.key === 'R') handleRestart()
            if (e.key === "ArrowRight") goToNextPage()
            if (e.key === "ArrowLeft") goToPrevPage()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [goToNextPage, goToPrevPage])

    const putUrls = React.useRef<string[]>([])
    const partIdx = React.useRef(0)
    const prefix = React.useRef<string>(null)
    const recorder = React.useRef<MediaRecorder>(null)

    async function startRec() {
        console.log('test')
        if (!localStream) return
        const { prefix: pre, urls } = await startRecording(tid)
        prefix.current = pre
        putUrls.current = urls
        partIdx.current = 0
        setPlayUrl(null)
        setRecStart(Date.now());
        updateSlideEvents([]);
        setSecs(0);
        setIsRec(true)
        setStatus("recording")

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
    }

    async function finalizeRecording() {
        setIsRec(false)
        setStatus("finished")
        await finishRecording(tid, prefix.current!, slideEventsRef.current!)
        console.log("Slide events:", slideEventsRef.current)
    }
    async function handleStart() {
        if (status === "recording") return
        await startRec()
    }

    function handleRestart() {
        if (recorder.current && status === 'recording') recorder.current.stop()
        setStatus('idle')
        setSecs(0)
        setRecStart(null)
        setSlideEvents([])
        updateSlideEvents([])
        setIsRec(false)
        setPlayUrl(null)
    }

    function handleEnd() {
        if (recorder.current && status === 'recording') {
            recorder.current.stop()
        }
    }

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
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleStart}
                                    disabled={status == 'recording'}
                                    variant="ghost"
                                    size="default"
                                >
                                    <Play className="w-5 h-5 mr-1" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Start Training<br />Shortcut: <b>S</b></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleEnd}
                                    disabled={status !== 'recording'}
                                    variant="ghost"
                                    size="default"
                                >
                                    <CircleDot className="w-5 h-5 mr-1" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>End Training<br />Shortcut: <b>E</b></TooltipContent>
                        </Tooltip>
                        <div className="h-6 w-px bg-border" />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleRestart}
                                    disabled={status !== 'recording'}
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2"
                                >
                                    <ReplyAll className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Restart Training<br />
                                Shortcut: <b>R</b>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                >
                                    <NotebookText className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Notes
                            </TooltipContent>
                        </Tooltip>
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
                    <Button variant="ghost" size="icon" disabled={page === 1} onClick={goToPrevPage} title="Previous Slide (←)">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    {page}
                    <span className="text-muted-foreground">/ {numPages || "…"}</span>
                    <Button variant="ghost" size="icon" disabled={page === numPages} onClick={goToNextPage} title="Next Slide (→)">
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
