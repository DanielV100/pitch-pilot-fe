/* eslint-disable @typescript-eslint/no-explicit-any */
export function newPeer() {
  return new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
}

export function wireSignalling(pc, ws, room, polite) {
  ws.onmessage = async (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(
        JSON.stringify({ type: "answer", sdp: pc.localDescription, room })
      );
    } else if (msg.type === "answer") {
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    } else if (msg.type === "candidate" && msg.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
    }
  };
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      ws.send(
        JSON.stringify({ type: "candidate", candidate: e.candidate, room })
      );
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
