import React from 'react';
import { Image } from 'expo-image';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { Images } from '@/constants/images';
import { useApp } from '@/context/AppContext';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, isLoading } = useApp();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{ splash?: string }>();

  if (!params.splash && !isLoading && profile.onboardingCompleted) {
    return <Redirect href="/home" />;
  }

  const isWebDesktop = Platform.OS === 'web' && width > 500;
  const screenWidth = isWebDesktop ? Math.min(width, 420) : width;
  const screenHeight = isWebDesktop ? Math.min(height, 890) : height;
  const isSmallScreen = screenHeight < 720;
  const bowlSize = Math.min(screenWidth * 0.82, isSmallScreen ? 280 : 335);

  return (
    <View
      className="flex-1 bg-[#E8F3E5] items-center justify-center"
      style={isWebDesktop ? { height: '100vh' as any, overflow: 'hidden' } : undefined}
    >
      <StatusBar style="dark" />

      {/* Screen Container (Full width on mobile, centered phone frame on desktop) */}
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
        {/* Perfectly fitted organic mint background with floating leaves */}
        <Image
          source={Images.splashBg}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
          priority="high"
        />

        <View
          className="flex-1 items-center justify-between"
          style={{
            paddingTop: (isWebDesktop ? 24 : insets.top) + (isSmallScreen ? 12 : 22),
            paddingBottom: (isWebDesktop ? 28 : insets.bottom) + (isSmallScreen ? 16 : 24),
          }}
        >
          {/* Top Header: SaladO Brand Logo & Tagline */}
          <View className="items-center px-[28px] mt-[16px]">
            <Image
              source={Images.saladoLogo}
              style={{
                width: isSmallScreen ? 190 : 225,
                height: isSmallScreen ? 95 : 112,
              }}
              contentFit="contain"
            />

            <Text
              className="mt-[25px] text-center text-[15px] font-normal leading-[22px] text-[#556D5B]"
              style={{ maxWidth: 290 }}
            >
              Track your calories, nourish your body, and build a healthier you.
            </Text>
          </View>

          {/* Center: Fresh Salad Bowl Hero with Sparkle Accents */}
          <View className="items-center justify-center my-auto">
            <View style={{ width: bowlSize, height: bowlSize * 0.96 }} className="items-center justify-center">
              {/* Soft ground shadow under bowl */}
              <View
                style={{
                  position: 'absolute',
                  bottom: 6,
                  width: bowlSize * 0.72,
                  height: 24,
                  borderRadius: 100,
                  backgroundColor: 'rgba(25, 60, 30, 0.12)',
                  transform: [{ scaleY: 0.5 }],
                }}
              />

              {/* High-res Salad Bowl */}
              <Image
                source={Images.saladBowl}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />

              {/* Green Sparkle / Burst Accent at top right of bowl */}
              <View
                style={{
                  position: 'absolute',
                  top: isSmallScreen ? 6 : 14,
                  right: isSmallScreen ? 6 : 14,
                }}
                pointerEvents="none"
              >
                <Svg width={44} height={44} viewBox="0 0 44 44">
                  <Line
                    x1="12"
                    y1="34"
                    x2="6"
                    y2="26"
                    stroke="#5FB365"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <Line
                    x1="22"
                    y1="30"
                    x2="22"
                    y2="18"
                    stroke="#5FB365"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <Line
                    x1="30"
                    y1="32"
                    x2="38"
                    y2="24"
                    stroke="#5FB365"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
            </View>
          </View>

          {/* Bottom Actions: Get Started & Sign In */}
          <View className="w-full items-center px-[28px]">
            <Pressable
              onPress={() =>
                router.push({ pathname: '/onboarding/[step]', params: { step: 'gender' } })
              }
              className="h-[54px] w-full max-w-[325px] flex-row items-center justify-center rounded-full bg-[#439A4B] active:opacity-90"
              style={{
                shadowColor: '#439A4B',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="text-[17px] font-bold tracking-[-0.2px] text-white">
                Get Started
              </Text>
              <Text className="ml-[8px] text-[20px] font-bold text-white">→</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/sign-in')}
              hitSlop={12}
              className="mt-[14px] active:opacity-70"
            >
              <Text className="text-center text-[14px] text-[#556D5B]">
                Already have an account?{' '}
                <Text className="font-bold text-[#1E6B35]">Sign In</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
