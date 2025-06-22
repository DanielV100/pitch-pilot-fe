"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { getTrainingById } from "@/lib/api/trainings"
import { Training, TrainingResult } from "@/types/presentation"
import { FlightLogSidebar } from "@/components/flight-log/bar-with-cards"


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`

export default function FlightLogMain() {
    const pdfUrl = "/test_pdf.pdf"
    const { tid: tid } = useParams<{ tid: string }>()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [numPages, setNumPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [showHeat, setShowHeat] = useState(false)
    const [log, setLog] = useState<Training | null>(null)
    const [loading, setLoading] = useState(true)

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

    if (loading || !log) {
        return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading…</div>
    }

    return (
        <div className="w-full px-4 pb-8 pt-2" style={{ minHeight: 420 }}>
            <div className="flex w-full gap-6">
                <div className="flex-1 flex flex-col items-center">
                    <div className="flex-1 w-full max-w-2xl flex items-center">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-muted shadow-md">
                            <video
                                ref={videoRef}
                                src={log.video_url}
                                controls
                                className="w-full h-full object-cover bg-gray-100"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                    <div className="flex-1 w-full flex items-center">
                        <div
                            className={cn(
                                "w-full h-full bg-muted rounded-2xl flex items-center justify-center shadow-md border border-blue-50",
                                showHeat ? "relative" : ""
                            )}
                        >
                            <Document
                                file={pdfUrl}
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
                            {showHeat && (
                                <div className="absolute inset-0 bg-orange-400/10 pointer-events-none rounded-2xl flex items-center justify-center z-10">
                                    <span className="text-orange-800 text-sm font-bold">Heatmap Demo</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-2 select-none">
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
            </div>
            <div className="h-6" />
            <div className="w-full max-w-6xl mx-auto">
                <FlightLogSidebar
                    result={log.training_results?.[0]}
                    videoRef={videoRef as React.RefObject<HTMLVideoElement>}
                />
            </div>
        </div>
    )
}
