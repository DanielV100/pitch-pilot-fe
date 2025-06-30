"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Document, Page, pdfjs } from "react-pdf"
import { newPeer, wireSignalling } from "@/lib/websocket/webrtc"

pdfjs.GlobalWorkerOptions.workerSrc =
    `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`

export default function JoinPage() {
    const { id: room } = useParams<{ id: string }>()
    const [connected, setConnected] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [fileUrl, setFileUrl] = React.useState<string>("")
    const [numPages, setNumPages] = React.useState(0)
    const localVideo = React.useRef<HTMLVideoElement>(null)
    const remoteVideo = React.useRef<HTMLVideoElement>(null)
    const pcRef = React.useRef<RTCPeerConnection | null>(null)
    const wsRef = React.useRef<WebSocket | null>(null)

    React.useEffect(() => {
        if (!room || !connected) return

        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/v1/ws/signaling/join`);
        wsRef.current = ws;

        const pc = newPeer();
        pcRef.current = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate && ws?.readyState === 1) {
                ws.send(JSON.stringify({ type: "candidate", candidate: event.candidate, room }));
            }
        };
        pc.onnegotiationneeded = async () => {
            try {
                if (ws?.readyState !== 1) return;
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                ws.send(JSON.stringify({ type: "offer", sdp: pc.localDescription, room }));
            } catch (err) {
                console.error("Error creating offer:", err);
            }
        };

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if (localVideo.current) localVideo.current.srcObject = stream;
            stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        });

        pc.ontrack = (ev) => {
            if (remoteVideo.current) remoteVideo.current.srcObject = ev.streams[0];
        };

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join", room }));
            ws.send(JSON.stringify({ type: "request_slide_sync", room }));
        };

        ws.onmessage = async (e) => {
            if (!pc) return;
            try {
                const msg = JSON.parse(e.data);
                if (msg.type === "answer") {
                    await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                } else if (msg.type === "candidate") {
                    await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
                }
                else if (msg.type === "slide_change") {
                    if (typeof msg.page === "number") setPage(msg.page);
                    if (msg.fileUrl) setFileUrl(msg.fileUrl);
                }
            } catch (err) {
                console.error("Failed to process message:", err)
            }
        };

        return () => {
            pc.close();
            ws.close();
        };
    }, [connected, room]);
    if (!connected)
        return (
            <div className="h-screen flex items-center justify-center">
                <div>
                    <h1>Join Room: <span className="font-mono">{room}</span></h1>
                    <button className="mt-4 px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setConnected(true)}>
                        Join with Camera and View Slides
                    </button>
                </div>
            </div>
        )

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
            <div className="flex gap-6 mb-6">
                {/* Local video (you) */}
                <div>
                    <div className="text-xs text-center mb-1 text-gray-400">You</div>
                    <video
                        ref={localVideo}
                        autoPlay
                        playsInline
                        muted
                        className="w-64 h-40 rounded-md bg-black object-cover border shadow"
                    />
                </div>
                <div>
                    <div className="text-xs text-center mb-1 text-gray-400">Host</div>
                    <video
                        ref={remoteVideo}
                        autoPlay
                        playsInline
                        className="w-64 h-40 rounded-md bg-black object-cover border shadow"
                    />
                </div>
            </div>
            <div className="mb-4">
                {fileUrl ? (
                    <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                        <Page pageNumber={page} width={900} renderAnnotationLayer={false} renderTextLayer={false} />
                    </Document>
                ) : (
                    <div className="text-gray-400 text-xl">Waiting for slides…</div>
                )}
            </div>
            <div className="mt-6 text-gray-400 text-xs">Room: <span className="font-mono">{room}</span></div>
        </div>
    )
}
