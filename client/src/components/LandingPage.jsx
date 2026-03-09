import React from 'react';
import { motion } from 'framer-motion';
import { Video, Shield, Zap, Users, ArrowRight } from 'lucide-react';

const LandingPage = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-background text-white overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          StrangerSync
        </div>
        <div className="hidden md:flex gap-8 text-gray-400">
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
        <button 
          onClick={onStart}
          className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-full font-medium transition-all transform hover:scale-105"
        >
          Start Chat
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tight"
          >
            Connect with the <span className="gradient-text">World</span> Instantly.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            A premium anonymous video and text chat platform. Meet interesting people based on your passions or just random encounters.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
          >
            <button 
              onClick={onStart}
              className="group bg-white text-black px-10 py-5 rounded-2xl text-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all"
            >
              Get Started
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-background overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="user" />
                </div>
              ))}
              <div className="pl-6 text-gray-400 flex items-center">
                <span className="font-bold text-white mr-2">1,000+</span> users online
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-[120px] -z-10" />
      </section>

      {/* Features */}
      <section className="py-24 px-8 bg-black/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: <Zap className="text-primary" />, title: "Instant Match", desc: "No registration required. Get matched with a stranger in milliseconds." },
            { icon: <Shield className="text-accent" />, title: "Privacy First", desc: "Your calls are peer-to-peer. We don't store your video or text content." },
            { icon: <Users className="text-pink-500" />, title: "Interest Based", desc: "Enter your interests to find people with similar hobbies and topics." }
          ].map((f, i) => (
            <div key={i} className="glass-morphism p-8 rounded-3xl hover:border-white/20 transition-all">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-500">
        <p>© 2026 StrangerSync. Built for smooth connections.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
