import React from 'react';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { Images } from '@/constants/images';
import { MACROS } from '@/constants/macros';
import { useApp } from '@/context/AppContext';
import { draft } from '@/onboarding/steps';

// left / top within the 260pt-tall hero, size, rotation, color
const CONFETTI: [number, number, number, number, string][] = [
  [58, 18, 11, 25, '#8B7BE8'],
  [126, 12, 10, -15, '#8FC7EE'],
  [232, 16, 10, 20, '#F0A868'],
  [292, 22, 11, -25, '#7BC98F'],
  [30, 54, 10, -20, '#7BC98F'],
  [86, 62, 9, 35, '#F08A5D'],
  [258, 50, 10, 15, '#F5B841'],
  [318, 66, 10, -30, '#E86A92'],
  [14, 96, 11, 30, '#F5A623'],
  [340, 108, 9, 20, '#E86A92'],
  [46, 132, 10, -25, '#E8C4A0'],
  [300, 130, 10, 25, '#E8C4A0'],
  [22, 176, 10, 15, '#7BC9C9'],
  [330, 182, 10, -20, '#8FC7EE'],
  [64, 208, 11, -30, '#E86A92'],
  [286, 202, 10, 25, '#F5B841'],
];

export default function PlanReveal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draftPlan, generateAndSetPlan } = useApp();
  const plan = draft.plan || draftPlan || generateAndSetPlan();
  const { width, height } = useWindowDimensions();

  const isWebDesktop = Platform.OS === 'web' && width > 500;
  const screenWidth = isWebDesktop ? Math.min(width, 420) : width;
  const screenHeight = isWebDesktop ? Math.min(height, 890) : height;

  if (!plan) {
    return <Redirect href={{ pathname: '/onboarding/[step]', params: { step: 'gender' } }} />;
  }

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: (isWebDesktop ? 20 : insets.top) + 10,
            paddingBottom: 28,
          }}
        >
          <View className="h-[180px] items-center justify-center">
            {CONFETTI.map(([left, top, size, rotate, backgroundColor], i) => (
              <View
                key={i}
                className="absolute rounded-[2px]"
                style={{
                  left,
                  top,
                  width: size,
                  height: size,
                  backgroundColor,
                  transform: [{ rotate: `${rotate}deg` }],
                }}
              />
            ))}
            <View className="items-center justify-center">
              <Image
                source={Images.saladoLogo}
                style={{ width: 190, height: 95 }}
                contentFit="contain"
              />
            </View>
          </View>

          <Text className="px-[26px] text-center text-[22px] font-bold leading-[27px] text-[#111827]">
            Your daily calorie target
          </Text>
          <Text className="mt-[6px] px-[34px] text-center text-[15px] leading-[21px] text-[#4F6452]">
            Based on your info, here&apos;s your personalized target to reach your goal.
          </Text>

          <Text className="mt-[20px] text-center text-[52px] font-bold leading-[58px] text-[#1E6B35]">
            {plan.calories.toLocaleString('en-US')}
          </Text>
          <Text className="mt-[2px] text-center text-[18px] font-medium leading-[24px] text-[#4F6452]">
            Calories / day
          </Text>

          <View className="mx-[26px] mt-[20px] flex-row rounded-[20px] border border-[#DFEBDD] bg-white/95 py-[20px] shadow-sm">
            {MACROS.map((macro) => (
              <View key={macro.key} className="flex-1 items-center">
                <Icon name={macro.icon} size={28} color={macro.color} />
                <Text className="mt-[10px] text-[18px] font-bold leading-[23px] text-[#111827]">
                  {plan[macro.key]}g
                </Text>
                <Text className="mt-[1px] text-[13px] leading-[18px] text-[#556D5B]">
                  {macro.label}
                </Text>
              </View>
            ))}
          </View>

          <View className="mx-[26px] mt-[14px] rounded-[18px] bg-white/90 border border-[#DFEBDD] p-[16px] shadow-sm">
            <View className="flex-row items-center">
              <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-[#E5F5E2]">
                <Icon name="star.fill" size={11} color="#2A8333" />
              </View>
              <Text className="ml-[10px] text-[15px] font-bold leading-[20px] text-[#111827]">
                How we got here
              </Text>
            </View>
            <Text className="mt-[8px] text-[14px] leading-[20px] text-[#4F6452]">
              {plan.rationale}
            </Text>
          </View>

          <Text className="mt-[14px] px-[34px] text-center text-[13px] leading-[18px] text-[#718774]">
            You can change your targets any time from your profile.
          </Text>
        </ScrollView>

        <View
          className="border-t border-[#DFEBDD] bg-white/85 px-[26px] pt-[12px]"
          style={{ paddingBottom: (isWebDesktop ? 20 : insets.bottom) + 12 }}
        >
          <Pressable
            onPress={() => router.push('/onboarding/plan-includes')}
            className="h-[52px] items-center justify-center rounded-full bg-[#439A4B] active:opacity-90 shadow-md"
          >
            <Text className="text-[17px] font-bold text-white">Continue</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
