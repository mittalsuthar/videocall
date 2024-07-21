import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import "./App.css";

function App() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("call", (call) => {
      if (mediaStreamRef.current) {
        call.answer(mediaStreamRef.current);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current
            .play()
            .catch((error) =>
              console.error("Failed to play remote stream", error)
            );
        });
      }
    });

    peerInstance.current = peer;
  }, []);

  const getUserMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = mediaStream;
      currentUserVideoRef.current.srcObject = mediaStream;
      await currentUserVideoRef.current.play();
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const call = (remotePeerId) => {
    if (mediaStreamRef.current) {
      const call = peerInstance.current.call(
        remotePeerId,
        mediaStreamRef.current
      );
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current
          .play()
          .catch((error) =>
            console.error("Failed to play remote stream", error)
          );
      });
    }
  };

  useEffect(() => {
    getUserMedia();
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Video Chat</h1>
        <p>
          Your ID: <span className="peer-id">{peerId}</span>
        </p>
      </header>
      <div className="video-container">
        <div className="video-wrapper">
          <h2>Your Video</h2>
          <video ref={currentUserVideoRef} autoPlay playsInline muted />
        </div>
        <div className="video-wrapper">
          <h2>Remote Video</h2>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
      </div>
      <div className="controls">
        <input
          type="text"
          value={remotePeerIdValue}
          onChange={(e) => setRemotePeerIdValue(e.target.value)}
          placeholder="Enter remote peer ID"
          className="peer-id-input"
        />
        <button onClick={() => call(remotePeerIdValue)} className="call-button">
          Call
        </button>
      </div>
    </div>
  );
}

export default App;
