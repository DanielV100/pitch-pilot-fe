import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MessageCircle, Lightbulb } from "lucide-react"
import { TrainingResult } from "@/types/presentation"
import { RefObject } from "react"

interface Props {
    result?: TrainingResult;
    videoRef: RefObject<HTMLVideoElement>;
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

    function normalize(str: string) {
        return str
            .toLowerCase()
            .replace(/[.,!?]/g, "")
            .trim();
    }

    function getSentenceStartTime(sentence: string, transcript: any): number | undefined {
        if (!transcript?.words?.length || !sentence) return undefined;
        const originalWords = sentence.split(/\s+/).map(normalize).filter(Boolean);
        for (let i = 0; i <= transcript.words.length - originalWords.length; i++) {
            let match = true;
            for (let j = 0; j < originalWords.length; j++) {
                if (
                    normalize(transcript.words[i + j].word) !== originalWords[j]
                ) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return transcript.words[i].start;
            }
        }
        const fallback = transcript.words.find(
            (w: any) => normalize(w.word) === originalWords[0]
        );
        return fallback?.start;
    }
    function wordTime(transcript: any, word: string) {
        const w = transcript.words.find((w: any) => w.word.trim() === word.trim());
        return w ? formatTime(w.start) : "";
    }
    function formatTime(sec: number) {
        if (isNaN(sec)) return "";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    return (
        <Tabs defaultValue="fillers" className="w-full">
            <TabsList className="flex w-full bg-muted p-1 rounded-xl mb-3">
                <TabsTrigger value="questions" className="flex-1">Follow-up questions</TabsTrigger>
                <TabsTrigger value="fillers" className="flex-1">Filler words</TabsTrigger>
                <TabsTrigger value="volume" className="flex-1">Volume</TabsTrigger>
                <TabsTrigger value="formulation" className="flex-1">Formulation aid</TabsTrigger>
            </TabsList>
            <TabsContent value="questions">
                {(questions && questions.length > 0) ? (
                    <ul className="space-y-2">
                        {questions.map((q: string, i: number) => (
                            <li key={i} className="p-4 bg-blue-50 rounded-lg shadow">{q}</li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-muted-foreground">No follow-up questions detected.</div>
                )}
            </TabsContent>
            <TabsContent value="fillers">
                {(fillers && fillers.length > 0) ? (
                    <div className="flex flex-col gap-3">
                        {fillers.map((f: any, i: number) => {
                            const word = transcript.words.find((w: any) => w.word.trim() === f.word.trim());
                            return (
                                <Card
                                    key={i}
                                    className="cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all"
                                    onClick={() => {
                                        if (word && videoRef.current) videoRef.current.currentTime = word.start;
                                    }}
                                >
                                    <CardContent className="flex flex-col gap-2 p-4">
                                        <div className="flex items-center gap-2 font-bold text-blue-700">
                                            <span>{wordTime(transcript, f.word)}</span>
                                            <MessageCircle className="w-4 h-4" />
                                            Filler word: <span className="ml-1">{f.word}</span>
                                            <span className="ml-2 text-xs font-normal text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full">
                                                {f.count}×
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{f.explanation}</div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-muted-foreground">No filler words detected.</div>
                )}
            </TabsContent>
            <TabsContent value="volume">
                {(volumeIssues.length > 0) ? (
                    <div className="flex flex-col gap-3">
                        {volumeIssues.map((v: any, i: number) => (
                            <Card
                                key={i}
                                className="cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all"
                                onClick={() => videoRef.current && (videoRef.current.currentTime = v.timestamp)}
                            >
                                <CardContent className="flex flex-col gap-2 p-4">
                                    <div className="flex items-center gap-2 font-bold text-yellow-800">
                                        <span>{formatTime(v.timestamp)}</span>
                                        <Mic className="w-4 h-4" />
                                        {v.label}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{v.description}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted-foreground">No volume issues detected.</div>
                )}
            </TabsContent>
            <TabsContent value="formulation">
                {(formulation_aids && formulation_aids.length > 0) ? (
                    <div className="flex flex-col gap-3">
                        {formulation_aids.map((a: any, i: number) => {
                            const startTime = getSentenceStartTime(a.original, transcript);
                            return (
                                <Card
                                    key={i}
                                    className="border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer"
                                    onClick={() => {
                                        if (startTime !== undefined && videoRef.current)
                                            videoRef.current.currentTime = startTime;
                                    }}
                                >
                                    <CardContent className="flex flex-col gap-2 p-4">
                                        <div className="flex items-center gap-2 font-bold text-green-700">
                                            <Lightbulb className="w-4 h-4" />
                                            Formulation suggestion
                                            {startTime !== undefined && (
                                                <span className="ml-2 text-xs font-normal text-gray-400">
                                                    {formatTime(startTime)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm"><b>Original:</b> {a.original}</div>
                                        <div className="text-sm"><b>Suggestion:</b> {a.suggestion}</div>
                                        <div className="text-sm text-muted-foreground">{a.explanation}</div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-muted-foreground">No formulation aids detected.</div>
                )}
            </TabsContent>
        </Tabs>
    )
}
