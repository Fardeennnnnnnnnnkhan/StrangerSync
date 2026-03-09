import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, SkipForward, 
  Send, X, User, ShieldAlert 
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ChatPage = () => {
  const { 
    socket, room, partnerId, localStream,
    remoteStream, isWaiting, messages, setMessages,
    startMatching, leaveChat 
  } = useSocket();
  
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const chatEndRef = useRef();

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, room]); // Re-attach if room changes or stream updates

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    } else if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ isTyping }) => {
      setPartnerIsTyping(isTyping);
    };

    socket.on('partner-typing', handleTyping);
    return () => socket.off('partner-typing', handleTyping);
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerIsTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !room) return;

    socket.emit('send-message', {
      roomName: room,
      message: messageInput,
      senderId: socket.id
    });
    
    // Locally add own message
    setMessages(prev => [...prev, {
      message: messageInput,
      senderId: socket.id,
      timestamp: new Date()
    }]);
    
    setMessageInput('');
    socket.emit('typing', { roomName: room, isTyping: false });
  };

  const handleTypingInput = (e) => {
    setMessageInput(e.target.value);
    socket.emit('typing', { roomName: room, isTyping: e.target.value.length > 0 });
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isCamOn;
      setIsCamOn(!isCamOn);
    }
  };

  const handleNext = () => {
    leaveChat();
    startMatching(interests);
  };

  const addInterest = (e) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      const tag = interestInput.trim().toLowerCase();
      if (!interests.includes(tag)) {
        setInterests([...interests, tag]);
      }
      setInterestInput('');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col p-6 glass-morphism relative z-30">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">StrangerSync</h2>
        </div>

        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase mb-4 block">Match Preferences</label>
          <input 
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={addInterest}
            placeholder="Add interests..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none mb-4"
          />
          <div className="flex flex-wrap gap-2">
            {interests.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-lg text-xs">
                #{tag}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setInterests(interests.filter(i => i !== tag))} />
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-primary font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <SkipForward className="w-5 h-5" /> Next Stranger
          </button>
          <button 
            onClick={() => {
                leaveChat();
                window.location.reload();
            }}
            className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-all"
          >
            Stop
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {!room && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                    <div className="w-8 h-8 bg-primary rounded-full" />
                </motion.div>
                <h3 className="text-3xl font-black mb-2">{isWaiting ? "Looking for someone..." : "Ready to chat?"}</h3>
                <p className="text-gray-400 mb-8 max-w-xs">{isWaiting ? "We're matching you with someone based on your interests." : "Click start to begin your journey across the globe."}</p>
                {!isWaiting && <button onClick={() => startMatching(interests)} className="bg-primary px-12 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">Start Matching</button>}
            </div>
        )}

        {/* Videos */}
        <div className="flex-1 bg-black grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
          {/* Stranger Video */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center border border-white/5">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {!remoteStream && room && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Waiting for stranger's camera...</p>
                </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
                <div className="px-3 py-1 bg-black/60 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">Stranger</div>
            </div>
          </div>

          {/* Your Video */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-white/5">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!isCamOn ? 'hidden' : ''}`} />
            {!isCamOn && <div className="absolute inset-0 flex items-center justify-center"><VideoOff className="w-16 h-16 text-gray-700" /></div>}
            <div className="absolute top-4 left-4 px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">You</div>
            
            {/* Local Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 hover:opacity-100 transition-opacity">
                <button onClick={toggleMic} className={`p-3 rounded-xl ${isMicOn ? 'bg-white/10' : 'bg-danger'}`}><Mic className="w-5 h-5" /></button>
                <button onClick={toggleCam} className={`p-3 rounded-xl ${isCamOn ? 'bg-white/10' : 'bg-danger'}`}><Video className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="h-[35%] min-h-[250px] border-t border-white/10 flex flex-col glass-morphism">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.senderId === 'system' ? 'items-center' : msg.senderId === socket?.id ? 'items-end' : 'items-start'}`}>
                {msg.senderId === 'system' ? (
                    <div className="text-[10px] font-bold text-gray-500 bg-white/5 px-4 py-1 rounded-full uppercase tracking-widest my-2">{msg.message}</div>
                ) : (
                    <>
                        <div className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm ${msg.senderId === socket?.id ? 'bg-primary text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'}`}>
                            {msg.message}
                        </div>
                    </>
                )}
              </div>
            ))}
            {partnerIsTyping && (
                <div className="flex items-start">
                    <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                        <div className="flex gap-1"><div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" /><div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" /></div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-3">
            <input 
              type="text"
              value={messageInput}
              onChange={handleTypingInput}
              disabled={!room}
              placeholder={room ? "Send a message..." : "Match with someone to chat"}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button type="submit" disabled={!room || !messageInput.trim()} className="bg-primary p-3 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50"><Send className="w-5 h-5" /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
