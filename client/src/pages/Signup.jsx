import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Lock, Eye, EyeOff, User, Sprout, Store, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { registerAccount, createProfile } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import FarmBackground from '../components/ui/FarmBackground';

const RoleCard = ({ selected, onClick, title, icon: Icon, description }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 relative overflow-hidden rounded-2xl p-4 transition-all text-left ${
      selected 
        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500' 
        : 'bg-slate-900/50 border-white/5 hover:bg-slate-800/50 hover:border-white/10'
    } border`}
  >
    {selected && (
      <motion.div 
        layoutId="role-glow" 
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    )}
    <div className="relative z-10 flex flex-col h-full">
      <div className={`p-2 rounded-xl border mb-3 w-max ${
        selected ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className={`font-black uppercase tracking-widest text-sm mb-1 ${selected ? 'text-white' : 'text-slate-300'}`}>
        {title}
      </h3>
      <p className={`text-[10px] leading-relaxed ${selected ? 'text-emerald-300/80' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
  </button>
);

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();
  
  const [role, setRole] = useState(location.state?.defaultRole || 'Farmer');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError(t('phone_required_err'));
      return;
    }
    if (password.length < 6) {
      setError(t('password_min_err'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('password_match_err'));
      return;
    }

    setLoading(true);
    localStorage.setItem('user_role', role);

    try {
      const authData = await registerAccount({ phone, email, password, role });
      
      if (!authData.session) {
        throw new Error('Please verify your email or contact support (Disable Confirm Email in Supabase to enable auto-login).');
      }

      const { user, session } = authData;

      const profile = await createProfile({
        id: user.id,
        phone: phone,
        email: email || '',
        role: role,
      });

      login(session, profile);
      setSuccess(true);
      
      setTimeout(() => {
        navigate(role === 'Farmer' ? '/farmer-dashboard' : '/buyer-dashboard', { replace: true });
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FarmBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-emerald-500/10 blur-[100px] rounded-full point-events-none -z-10" />
          
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-50" />
            
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <Sprout className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{t('welcome_farmdirect')}</h2>
                  <p className="text-slate-400 font-medium">{t('provisioning_dashboard', { role: role.toLowerCase() })}</p>
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mt-8" />
                </motion.div>
              ) : (
                <motion.div key="form">
                  <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">{t('signup_title')}</h1>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('signup_subtitle')}</p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold flex items-center gap-3 mb-6"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div>
                      <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-3">{t('role_selection_label')}</label>
                      <div className="flex gap-4 h-36">
                        <RoleCard 
                          selected={role === 'Farmer'} 
                          onClick={() => setRole('Farmer')}
                          title={t('role_farmer')} 
                          icon={Sprout} 
                          description={t('farmer_desc')} 
                        />
                        <RoleCard 
                          selected={role === 'Buyer'} 
                          onClick={() => setRole('Buyer')}
                          title={t('role_buyer')} 
                          icon={Store} 
                          description={t('buyer_desc')} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-2">{t('phone_label')} *</label>
                        <div className="relative group/input">
                          <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/input:text-emerald-400 transition-colors" />
                          <input 
                            type="tel"
                            placeholder="+91 90000 00000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white font-bold text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-2">{t('phone_or_email')} ({t('optional') || 'Optional'})</label>
                        <div className="relative group/input">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/input:text-emerald-400 transition-colors" />
                          <input 
                            type="email"
                            placeholder="you@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white font-bold text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-2">{t('password_label')} *</label>
                        <div className="relative group/input">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/input:text-emerald-400 transition-colors" />
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-11 pr-12 py-3.5 text-white font-bold text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-2">{t('confirm_password_label')} *</label>
                        <div className="relative group/input">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/input:text-emerald-400 transition-colors" />
                          <input 
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-11 pr-12 py-3.5 text-white font-bold text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('processing')}
                        </>
                      ) : (
                        <>
                          {t('complete_registration')}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-slate-500 text-xs mt-8 font-bold">
                    {t('already_have_account')}{' '}
                    <Link to="/login" className="text-emerald-400 hover:text-white transition-colors underline decoration-emerald-500/30 underline-offset-4">
                      {t('sign_in_here')}
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </FarmBackground>
  );
};

export default Signup;
