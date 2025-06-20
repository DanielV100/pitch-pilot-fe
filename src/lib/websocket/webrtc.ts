/* eslint-disable @typescript-eslint/no-explicit-any */
export function newPeer() {
  return new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
}

export function wireSignalling(
  pc: RTCPeerConnection,
  ws: WebSocket,
  room: string,
  isOfferer: boolean
) {
  ws.onmessage = async (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.room !== room || msg.sender === ws.url) return;

    if (msg.type === "offer" && !isOfferer) {
      await pc.setRemoteDescription(msg.sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(
        JSON.stringify({ type: "answer", sdp: pc.localDescription, room })
      );
    } else if (msg.type === "answer" && isOfferer) {
      await pc.setRemoteDescription(msg.sdp);
    } else if (msg.type === "candidate") {
      await pc.addIceCandidate(msg.candidate);
    }
  };

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      ws.send(
        JSON.stringify({ type: "candidate", candidate: e.candidate, room })
      );
    }
  };
}
