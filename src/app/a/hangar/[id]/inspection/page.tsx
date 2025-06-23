'use client'

import { useEffect, useState, Fragment } from 'react'
import { useParams } from 'next/navigation'
import { Sparkles, Check, AlertTriangle } from 'lucide-react'

import { PdfPreviewCard } from '@/components/ui/pdf-preview-card'
import { ChartRadialLabel } from '@/components/ui/inspection-radial'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getActiveFinding, getPresentationFileUrl } from '@/lib/api/presentation'
import { FindingTabs } from '@/components/inspection/finding'
import { FindingEntry } from '@/types/presentation'

type Finding = {
    slide: number
    heading: string
    severity: number
    text_excerpt: string
    suggestion: string
    type: 1 | 2 | 3 | 4
}

const LABEL: Record<1 | 2 | 3 | 4, string> = {
    1: 'Pre Flight Check',
    2: 'Altitude',
    3: 'Flight Path',
    4: 'Cockpit',
}


//@ToDo: implement follow up questions to the presentations content 

export default function InspectionPage() {
    const { id: presentationId } = useParams<{ id: string }>()
    const [loading, setLoading] = useState(true)
    const [fileUrl, setFileUrl] = useState<string>("")



    const [total, setTotal] = useState(0)
    const [slides, setSlides] = useState(0)
    const [preflight, setPreflight] = useState(0)
    const [altitude, setAltitude] = useState(0)
    const [flight, setFlight] = useState(0)
    const [cockpit, setCockpit] = useState(0)
    const [allFindings, setAllFindings] = useState<FindingEntry>()


    const [findings, setFindings] = useState<Record<1 | 2 | 3 | 4, Finding[]>>({
        1: [], 2: [], 3: [], 4: [],
    })


    useEffect(() => {
        if (!presentationId) return
            ; (async () => {
                try {
                    setLoading(true)
                    const f = await getActiveFinding(presentationId)
                    setAllFindings(f)


                    setTotal(Math.round(f.total_score))
                    setSlides(f.findings?.slides?.length ?? 0)
                    setPreflight(Math.round(f.preflight_check_score))
                    setAltitude(Math.round(f.altitude_score))
                    setFlight(Math.round(f.flight_path_score))
                    setCockpit(Math.round(f.cockpit_score))
                    const fileUrlObj = await getPresentationFileUrl(presentationId);
                    setFileUrl(fileUrlObj.file_url);


                    const bucket: Record<1 | 2 | 3 | 4, Finding[]> = { 1: [], 2: [], 3: [], 4: [] }
                    for (const s of f.findings.slides ?? []) {
                        for (const itm of s.findings) {
                            bucket[itm.type as 1 | 2 | 3 | 4].push({
                                slide: s.page,
                                heading: `Issue ${bucket[itm.type as 1 | 2 | 3 | 4].length + 1}`,
                                severity: itm.severity,
                                text_excerpt: itm.text_excerpt,
                                suggestion: itm.suggestion,
                                type: itm.type as 1 | 2 | 3 | 4,
                            })
                        }
                    }
                    setFindings(bucket)
                } catch (e) {
                    console.error('fetch inspection', e)
                } finally {
                    setLoading(false)
                }
            })()
    }, [presentationId])
    const chartBlock = loading
        ? <Skeleton className="w-[320px] h-[320px] rounded-full" />
        : <ChartRadialLabel
            cockpit={cockpit}
            altitude={altitude}
            flightPath={flight}
            preflight={preflight}
        />

    return (
        <main className="p-6 space-y-6 w-full">
            <h1 className="text-4xl font-bold text-primary">Deck Inspection</h1>
            <h2 className="text-2xl font-semibold">Inspection Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 items-start">

                <PdfPreviewCard url={fileUrl} aspectRatio="16/9" />


                <div className="flex flex-col items-center">
                    {chartBlock}
                    <p className='text-2xl'>{allFindings?.total_score}</p>
                    <p className="text-muted-foreground text-sm">
                        <span className="font-medium">{slides}</span> slides reviewed
                    </p>
                </div>
            </div>

            <FindingTabs findings={findings} />
        </main>
    )
}
