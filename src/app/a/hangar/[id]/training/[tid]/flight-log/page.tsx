'use client'

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getTrainingById } from "@/lib/api/trainings"
import { getPresentationFileUrl } from "@/lib/api/presentation"
import { cn } from "@/lib/utils"
import { FlightLogSidebar } from "@/components/flight-log/bar-with-cards"
import { VideoHeatmapOverlay } from "@/components/eye-tracking/heatmap-slim"

import { Training } from "@/types/presentation"
import { FlightLogPanel } from "@/components/flight-log/flight-log-panel"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`

export default function FlightSummaryPage() {
    const { tid, id } = useParams<{ tid: string, id: string }>()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [numPages, setNumPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [showHeat, setShowHeat] = useState(false)
    const [log, setLog] = useState<Training | null>(null)
    const [loading, setLoading] = useState(true)
    const [fileUrl, setFileUrl] = useState<string>("")

    useEffect(() => {
        setLoading(true)
        getTrainingById(tid)
            .then((data) => {
                setLog(data)
                setCurrentPage(data.slide_events?.[0]?.page ?? 1)
            })
            .finally(() => setLoading(false))
    }, [tid])

    useEffect(() => {
        if (!log?.slide_events?.length) return
        const video = videoRef.current
        if (!video) return
        const onTimeUpdate = () => {
            const now = video.currentTime
            const evt = [...(log.slide_events ?? [])].reverse().find(e => e.timestamp <= now)
            if (evt && evt.page !== currentPage) setCurrentPage(evt.page)
        }
        video.addEventListener("timeupdate", onTimeUpdate)
        return () => video.removeEventListener("timeupdate", onTimeUpdate)
    }, [log?.slide_events, currentPage])

    useEffect(() => {
        async function fetchData() {
            try {
                const fileUrlObj = await getPresentationFileUrl(id as string)
                setFileUrl(fileUrlObj.file_url)
            } catch (err) {
                console.error("Failed to load slides url ", err)
            }
        }
        if (id) fetchData()
    }, [id])

    if (loading || !log) {
        return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading…</div>
    }

    const result = log.training_results?.[0]

    return (
        <div className="size-full bg-background flex flex-col px-2 py-4 md:px-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-primary font-sans">Flight summary</h1>
            <div className="flex items-center gap-2 mb-6">
                <Label htmlFor="show-heatmap" className="text-base font-medium">Show eye tracking heatmap?</Label>
                <Switch id="show-heatmap" checked={showHeat} onCheckedChange={setShowHeat} />
            </div>
            {/* Responsive 2-col grid: stacks on mobile, side-by-side on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* LEFT: Video + Sidebar */}
                <div className="flex flex-col gap-4 w-full">
                    {/* Video */}
                    <div className="relative w-full rounded-2xl overflow-hidden bg-muted shadow aspect-video">
                        <video
                            ref={videoRef}
                            src={log.video_url}
                            controls
                            className="w-full h-full object-cover bg-gray-100"
                        />
                        {showHeat && <VideoHeatmapOverlay data={log} cellSize={10} gridSize={40} />}
                    </div>
                    {/* Sidebar tabs */}

                    <FlightLogSidebar
                        result={result}
                        videoRef={videoRef as any}
                    />

                </div>
                {/* RIGHT: Slides + Flight Log */}
                <div className="flex flex-col gap-4 w-full">
                    {/* Slides */}
                    <div className={cn(
                        "relative w-full bg-muted rounded-2xl flex items-center justify-center shadow border border-blue-50 aspect-video",
                    )}>
                        <Document
                            file={fileUrl}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            loading={<div className="text-muted-foreground">Loading slides…</div>}
                        >
                            <Page
                                pageNumber={currentPage}
                                width={540}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                            />
                        </Document>
                        {/* Slide navigation */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/70 rounded-full px-3 py-1 shadow">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                <span className="sr-only">Previous Slide</span>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </Button>
                            <span className="font-semibold tabular-nums">{currentPage}</span>
                            <span className="text-muted-foreground">/ {numPages || "…"}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={currentPage === numPages}
                                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                            >
                                <span className="sr-only">Next Slide</span>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </Button>
                        </div>
                    </div>
                    {/* Flight log (right cards/metrics) */}
                    <FlightLogPanel result={result} />
                </div>
            </div>
        </div>
    )
}
