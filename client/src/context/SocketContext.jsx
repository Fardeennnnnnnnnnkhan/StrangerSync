import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const roomRef = useRef(null);
  const peerConnection = useRef(null);
  const iceCandidatesQueue = useRef([]);

  useEffect(() => {
    console.log("SocketProvider: Initializing connection...");
    const newSocket = io('https://strangersync-fardeen.onrender.com');
    setSocket(newSocket);

    // Get media early
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        console.log("SocketProvider: Media stream obtained");
        setLocalStream(stream);
      })
      .catch(err => console.error("SocketProvider: Media permission error:", err));

    return () => {
        console.log("SocketProvider: Closing socket...");
        newSocket.close();
    };
  }, []);

  const clearWebRTC = () => {
    console.log("SocketProvider: Clearing WebRTC state");
    if (peerConnection.current) {
      peerConnection.current.onicecandidate = null;
      peerConnection.current.ontrack = null;
      peerConnection.current.onconnectionstatechange = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }
    iceCandidatesQueue.current = [];
    setRemoteStream(null);
    setPartnerId(null);
    setRoom(null);
    roomRef.current = null;
  };

  const setupWebRTC = async (roomName) => {
    console.log("SocketProvider: Setting up RTCPeerConnection for", roomName);
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && roomRef.current) {
        socket.emit('webrtc-ice-candidate', { roomName: roomRef.current, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log("SocketProvider: Received remote track");
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
        console.log("SocketProvider: Connection state changed:", pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            clearWebRTC();
        }
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  };

  useEffect(() => {
    if (!socket) return;

    const onMatchFound = async ({ roomName, users }) => {
      console.log("SocketProvider: Match found!", roomName, users);
      const otherUser = users.find(id => id !== socket.id);
      
      roomRef.current = roomName;
      setRoom(roomName);
      setPartnerId(otherUser);
      setIsWaiting(false);
      
      const pc = await setupWebRTC(roomName);
      
      // Negotiate: user with "smaller" socket ID starts
      if (socket.id < otherUser) {
        console.log("SocketProvider: Initiating WebRTC offer as caller");
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('webrtc-offer', { roomName, offer });
        } catch (err) {
            console.error("SocketProvider: Error creating offer", err);
        }
      }
    };

    const onWebrtcOffer = async ({ offer }) => {
      console.log("SocketProvider: Received WebRTC offer");
      if (!peerConnection.current && roomRef.current) {
          await setupWebRTC(roomRef.current);
      }
      if (!peerConnection.current) return;

      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Add queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('webrtc-answer', { roomName: roomRef.current, answer });
      } catch (err) {
        console.error("SocketProvider: Error processing offer", err);
      }
    };

    const onWebrtcAnswer = async ({ answer }) => {
      console.log("SocketProvider: Received WebRTC answer");
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Add queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
          console.error("SocketProvider: Error processing answer", err);
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("SocketProvider: Error adding ICE candidate", e);
        }
      } else {
        iceCandidatesQueue.current.push(candidate);
      }
    };

    const onPartnerDisconnected = () => {
      console.log("SocketProvider: Partner disconnected");
      clearWebRTC();
    };

    const onWaiting = () => {
      console.log("SocketProvider: In waiting queue...");
      setIsWaiting(true);
    };

    const onReceiveMessage = (data) => {
      console.log("SocketProvider: Received message", data);
      setMessages(prev => [...prev, data]);
    };

    socket.on('match-found', onMatchFound);
    socket.on('webrtc-offer', onWebrtcOffer);
    socket.on('webrtc-answer', onWebrtcAnswer);
    socket.on('webrtc-ice-candidate', onIceCandidate);
    socket.on('partner-disconnected', onPartnerDisconnected);
    socket.on('waiting', onWaiting);
    socket.on('receive-message', onReceiveMessage);

    return () => {
      socket.off('match-found', onMatchFound);
      socket.off('webrtc-offer', onWebrtcOffer);
      socket.off('webrtc-answer', onWebrtcAnswer);
      socket.off('webrtc-ice-candidate', onIceCandidate);
      socket.off('partner-disconnected', onPartnerDisconnected);
      socket.off('waiting', onWaiting);
      socket.off('receive-message', onReceiveMessage);
    };
  }, [socket, localStream]); // Only rebuild when socket or localStream changes

  const startMatching = (interests) => {
    console.log("SocketProvider: Requesting match with interests:", interests);
    setMessages([]);
    socket.emit('join-queue', { interests });
  };

  const leaveChat = () => {
    console.log("SocketProvider: Leaving chat manually");
    if (roomRef.current) {
      socket.emit('leave-room', roomRef.current);
    }
    clearWebRTC();
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      room, 
      partnerId, 
      localStream, 
      setLocalStream,
      remoteStream, 
      isWaiting,
      messages,
      setMessages,
      startMatching, 
      leaveChat 
    }}>
      {children}
    </SocketContext.Provider>
  );
};
