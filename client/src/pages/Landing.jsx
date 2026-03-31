import React, { useEffect } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, ArrowRight, Store, Tractor } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from '../components/LanguageSelector';
import FarmBackground from '../components/ui/FarmBackground';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';

const Landing = () => {
  const navigate = useRouterNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
     const storedLang = localStorage.getItem('farmdirect_lang');
     if(storedLang) i18n.changeLanguage(storedLang);
  }, [i18n]);

  const handleRoleSelection = (role) => {
    navigate('/signup', { state: { defaultRole: role } });
  };

  return (
    <FarmBackground>
      <div className="min-h-screen font-sans transition-colors duration-300 relative flex flex-col">
        
        {/* Navigation */}
        <nav className="fixed w-full z-50 backdrop-blur-md border-b border-white/5 bg-slate-950/20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between items-center h-24">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="bg-primary-500/20 p-2.5 rounded-2xl border border-primary-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                   <Sprout className="h-7 w-7 text-primary-500" />
                </div>
                <span className="text-3xl font-black text-white tracking-tighter">FarmDirect</span>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-8">
                <LanguageSelector />
                <AnimatedButton 
                  variant="outline" 
                  className="hidden sm:flex"
                  onClick={() => handleRoleSelection('Buyer')}
                >
                  Login
                </AnimatedButton>
              </motion.div>
            </div>
          </div>
        </nav>

        <main className="flex-1 pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="max-w-4xl space-y-8 mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">
               Futuristic Agriculture Ecosystem
            </div>
            <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter leading-[0.9]">
              Direct from <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary-600">Farm to Table.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Connecting local farmers directly with consumers through a premium, transparent, and sustainable digital marketplace.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-6">
               <AnimatedButton onClick={() => handleRoleSelection('Buyer')} icon={ArrowRight}>
                  Explore Marketplace
               </AnimatedButton>
               <AnimatedButton variant="secondary" onClick={() => handleRoleSelection('Farmer')}>
                  Join as Producer
               </AnimatedButton>
            </div>
          </motion.div>

          {/* Role Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
              {/* Farmer Card */}
              <GlassCard className="group p-10 text-left border-l-4 border-l-primary-500/50" delay={0.2}>
                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-8 border border-primary-500/20 group-hover:bg-primary-500/20 transition-colors">
                  <Tractor className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">I am a Farmer</h3>
                <ul className="space-y-2 mb-10">
                  {['🤖 AI Demand & Crop Predictions', '🎤 Voice-Powered Inventory Entry', '💰 Smart Price Suggestions', '📊 Real-Time Earnings Dashboard'].map(f => (
                    <li key={f} className="text-slate-400 text-sm font-medium flex items-start gap-2">{f}</li>
                  ))}
                </ul>
                <AnimatedButton variant="outline" className="w-full sm:w-auto" onClick={() => handleRoleSelection('Farmer')} icon={ArrowRight}>
                  Get Started
                </AnimatedButton>
              </GlassCard>

              {/* Buyer Card */}
              <GlassCard className="group p-10 text-left border-l-4 border-l-emerald-400/50" delay={0.3}>
                <div className="w-16 h-16 bg-emerald-400/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-400/20 group-hover:bg-emerald-400/20 transition-colors">
                  <Store className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">I am a Buyer</h3>
                <ul className="space-y-2 mb-10">
                  {['⚡ Flash Deals with Live Countdown', '🌾 Pre-Order Future Harvests', '🚚 Integrated Transport Booking', '⭐ Verified Farmer Ratings'].map(f => (
                    <li key={f} className="text-slate-400 text-sm font-medium flex items-start gap-2">{f}</li>
                  ))}
                </ul>
                <AnimatedButton variant="outline" className="w-full sm:w-auto" onClick={() => handleRoleSelection('Buyer')} icon={ArrowRight}>
                  Start Shopping
                </AnimatedButton>
              </GlassCard>
          </div>

          {/* AI Features Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-6xl mt-6"
          >
            <GlassCard className="border-none bg-white/3 py-8 px-10" delay={0.5}>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] text-center mb-6">Powered By</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🧠', label: 'AI Intelligence', desc: 'Seasonal demand analysis' },
                  { icon: '🎤', label: 'Voice Assistant', desc: 'Hands-free product entry' },
                  { icon: '📡', label: 'Real-Time Sync', desc: 'Live Supabase updates' },
                  { icon: '🚚', label: 'Smart Logistics', desc: 'Transport & cold chain' },
                ].map(f => (
                  <div key={f.label} className="text-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                    <span className="text-2xl block mb-2">{f.icon}</span>
                    <p className="text-xs font-black text-white">{f.label}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </main>

        <footer className="mt-20 py-16 text-center border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
          <div className="flex flex-col items-center space-y-6">
             <div className="flex items-center space-x-3 grayscale opacity-30">
               <Sprout className="h-5 w-5 text-white" />
               <span className="text-xl font-bold text-white tracking-widest uppercase">FarmDirect</span>
             </div>
             <div className="flex space-x-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Contact Support</a>
             </div>
             <p className="text-slate-600 text-[10px] font-bold tracking-[0.3em] uppercase">
                &copy; {new Date().getFullYear()} FarmDirect Global Ecosystem. Advanced Agricultural Platform.
             </p>
          </div>
        </footer>
      </div>
    </FarmBackground>
  );
};

export default Landing;
