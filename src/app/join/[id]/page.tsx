"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { newPeer, wireSignalling } from "@/lib/websocket/webrtc"

export default function JoinPage() {
    const { id: room } = useParams<{ id: string }>()
    const localVideo = React.useRef<HTMLVideoElement>(null)
    const remoteVideo = React.useRef<HTMLVideoElement>(null)
    const [connected, setConnected] = React.useState(false)

    React.useEffect(() => {
        if (!room || !connected) return

        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/v1/ws/signaling/join`)
        const pc = newPeer()
        wireSignalling(pc, ws, room, true)

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if (localVideo.current) localVideo.current.srcObject = stream
            stream.getTracks().forEach((t) => pc.addTrack(t, stream))
        })

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            ws.send(JSON.stringify({ type: "offer", sdp: pc.localDescription, room }))
        }

        pc.ontrack = (ev) => {
            if (remoteVideo.current) remoteVideo.current.srcObject = ev.streams[0]
        }

        ws.onopen = () => ws.send(JSON.stringify({ type: "join", room }))

        return () => {
            pc.close()
            ws.close()
        }
    }, [connected, room])

    if (!connected)
        return (
            <main className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="w-full max-w-lg rounded-2xl shadow-xl border-none">
                        <CardHeader>
                            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
                                Join Training Room
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                You’re about to join room:
                                <span className="ml-2 font-mono text-foreground">{room}</span>
                            </p>
                            <Button size="lg" className="w-full" onClick={() => setConnected(true)}>
                                Enable Camera & Join
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        )

    return (
        <div className="h-screen w-screen grid md:grid-cols-2 bg-black relative">
            <video
                ref={localVideo}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover opacity-80"
            />
            <video
                ref={remoteVideo}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-background/80 text-sm px-4 py-2 rounded-xl shadow-md border text-muted-foreground">
                Room: <span className="text-foreground font-mono">{room}</span>
            </div>
        </div>
    )
}
