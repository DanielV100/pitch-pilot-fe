'use client'

import { useState } from 'react'
import {
    ShieldCheck,
    AlertTriangle,
    AlertOctagon,
    Quote,
    Pin,
    Plane,
    CheckCircle2,
} from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export type Finding = {
    slide: number
    heading: string
    severity: number
    text_excerpt: string
    suggestion: string
    type: 1 | 2 | 3 | 4
}
export type FindingsBucket = Record<1 | 2 | 3 | 4, Finding[]>

const LABEL: Record<1 | 2 | 3 | 4, string> = {
    1: 'Pre Flight',
    2: 'Altitude',
    3: 'Flight Path',
    4: 'Cockpit',
}

const colorBySeverity = (sev: number) =>
    sev <= 33 ? 'green' : sev <= 66 ? 'amber' : 'red'

const borderColor = {
    green: 'border-emerald-400',
    amber: 'border-amber-400',
    red: 'border-rose-500',
}
const bgColor = {
    green: 'bg-emerald-50/50',
    amber: 'bg-amber-50/40',
    red: 'bg-rose-50/40',
}
const sevIcon = {
    green: ShieldCheck,
    amber: AlertTriangle,
    red: AlertOctagon,
}

export function FindingTabs({ findings }: { findings: FindingsBucket }) {
    const [reviewed, setReviewed] = useState<Set<string>>(new Set())

    //@ToDO: save the reviewed state to a backend or local storage
    const toggleReviewed = (key: string) =>
        setReviewed(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })

    const total = Object.values(findings).flat().length
    const progress = reviewed.size

    return (
        <div className="rounded-[12px] border p-6 w-full">
            <Tabs defaultValue="4" className="w-full">
                <TabsList className="mb-3 flex flex-wrap justify-center gap-2 w-full">
                    {(Object.keys(LABEL) as Array<'1' | '2' | '3' | '4'>).map(k => (
                        <TabsTrigger key={k} value={k} className="gap-1 w-full">
                            <Plane className="h-3 w-3 -translate-y-[1px]" />
                            {LABEL[Number(k) as 1 | 2 | 3 | 4]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <p className="text-center text-[13px] text-muted-foreground mb-6">
                    Your visual control center. We check whether your layout, fonts, and
                    colours help you take control or whether visual turbulence might
                    confuse your audience.
                </p>
                <p className="text-center text-sm font-medium text-primary mb-8">
                    {progress} of {total} findings reviewed
                </p>

                {(Object.keys(LABEL) as Array<'1' | '2' | '3' | '4'>).map(k => {
                    const bucket = findings[Number(k) as 1 | 2 | 3 | 4]

                    return (
                        <TabsContent key={k} value={k} className="space-y-10">
                            {bucket.map((f, idx) => {
                                const tone = colorBySeverity(f.severity)
                                const Icon = sevIcon[tone]
                                const isDone = reviewed.has(`${k}-${idx}`)
                                const border = isDone ? 'border-primary' : borderColor[tone]
                                const bg = isDone ? 'bg-primary/5' : bgColor[tone]

                                return (
                                    <article
                                        key={idx}
                                        role="button"
                                        onClick={() => toggleReviewed(`${k}-${idx}`)}
                                        className={cn(
                                            'rounded-xl border p-8 shadow-sm transition-colors',
                                            border, bg,
                                            'cursor-pointer select-none'
                                        )}
                                    >
                                        <header className="mb-4 space-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                Slide {f.slide}
                                            </p>
                                            <h3 className="font-semibold flex items-center gap-1">
                                                {f.heading}
                                                {isDone && (
                                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                                )}
                                            </h3>
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Icon className="h-3 w-3" />
                                                Severity Level: {f.severity}/100
                                            </p>
                                        </header>


                                        <blockquote className="relative rounded px-4 py-3 text-sm leading-relaxed">
                                            <Quote className="absolute -left-1 -top-1 h-4 w-4 text-primary" />
                                            <span>{f.text_excerpt}</span>
                                            <Quote className="absolute -right-1 -bottom-1 h-4 w-4 text-primary rotate-180" />
                                        </blockquote>

                                        {/* hint line */}
                                        <p className="mt-3 text-xs italic text-muted-foreground">
                                            Long and complex sentences can cloud your core message.
                                            Keep it sharp and easy to follow, just like a smooth
                                            descent before landing.
                                        </p>

                                        <hr className="my-6" />

                                        <p className="text-sm">
                                            <span className="flex items-center gap-1 font-medium mb-1">
                                                <Pin className="h-4 w-4" />
                                                Suggestion
                                            </span>
                                            {f.suggestion}
                                        </p>
                                    </article>
                                )
                            })}
                        </TabsContent>
                    )
                })}
            </Tabs>
        </div>
    )
}
