"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import pkg from "pdfjs-dist/package.json"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft } from "lucide-react"

GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pkg.version}/legacy/build/pdf.worker.min.mjs`

interface PdfPreviewCardProps {
    url: string
    jumpToPage?: number
    aspectRatio?: string
}

export function PdfPreviewCard({
    url,
    jumpToPage,
    aspectRatio = "16/9",
}: PdfPreviewCardProps) {
    const [images, setImages] = useState<string[]>([])
    const [pageNumber, setPageNumber] = useState(0)
    const [isHovering, setIsHovering] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const renderPdfToImages = async () => {
            const pdf = await getDocument(url).promise
            const rendered: string[] = []
            console.log(`Rendering PDF: ${url} with ${pdf.numPages} pages`)

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const viewport = page.getViewport({ scale: 1.5 })

                const canvas = document.createElement("canvas")
                const context = canvas.getContext("2d")!
                canvas.width = viewport.width
                canvas.height = viewport.height

                await page.render({ canvasContext: context, viewport }).promise
                rendered.push(canvas.toDataURL("image/jpeg", 0.9))
            }

            setImages(rendered)
        }

        renderPdfToImages()
    }, [url])

    useEffect(() => {
        if (
            typeof jumpToPage === "number" &&
            jumpToPage >= 0 &&
            jumpToPage < images.length
        ) {
            setPageNumber(jumpToPage)
        }
    }, [jumpToPage, images.length])

    useEffect(() => {
        if (!isHovering || images.length <= 1) return

        const interval = setInterval(() => {
            setPageNumber((prev) => (prev + 1) % images.length)
        }, 1500)

        return () => clearInterval(interval)
    }, [isHovering, images.length])

    if (!images.length) {
        return <Skeleton className={`w-full aspect-16/9 rounded-xl`} />
    }

    return (
        <Card
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false)
                setPageNumber(0)
            }}
            className="overflow-hidden bg-blue-50 border-none shadow-none"
        >
            <CardContent
                ref={containerRef}
                className={`relative p-0 aspect-16/9 w-full bg-blue-50 overflow-hidden`}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={pageNumber}
                        src={images[pageNumber]}
                        alt={`Page ${pageNumber + 1}`}
                        className="absolute inset-0 object-contain w-full h-full p-4 bg-blue-50"
                        initial={{ x: 100, opacity: 0, scale: 0.98 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -100, opacity: 0, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </AnimatePresence>
                {isHovering && images.length > 1 && (
                    <>
                        <div className="absolute bottom-2 right-2 z-20 text-xs px-2 py-1 bg-black/70 text-white rounded-md shadow-sm font-medium backdrop-blur-sm">
                            {pageNumber + 1} / {images.length}
                        </div>

                    </>
                )}
            </CardContent>
        </Card>
    )
}
