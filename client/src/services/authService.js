import { supabase } from '../lib/supabaseClient';

/**
 * AUTH SERVICE
 * Handles OTP sending, verification, profile creation and retrieval.
 */

const MOCK_AUTH = false; 
export const DEMO_MODE = true; // Set to true for hackathon/demo bypass

export const formatPhoneE164 = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length > 10) return `+${digits}`;
  return `+${digits}`;
};

/**
 * Sends a phone OTP via Supabase Auth.
 */
export const sendPhoneOtp = async (phone) => {
  if (MOCK_AUTH || DEMO_MODE) {
    console.warn("DEMO_MODE: Bypassing OTP send");
    return formatPhoneE164(phone);
  }
  
  const formattedPhone = formatPhoneE164(phone);
  const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
  if (error) throw error;
  return formattedPhone;
};

/**
 * Verifies the OTP received by the user.
 */
export const verifyPhoneOtp = async (phone, token) => {
  const formattedPhone = formatPhoneE164(phone);
  
  let result;
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
    });
    
    if (error) throw error;
    result = data;
  } catch (err) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: Bypassing OTP verification failure");
      const demoId = '00000000-0000-0000-0000-000000000000';
      result = {
        user: { id: demoId, phone: formattedPhone },
        session: { access_token: 'demo-token', user: { id: demoId, phone: formattedPhone } }
      };
    } else {
      throw err;
    }
  }

  const { data: authData } = { data: result }; // normalize

  // Ensure profile exists after successful verification
  if (authData?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from('profiles').insert([{
        id: authData.user.id,
        phone: authData.user.phone,
        role: localStorage.getItem('user_role') || 'Buyer', 
        name: '',
        location: '',
        has_set_password: false
      }]);
    }

    localStorage.setItem('prompt_password_set', 'true');
  }

  return authData;
};

/**
 * Sends an email OTP / Magic Link
 */
export const sendEmailLink = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
  return true;
};

/**
 * Standard fixed-password login via phone or email.
 */
export const signInWithPassword = async (identifier, password) => {
  const isEmail = identifier.includes('@');
  const loginData = isEmail ? { email: identifier, password } : { phone: formatPhoneE164(identifier), password };

  const { data, error } = await supabase.auth.signInWithPassword(loginData);
  
  if (error) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: Bypassing login failure");
      const demoId = '00000000-0000-0000-0000-000000000000'; // Valid UUID format
      return {
        session: { access_token: 'demo-token', user: { id: demoId, email: identifier } },
        user: { id: demoId, email: identifier }
      };
    }
    throw error;
  }
  return data;
};

/**
 * Standard fixed-password signup via phone or email.
 */
export const signUpWithPassword = async (identifier, password) => {
  const isEmail = identifier.includes('@');
  const signupData = isEmail ? { email: identifier, password } : { phone: formatPhoneE164(identifier), password };

  const { data, error } = await supabase.auth.signUp(signupData);
  if (error) throw error;
  return data;
};

/**
 * Custom full account Registration with dummy email fallback
 */
export const registerAccount = async ({ phone, email, password, role }) => {
  const formattedPhone = formatPhoneE164(phone);
  const finalEmail = email || `${formattedPhone.replace('+', '')}@farmdirect.com`;

  // 1. Sign up user via Email + Password (bypasses mandatory SMS OTP if Confirm Email is disabled)
  const { data, error } = await supabase.auth.signUp({
    email: finalEmail,
    password,
    options: {
      data: {
        phone: formattedPhone,
        role: role
      }
    }
  });

  if (error || !data?.session) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: Bypassing signup failure/verification");
      const dummyId = crypto.randomUUID();
      return {
        session: { access_token: 'demo-token', user: { id: dummyId, email: finalEmail } },
        user: { id: dummyId, email: finalEmail }
      };
    }
    if (error) throw error;
  }
  return data;
};

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getProfile = async (userId) => {
  try {
    let targetId = userId;
    
    if (!targetId) {
      if (MOCK_AUTH) {
        targetId = '00000000-0000-0000-0000-000000000000';
      } else {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Not authenticated');
        targetId = user.id;
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .maybeSingle();

    if (error) throw error;
    
    if (!data && DEMO_MODE) {
      const savedRole = localStorage.getItem('user_role') || 'Buyer';
      console.warn("DEMO_MODE: Profile not found, returning fallback role:", savedRole);
      return { id: targetId, phone: '', email: '', role: savedRole, name: 'Demo User', has_set_password: true };
    }
    
    return data;
  } catch (err) {
    if (DEMO_MODE) {
      const savedRole = localStorage.getItem('user_role') || 'Buyer';
      console.warn("DEMO_MODE: Bypassing Profile fetch failure, role:", savedRole);
      return { id: userId || 'demo-id', phone: '', email: '', role: savedRole, name: 'Demo User', has_set_password: true };
    }
    throw err;
  }
};

export const createProfile = async ({ id, phone, email, role, name = '', location = '', language = 'en' }) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id, phone, email: email || '', role, name, location, language, has_set_password: true }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    if (DEMO_MODE) {
      console.warn("DEMO_MODE: Bypassing profile creation failure", err.message);
      return { id, phone, email: email || '', role, name, location, language, has_set_password: true };
    }
    throw err;
  }
};

export const updateProfile = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const setUserPassword = async (password) => {
  // Update Supabase Auth native password explicitly for active user session
  const { data: authData, error: authError } = await supabase.auth.updateUser({ password });
  if (authError) throw authError;

  // Mark flag cleanly in profiles
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('profiles').update({ has_set_password: true }).eq('id', user.id);
  }

  // Clear prompt
  localStorage.removeItem('prompt_password_set');
  return authData;
};
