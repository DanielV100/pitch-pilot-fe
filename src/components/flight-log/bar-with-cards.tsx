import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MessageCircle, Lightbulb, AlertCircle } from "lucide-react"
import { TrainingResult } from "@/types/presentation"
import { RefObject } from "react"

interface Props {
    result?: TrainingResult;
    videoRef: RefObject<HTMLVideoElement>;
}

function normalize(str: string) {
    return str.toLowerCase().replace(/[.,!?]/g, "").trim();
}

function getPhraseStartTime(phrase: string, transcript: any): number | undefined {
    if (!transcript?.words?.length || !phrase) return undefined;
    const phraseWords = phrase.split(/\s+/).map(normalize).filter(Boolean);
    for (let i = 0; i <= transcript.words.length - phraseWords.length; i++) {
        let match = true;
        for (let j = 0; j < phraseWords.length; j++) {
            if (normalize(transcript.words[i + j].word) !== phraseWords[j]) {
                match = false;
                break;
            }
        }
        if (match) return transcript.words[i].start;
    }
    const fallback = transcript.words.find(
        (w: any) => normalize(w.word) === phraseWords[0]
    );
    return fallback?.start;
}

function formatTime(sec: number) {
    if (isNaN(sec)) return "";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FlightLogSidebar({ result, videoRef }: Props) {
    if (!result?.audio_scores) return null;
    const { fillers, volume_timeline, formulation_aids, questions, transcript } = result.audio_scores;

    function isDuringSpeech(t: number) {
        if (!transcript?.words?.length) return false;
        return transcript.words.some((w: any) => w.start <= t && w.end >= t);
    }

    const volumeIssues = (volume_timeline || [])
        .filter((v: any) => v.dbfs < -70 && isDuringSpeech(v.t))
        .map((v: any) => ({
            timestamp: v.t,
            dbfs: v.dbfs,
            type: "low",
            label: "Low volume",
            description: "Your voice was too quiet at this moment. Speak louder or move closer to the mic."
        }));

    return (
        <Tabs defaultValue="fillers" className="w-full">
            <TabsList className="w-full flex rounded-2xl bg-[#f3f8fb] p-1 mb-4 shadow-sm">
                <TabsTrigger
                    value="questions"
                    className="flex-1 data-[state=active]:bg-[#dbeafe] data-[state=active]:shadow data-[state=active]:font-bold data-[state=active]:text-blue-900 text-blue-700 rounded-2xl transition-all"
                >
                    <MessageCircle className="mr-2 h-4 w-4" /> Follow-up questions
                </TabsTrigger>
                <TabsTrigger
                    value="fillers"
                    className="flex-1 data-[state=active]:bg-[#dbeafe] data-[state=active]:shadow data-[state=active]:font-bold data-[state=active]:text-blue-900 text-blue-700 rounded-2xl transition-all"
                >
                    <AlertCircle className="mr-2 h-4 w-4" /> Detected issues
                </TabsTrigger>
            </TabsList>
            <TabsContent value="questions">
                {(questions && questions.length > 0) ? (
                    <ul className="space-y-4">
                        {questions.map((q: string, i: number) => (
                            <li
                                key={i}
                                className="bg-[#eaf6fd] px-4 py-3 rounded-xl shadow border border-[#d1e7f7] text-blue-900"
                            >
                                <span className="font-semibold">Question {i + 1}</span>
                                <div className="mt-1 text-[15px]">{q}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-muted-foreground text-center py-8">No follow-up questions detected.</div>
                )}
            </TabsContent>
            <TabsContent value="fillers">
                {(fillers && fillers.length > 0) || (volumeIssues.length > 0) || (formulation_aids && formulation_aids.length > 0) ? (
                    <div className="flex flex-col gap-6">
                        {fillers && fillers.length > 0 && (
                            <div>
                                <div className="mb-2 font-bold text-blue-900 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" /> Filler Words
                                </div>
                                <div className="flex flex-col gap-3">
                                    {fillers.map((f: any, i: number) => {
                                        const startTime = getPhraseStartTime(f.word, transcript);
                                        return (
                                            <Card
                                                key={i}
                                                className="cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-xl transition-all bg-[#f9fbfd] shadow"
                                                onClick={() => {
                                                    if (startTime !== undefined && videoRef.current)
                                                        videoRef.current.currentTime = startTime;
                                                }}
                                            >
                                                <CardContent className="flex flex-col gap-2 p-4">
                                                    <div className="flex items-center gap-2 font-semibold text-blue-800">
                                                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-mono text-blue-900">{startTime !== undefined ? formatTime(startTime) : ""}</span>
                                                        <span>Filler word: <span className="font-bold">{f.word}</span></span>
                                                        <span className="ml-auto text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">{f.count}×</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{f.explanation}</div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        {volumeIssues && volumeIssues.length > 0 && (
                            <div>
                                <div className="mb-2 font-bold text-yellow-900 flex items-center gap-2">
                                    <Mic className="h-5 w-5" /> Volume Issues
                                </div>
                                <div className="flex flex-col gap-3">
                                    {volumeIssues.map((v: any, i: number) => (
                                        <Card
                                            key={i}
                                            className="cursor-pointer border-2 border-transparent hover:border-yellow-500 rounded-xl transition-all bg-[#fdfaf4] shadow"
                                            onClick={() => videoRef.current && (videoRef.current.currentTime = v.timestamp)}
                                        >
                                            <CardContent className="flex flex-col gap-2 p-4">
                                                <div className="flex items-center gap-2 font-semibold text-yellow-900">
                                                    <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-mono">{formatTime(v.timestamp)}</span>
                                                    <span>{v.label}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{v.description}</div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                        {formulation_aids && formulation_aids.length > 0 && (
                            <div>
                                <div className="mb-2 font-bold text-green-900 flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5" /> Formulation Aids
                                </div>
                                <div className="flex flex-col gap-3">
                                    {formulation_aids.map((a: any, i: number) => {
                                        const startTime = getPhraseStartTime(a.original, transcript);
                                        return (
                                            <Card
                                                key={i}
                                                className="border-2 border-transparent hover:border-green-500 rounded-xl transition-all cursor-pointer bg-[#f4fdf7] shadow"
                                                onClick={() => {
                                                    if (startTime !== undefined && videoRef.current)
                                                        videoRef.current.currentTime = startTime;
                                                }}
                                            >
                                                <CardContent className="flex flex-col gap-2 p-4">
                                                    <div className="flex items-center gap-2 font-semibold text-green-800">
                                                        {startTime !== undefined && (
                                                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono">{formatTime(startTime)}</span>
                                                        )}
                                                        <span>Formulation suggestion</span>

                                                    </div>
                                                    <div className="text-sm text-primary"><b>Original:</b> {a.original}</div>
                                                    <div className="text-sm text-primary"><b>Suggestion:</b> {a.suggestion}</div>
                                                    <div className="text-sm text-muted-foreground">{a.explanation}</div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-muted-foreground text-center py-8">No detected issues.</div>
                )}
            </TabsContent>
        </Tabs>
    )
}
