import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { UserCircle, MapPin, Save, Loader2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProfile, updateProfile } from '../../services/authService';

const FarmerProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState({ name: '', location: '', phone: '', avatar: '', rating: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);  useEffect(() => {
    fetchProfile();
  }, [user]);


  const fetchProfile = async () => {
    try {
      const data = await getProfile(user?.id);
      if (data) {
        setProfile({
          name: data.name || '',
          location: data.location || '',
          phone: data.phone || user?.phone || '',
          avatar: data.avatar || '',
          rating: data.average_rating || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: profile.name,
        location: profile.location,
      });
      if (updated) {
        setProfile(prev => ({ ...prev, name: updated.name || prev.name, location: updated.location || prev.location }));
      }
      setIsEditing(false);
    } catch (err) {
      alert(t('error_update_profile') + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto shadow-xl"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('profile_title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('profile_desc')}</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors border border-slate-700">
            {t('btn_edit_profile')}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="w-32 h-32 rounded-2xl bg-slate-800 flex flex-col justify-center items-center overflow-hidden border border-slate-700 shrink-0 relative">
          {profile.avatar ? (
            <img src={profile.avatar} className="w-full h-full object-cover" alt="avatar" />
          ) : (
            <UserCircle className="w-16 h-16 text-slate-600 mb-2" />
          )}
          {profile.rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center border border-white/10">
              <Star className="w-3 h-3 text-amber-500 mr-1 fill-current" />
              <span className="text-xs font-bold text-white">{profile.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-5 w-full">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('farm_name_label')}</label>
            <div className="relative">
              <UserCircle className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                disabled={!isEditing}
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50 transition-all text-white placeholder-slate-500"
                placeholder={t('farm_name_placeholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('location_label')}</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                disabled={!isEditing}
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50 transition-all text-white placeholder-slate-500"
                placeholder={t('location_placeholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t('phone_registered')}</label>
            <input
              type="text"
              disabled
              value={profile.phone}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl opacity-50 text-slate-400 cursor-not-allowed"
            />
          </div>

          {isEditing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 flex justify-end space-x-3 border-t border-slate-800 mt-6">
              <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-400 hover:text-white transition-colors">
                {t('btn_cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold flex items-center transition-all shadow-lg"
              >
                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {t('btn_save')}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FarmerProfile;
