import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const SupabaseService = {
  isAvailable(): boolean {
    return isSupabaseConfigured;
  },

  async uploadMealPhoto(base64Image: string, fileName: string): Promise<string | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, decode(base64Image), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        return null;
      }

      const { data: publicData } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(data.path);

      return publicData.publicUrl;
    } catch (err) {
      console.warn('Supabase upload exception:', err);
      return null;
    }
  },

  async syncMeal(meal: any): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('meals').upsert(meal);
      return !error;
    } catch (err) {
      console.warn('Supabase sync meal error:', err);
      return false;
    }
  },
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
