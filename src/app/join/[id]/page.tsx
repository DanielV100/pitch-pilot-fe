"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { newPeer, wireSignalling } from "@/lib/websocket/webrtc"

export default function JoinPage() {
    const { id: room } = useParams<{ id: string }>()
    const localVideo = React.useRef<HTMLVideoElement>(null)
    const remoteVideo = React.useRef<HTMLVideoElement>(null)
    const [connected, setConnected] = React.useState(false)

    React.useEffect(() => {
        if (!room || !connected) return

        const ws = new WebSocket("ws://localhost:8000/api/v1/signaling/ws")
        const pc = newPeer()
        wireSignalling(pc, ws, room, /* isOfferer */ true)

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
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
            <main className="h-screen w-screen flex flex-col items-center justify-center gap-6">
                <h1 className="text-xl font-bold">Join training&nbsp;{room}</h1>
                <Button onClick={() => setConnected(true)}>Enable Cam &amp; Join</Button>
            </main>
        )

    return (
        <div className="grid grid-cols-2 h-screen">
            <video ref={localVideo} autoPlay playsInline muted className="w-full h-full object-cover" />
            <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
        </div>
    )
}
