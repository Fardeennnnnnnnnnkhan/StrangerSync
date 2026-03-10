import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, SkipForward, 
  Send, X, User, ShieldAlert, Dna, Search,
  ArrowRight, Settings, Info, MessageSquare, Menu,
  Globe, Shield, Zap, Power
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const chatEndRef = useRef();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, room]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    } else if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!socket) return;
    const handleTyping = ({ isTyping }) => setPartnerIsTyping(isTyping);
    socket.on('partner-typing', handleTyping);
    return () => socket.off('partner-typing', handleTyping);
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerIsTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !room) return;
    socket.emit('send-message', { roomName: room, message: messageInput, senderId: socket.id });
    setMessages(prev => [...prev, { message: messageInput, senderId: socket.id, timestamp: new Date() }]);
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
      if (!interests.includes(tag)) setInterests([...interests, tag]);
      setInterestInput('');
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden font-display selection:bg-primary selection:text-black">
      <div className="noise-overlay" />
      <div className="fixed inset-0 mesh-gradient opacity-30 pointer-events-none -z-10" />

      {/* Mobile Trigger */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-4 rounded-2xl glass-panel text-primary"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar - Pro Layout */}
      <motion.aside 
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -340 }}
        className="fixed lg:static inset-y-0 left-0 w-[340px] flex flex-col p-8 glass-panel border-r border-white/[0.05] z-40 transition-transform duration-500 ease-[0.16, 1, 0.3, 1]"
      >
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Dna className="w-8 h-8 text-primary" />
             <h2 className="text-2xl font-black tracking-tighter">Sync Core</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-muted hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 space-y-12 overflow-y-auto no-scrollbar">
          <section>
             <label className="text-[10px] font-mono font-black text-muted uppercase tracking-[0.2em] mb-6 block">Target Interests</label>
             <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={addInterest}
                  placeholder="Coding, Design, Music..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.08] transition-all"
                />
             </div>
             <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {interests.map(tag => (
                    <motion.span 
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight border border-primary/20"
                    >
                      {tag}
                      <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setInterests(interests.filter(i => i !== tag))} />
                    </motion.span>
                  ))}
                </AnimatePresence>
             </div>
          </section>

          <section className="p-6 rounded-3xl glass-panel bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Trust Status</span>
            </div>
            <p className="text-sm text-muted leading-relaxed font-medium">
              Encrypted P2P tunnel active. No data transit via central nodes.
            </p>
          </section>
        </div>

        <div className="pt-8 space-y-4 border-t border-white/[0.05]">
          <button 
            onClick={handleNext}
            className="w-full py-5 rounded-3xl bg-primary text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-neon flex items-center justify-center gap-3"
          >
            <SkipForward className="w-5 h-5" /> Pulse Next
          </button>
          <button 
            onClick={() => { leaveChat(); window.location.reload(); }}
            className="w-full py-5 rounded-3xl bg-white/[0.04] text-muted font-bold text-xs uppercase tracking-[0.1em] hover:bg-white/[0.08] hover:text-white transition-all border border-white/[0.05]"
          >
            Disconnect
          </button>
        </div>
      </motion.aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative px-4 py-4 lg:px-8 lg:py-6">
        {/* Connection Overlay */}
        <AnimatePresence>
          {!room && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl px-8 text-center"
            >
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                 className="relative w-48 h-48 md:w-64 md:h-64 mb-12"
               >
                 <div className="absolute inset-0 border-[2px] border-dashed border-primary/20 rounded-full" />
                 <div className="absolute inset-4 border border-white/5 rounded-full blur-xl" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Dna className="w-16 h-16 text-primary animate-pulse" />
                 </div>
               </motion.div>

               <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">
                  {isWaiting ? "Sequencing Matches" : "Protocol Ready"}
               </h3>
               <p className="text-muted mb-12 max-w-sm text-lg font-medium leading-relaxed">
                  {isWaiting ? "Synchronizing global network nodes to find the optimal sync partner." : "Your tunnel is ready. Establish a new spontaneous connection."}
               </p>

               {!isWaiting && (
                 <button 
                   onClick={() => startMatching(interests)}
                   className="group bg-primary text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-neon hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                 >
                   Establish Sync <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-all" />
                 </button>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Workspace */}
        <div className="flex-1 flex flex-col gap-6 md:gap-8 min-h-0">
          <div className="flex-1 responsive-video-grid min-h-0">
            {/* Observer Container */}
            <div className="relative rounded-[2.5rem] overflow-hidden glass-panel border-white/[0.05] group">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <AnimatePresence>
                {!remoteStream && room && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
                  >
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.3em]">Awaiting Uplink</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 glass-pill text-white/80">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Stranger</span>
              </div>
            </div>

            {/* Source Container */}
            <div className="relative rounded-[2.5rem] overflow-hidden glass-panel border-white/[0.05] group">
               <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-700 ${!isCamOn ? 'opacity-0' : 'opacity-100'}`} />
               {!isCamOn && (
                 <div className="absolute inset-0 flex items-center justify-center bg-surface">
                   <VideoOff className="w-12 h-12 text-muted/30" />
                 </div>
               )}
               
               <div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 glass-pill border-primary/20 bg-primary/10">
                 <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(234,254,124,0.5)]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">You</span>
               </div>

               {/* Precision Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2 glass-pill border-white/[0.08] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <button 
                    onClick={toggleMic}
                    className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-white/5 text-muted hover:text-white hover:bg-white/10' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={toggleCam}
                    className={`p-4 rounded-full transition-all ${isCamOn ? 'bg-white/5 text-muted hover:text-white hover:bg-white/10' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}
                  >
                    {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
               </div>
            </div>
          </div>

          {/* Chat Environment */}
          <div className="h-[35%] lg:h-[400px] glass-panel rounded-[2.5rem] flex flex-col overflow-hidden border-white/[0.05]">
            <header className="px-8 py-5 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
               <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-muted">Secure_Link_Established</span>
               </div>
               <div className="flex gap-4">
                  <Globe className="w-4 h-4 text-muted hover:text-primary transition-colors cursor-pointer" />
                  <Settings className="w-4 h-4 text-muted hover:text-primary transition-colors cursor-pointer" />
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar scroll-smooth">
               <AnimatePresence mode="popLayout">
                 {messages.map((msg, i) => (
                   <motion.div 
                     key={i}
                     layout
                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className={`flex flex-col ${msg.senderId === 'system' ? 'items-center' : msg.senderId === socket?.id ? 'items-end' : 'items-start'}`}
                   >
                     {msg.senderId === 'system' ? (
                       <div className="px-6 py-2 bg-white/[0.03] border border-white/[0.05] rounded-full text-[10px] font-black uppercase tracking-widest text-primary/60 my-4">
                          {msg.message}
                       </div>
                     ) : (
                       <div className={`max-w-[85%] md:max-w-[70%] px-7 py-5 rounded-[1.8rem] text-[15px] font-medium leading-relaxed ${
                         msg.senderId === socket?.id 
                           ? 'bg-primary text-black font-black rounded-tr-none' 
                           : 'bg-white/[0.04] border border-white/[0.08] text-white rounded-tl-none backdrop-blur-xl'
                       }`}>
                          {msg.message}
                       </div>
                     )}
                   </motion.div>
                 ))}
               </AnimatePresence>
               {partnerIsTyping && (
                 <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                    <div className="bg-white/[0.04] border border-white/[0.08] px-5 py-4 rounded-3xl rounded-tl-none flex gap-1.5">
                       <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                       <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                       <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                    </div>
                 </motion.div>
               )}
               <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-8 pt-0 flex gap-4">
               <input 
                 value={messageInput}
                 onChange={handleTypingInput}
                 disabled={!room}
                 placeholder={room ? "Tap to type..." : "Establishing connection lock..."}
                 className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-8 py-5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.08] transition-all disabled:opacity-20 placeholder:text-muted"
               />
               <button 
                type="submit"
                disabled={!room || !messageInput.trim()}
                className="p-5 bg-primary text-black rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-neon"
               >
                 <Send className="w-5 h-5" />
               </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
