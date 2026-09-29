import React, { useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Icon } from '@/components/Icon';
import { Images } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import { draft } from '@/onboarding/steps';

type Provider = 'oauth_apple' | 'oauth_google' | 'email' | 'guest';

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, completeOnboarding, updateProfile } = useApp();
  const [busy, setBusy] = useState<Provider | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { width, height } = useWindowDimensions();

  const isWebDesktop = Platform.OS === 'web' && width > 500;
  const screenWidth = isWebDesktop ? Math.min(width, 420) : width;
  const screenHeight = isWebDesktop ? Math.min(height, 890) : height;

  const plan =
    draft.plan ||
    (profile.dailyCalories
      ? {
          calories: profile.dailyCalories,
          protein: profile.proteinG,
          carbs: profile.carbsG,
          fat: profile.fatG,
        }
      : null);

  const signInWith = async (strategy: Provider) => {
    if (busy) return;

    if (strategy === 'email') {
      if (!showEmailInput) {
        setShowEmailInput(true);
        return;
      }
      const trimmed = email.trim();
      if (!trimmed || !trimmed.includes('@')) {
        setEmailError('Please enter a valid email address');
        return;
      }
      setEmailError('');
    }

    setBusy(strategy);
    try {
      await completeOnboarding();
      if (strategy === 'email' && email.trim()) {
        await updateProfile({ email: email.trim() });
      }
      router.replace('/home');
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View
      className="flex-1 bg-[#E8F3E5] items-center justify-center"
      style={isWebDesktop ? { height: '100vh' as any, overflow: 'hidden' } : undefined}
    >
      <StatusBar style="dark" />

      {/* Screen Container */}
      <View
        style={{
          width: isWebDesktop ? screenWidth : '100%',
          height: isWebDesktop ? screenHeight : '100%',
          borderRadius: isWebDesktop ? 40 : 0,
          overflow: 'hidden',
          backgroundColor: '#F4FCF2',
          ...(isWebDesktop
            ? {
                boxShadow: '0 20px 50px rgba(30, 80, 40, 0.16), 0 4px 16px rgba(0, 0, 0, 0.08)',
                borderWidth: 1,
                borderColor: '#D8EBD5',
              }
            : {}),
        }}
        className="flex-1 w-full"
      >
        {/* Splash background with leaves */}
        <Image
          source={Images.splashBg}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
          priority="high"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'space-between',
              paddingTop: (isWebDesktop ? 20 : insets.top) + 4,
              paddingBottom: (isWebDesktop ? 24 : insets.bottom) + 12,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation */}
            <View className="h-[28px] flex-row items-center px-[26px]">
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                className="active:opacity-70"
              >
                <Icon name="arrow.left" size={22} color="#1E6B35" />
              </Pressable>
            </View>

            {/* Center Content */}
            <View className="items-center justify-center px-[26px] py-[16px]">
              <Image
                source={Images.saladoLogo}
                style={{ width: 180, height: 90 }}
                contentFit="contain"
              />

              <Text className="mt-[16px] text-center text-[28px] font-bold leading-[34px] text-[#111827]">
                {plan ? 'Save your plan' : 'Welcome back'}
              </Text>

              <Text className="mt-[6px] max-w-[310px] text-center text-[15px] leading-[21px] text-[#4F6452]">
                {plan
                  ? 'Sign in to sync your targets, track calories and keep your daily streak.'
                  : 'Sign in to access your meal logs, daily targets and progress.'}
              </Text>

              {/* Plan Target Card */}
              {plan ? (
                <View className="mt-[20px] w-full max-w-[340px] rounded-[18px] border border-[#D8EBD5] bg-white/95 p-[14px] shadow-sm">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-[#E8F5E9]">
                        <Icon name="checkmark.circle.fill" size={18} color="#2A8333" />
                      </View>
                      <Text className="ml-[10px] text-[15px] font-semibold text-[#111827]">
                        Personalized Plan
                      </Text>
                    </View>
                    <View className="rounded-full bg-[#EBF6E9] px-[10px] py-[3px]">
                      <Text className="text-[13px] font-bold text-[#1E6B35]">
                        {plan.calories.toLocaleString('en-US')} cal
                      </Text>
                    </View>
                  </View>

                  {plan.protein ? (
                    <View className="mt-[10px] flex-row justify-around border-t border-[#EDF4EC] pt-[10px]">
                      <View className="items-center">
                        <Text className="text-[12px] text-[#718774]">Protein</Text>
                        <Text className="text-[13px] font-bold text-[#111827]">
                          {plan.protein}g
                        </Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-[12px] text-[#718774]">Carbs</Text>
                        <Text className="text-[13px] font-bold text-[#111827]">{plan.carbs}g</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-[12px] text-[#718774]">Fat</Text>
                        <Text className="text-[13px] font-bold text-[#111827]">{plan.fat}g</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Bottom Actions */}
            <View className="px-[26px]">
              {/* Apple Sign-In */}
              {Platform.OS === 'ios' || isWebDesktop ? (
                <Pressable
                  onPress={() => signInWith('oauth_apple')}
                  disabled={busy !== null}
                  className={`h-[52px] flex-row items-center justify-center rounded-full bg-black shadow-sm ${
                    busy ? 'opacity-60' : 'active:opacity-90'
                  }`}
                >
                  {busy === 'oauth_apple' ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                      <Text className="ml-[10px] text-[16px] font-bold text-white">
                        Continue with Apple
                      </Text>
                    </>
                  )}
                </Pressable>
              ) : null}

              {/* Google Sign-In */}
              <Pressable
                onPress={() => signInWith('oauth_google')}
                disabled={busy !== null}
                className={`mt-[10px] h-[52px] flex-row items-center justify-center rounded-full border border-[#D8EBD5] bg-white shadow-sm ${
                  busy ? 'opacity-60' : 'active:opacity-90'
                }`}
              >
                {busy === 'oauth_google' ? (
                  <ActivityIndicator color="#1E6B35" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#EA4335" />
                    <Text className="ml-[10px] text-[16px] font-bold text-[#111827]">
                      Continue with Google
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Email Input or Toggle */}
              {showEmailInput ? (
                <View className="mt-[12px]">
                  <View className="h-[52px] flex-row items-center rounded-full border border-[#C5DEC1] bg-white px-[18px] shadow-sm">
                    <Ionicons name="mail-outline" size={19} color="#1E6B35" />
                    <TextInput
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor="#8FA392"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="ml-[10px] flex-1 text-[15px] text-[#111827]"
                    />
                  </View>
                  {emailError ? (
                    <Text className="mt-[4px] ml-[14px] text-[12px] font-medium text-[#D32F2F]">
                      {emailError}
                    </Text>
                  ) : null}

                  <Pressable
                    onPress={() => signInWith('email')}
                    disabled={busy !== null}
                    className={`mt-[8px] h-[48px] flex-row items-center justify-center rounded-full bg-[#439A4B] shadow-sm ${
                      busy ? 'opacity-60' : 'active:opacity-90'
                    }`}
                  >
                    {busy === 'email' ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="text-[15px] font-bold text-white">
                        Sign In with Email
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowEmailInput(true)}
                  disabled={busy !== null}
                  className={`mt-[10px] h-[52px] flex-row items-center justify-center rounded-full border border-[#D8EBD5] bg-white/80 shadow-sm active:opacity-90`}
                >
                  <Ionicons name="mail-outline" size={19} color="#1E6B35" />
                  <Text className="ml-[10px] text-[16px] font-bold text-[#1E6B35]">
                    Continue with Email
                  </Text>
                </Pressable>
              )}

              {/* Continue as Guest / Skip */}
              <Pressable
                onPress={() => signInWith('guest')}
                disabled={busy !== null}
                hitSlop={10}
                className="mt-[16px] py-[4px] items-center active:opacity-70"
              >
                {busy === 'guest' ? (
                  <ActivityIndicator size="small" color="#1E6B35" />
                ) : (
                  <Text className="text-[14px] font-semibold text-[#556D5B]">
                    Continue as Guest <Text className="text-[#1E6B35]">→</Text>
                  </Text>
                )}
              </Pressable>

              <Text className="mb-[4px] mt-[14px] text-center text-[11px] leading-[16px] text-[#718774]">
                By continuing you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
