import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Shield, Zap, Users, ArrowRight, Globe, Dna, Menu, X, Rocket, Sparkles, MessageSquare, Heart } from 'lucide-react';
import OrbitImages from './OrbitImages';

const LandingPage = ({ onStart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const orbitImages = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
  ];

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-black">
      <div className="noise-overlay" />
      
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none -z-10 opacity-30 shrink-0" />

      {/* Modern Capsule Navigation */}
      <motion.nav 
        initial={{ y: -100, x: '-50%' }}
        animate={{ 
          y: 0, 
          x: '-50%',
          width: scrolled ? 'max-content' : '90%',
          backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.8)' : 'rgba(10, 10, 10, 0.4)'
        }}
        className={`fixed top-8 left-1/2 z-50 glass-pill px-8 py-3.5 flex items-center justify-between gap-16 transition-all duration-700 backdrop-blur-3xl shadow-2xl border-white/[0.08] ${scrolled ? 'px-6' : 'max-w-[1400px]'}`}
      >
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="bg-primary p-2.5 rounded-xl shadow-[0_0_30px_rgba(234,254,124,0.3)] group-hover:scale-110 group-active:scale-95 transition-all duration-500">
            <Dna className="w-5 h-5 text-black" />
          </div>
          <span className="font-heading font-black text-2xl tracking-tighter">StrangerSync</span>
        </div>

        <div className="hidden lg:flex items-center gap-12">
          {['Features', 'Security', 'About'].map(item => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-[10px] font-black text-muted hover:text-primary transition-all uppercase tracking-[0.3em] hover:tracking-[0.4em]"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
           <button 
            onClick={onStart}
            className="hidden sm:flex bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] py-3.5 px-10 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(234,254,124,0.2)] whitespace-nowrap"
          >
            Launch Core
          </button>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-muted hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-3xl p-12 flex flex-col items-center justify-center gap-12"
          >
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-10 right-10 text-muted hover:text-white">
              <X className="w-8 h-8" />
            </button>
            {['Features', 'Security', 'About'].map(item => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-4xl font-heading font-black hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
            <button onClick={onStart} className="w-full max-w-sm bg-primary text-black py-6 rounded-3xl font-black text-xl shadow-neon">Start Meeting</button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="section-container pt-44 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24 relative"
        >
          {/* Left Side: Content */}
          <div className="flex-1 flex flex-col gap-10 z-10 text-center lg:text-left items-center lg:items-start">
            <motion.div variants={itemVariants} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] px-6 py-3 rounded-full w-fit group cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_10px_#eafe7c]"></span>
              </span>
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-muted group-hover:text-primary transition-colors duration-500">
                P2P_NETWORK_ESTABLISHED // 2.4K_NODES
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl lg:text-[100px] font-light leading-[0.9] tracking-[-0.04em] text-glow">
              Real People. <br />
              <span className="font-black text-primary tracking-[-0.06em]">Spontaneous.</span> <br />
              Connections.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted leading-relaxed max-w-xl text-balance font-medium lg:pr-12">
              Sync with the world. No trackers, no bloat, just pure encrypted human connection in high-fidelity.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 mt-4 w-full sm:w-auto">
              <button 
                onClick={onStart}
                className="group animate-shimmer bg-primary text-black text-xs font-black uppercase tracking-[0.2em] py-6 px-14 rounded-[2.5rem] hover:scale-105 transition-all shadow-[0_20px_60px_rgba(234,254,124,0.15)] flex items-center justify-center gap-4 active:scale-95"
              >
                Sync Now <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <button className="glass-panel border-white/10 px-14 py-6 text-xs font-black uppercase tracking-[0.2em] rounded-[2.5rem] hover:bg-white/[0.04] transition-all">
                The Protocol
              </button>
            </motion.div>
          </div>

          {/* Right Side: Massive Industry-Standard Orbit */}
          <motion.div 
            variants={itemVariants}
            className="flex-1 w-full relative min-h-[400px] lg:min-h-[700px] flex items-center justify-center pointer-events-none lg:pointer-events-auto"
          >
            <OrbitImages 
              images={orbitImages}
              shape="ellipse"
              radiusX={600}
              radiusY={220}
              duration={40}
              itemSize={130}
              rotation={-10}
              showPath={true}
              pathColor="rgba(234, 254, 124, 0.08)"
              pathWidth={1}
              responsive={true}
              className="w-full h-full scale-110 lg:scale-125 transition-transform duration-1000"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Grid */}
      <section className="section-container py-32 border-t border-white/[0.05]" id="features">
        <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
          {[
            { icon: <Shield className="w-8 h-8"/>, title: "Zero Data Footprint", desc: "No databases. No logs. No history. Your identity exists only during the sync." },
            { icon: <Zap className="w-8 h-8"/>, title: "Nano Latency", desc: "Built on custom WebRTC pipelines for instantaneous video feedback globally." },
            { icon: <Heart className="w-8 h-8"/>, title: "Vibe Moderation", desc: "AI-powered real-time detection ensures a safe, non-toxic environment." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="flex flex-col gap-8"
            >
              <div className="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center text-primary">
                {feature.icon}
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight">{feature.title}</h3>
                <p className="text-muted leading-relaxed font-medium">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Global Status Footer */}
      <footer className="section-container border-t border-white/[0.05] py-20 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Dna className="w-8 h-8 text-primary" />
              <span className="font-heading font-black text-3xl tracking-tighter">StrangerSync</span>
            </div>
            <p className="text-muted max-w-sm text-sm font-medium">The world's most lightweight, privacy-focused spontaneous video protocol.</p>
          </div>

          <div className="flex flex-wrap gap-12 md:gap-24">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-muted tracking-widest">Protocol</h4>
              <nav className="flex flex-col gap-3">
                {['Direct Connect', 'Stun/Turn', 'Latency Map'].map(link => (
                  <a key={link} href="#" className="text-sm font-bold hover:text-primary transition-colors">{link}</a>
                ))}
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-muted tracking-widest">Legal</h4>
              <nav className="flex flex-col gap-3">
                {['Privacy Policy', 'Safety Guide', 'Zero Log Registry'].map(link => (
                  <a key={link} href="#" className="text-sm font-bold hover:text-primary transition-colors">{link}</a>
                ))}
              </nav>
            </div>
          </div>
        </div>
        
        <div className="mt-24 flex flex-col sm:flex-row justify-between items-center gap-8 pt-12 border-t border-white/[0.03]">
          <p className="font-mono text-[10px] text-muted">© 2026 STRANGERSYNC CORE // VER_4.02_STABLE</p>
          <div className="flex items-center gap-6 glass-panel px-6 py-3 rounded-full border-none">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-border border border-transparent shadow-[0_0_10px_#22c55e]" />
                System Nominal
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
