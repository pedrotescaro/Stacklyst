import { supabase } from './supabase';
// Router deep-link listeners and the auth browser may both deliver one code.
// Share that one exchange without persisting authentication material.
const exchanges = new Map<string, Promise<string>>();
export function exchangeCallback(code: string, type?: 'recovery' | 'email' | 'signup') {
  const key = (type ?? 'code') + ':' + code;
  let pending = exchanges.get(key);
  if (!pending) {
    pending = (async () => {
      const { data, error } = type
        ? await supabase.auth.verifyOtp({ token_hash: code, type })
        : await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      if (!data.user) throw new Error('Não foi possível confirmar sua identidade.');
      return data.user.id;
    })();
    exchanges.set(key, pending);
    setTimeout(() => exchanges.delete(key), 120000);
  }
  return pending;
}
