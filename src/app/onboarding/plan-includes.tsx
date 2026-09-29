import React from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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
import { Icon, IconName } from '@/components/Icon';
import { Images } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import { answers } from '@/onboarding/steps';

const FEATURES: [IconName, string, string][] = [
  ['target', 'Calorie Tracking', 'Track effortlessly and stay on target'],
  ['viewfinder', 'AI Food Scanner', 'Snap a meal, get instant nutrition'],
  ['chart.pie', 'Macro Breakdown', 'Protein, carbs and fat for every meal'],
  ['chart.bar', 'Progress Tracking', 'See your progress and stay motivated'],
  ['flame', 'Daily Streaks', 'Keep your logging streak alive'],
];

export default function PlanIncludes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const target = answers.targetWeightKg?.toFixed(1) || '70';
  const { width, height } = useWindowDimensions();

  const isWebDesktop = Platform.OS === 'web' && width > 500;
  const screenWidth = isWebDesktop ? Math.min(width, 420) : width;
  const screenHeight = isWebDesktop ? Math.min(height, 890) : height;

  const onContinue = () => {
    router.push('/sign-in');
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

        <View
          className="flex-1 justify-between"
          style={{
            paddingTop: (isWebDesktop ? 20 : insets.top) + 4,
            paddingBottom: (isWebDesktop ? 24 : insets.bottom) + 8,
          }}
        >
          {/* Top Content */}
          <View>
            <View className="mt-[4px] h-[28px] flex-row items-center px-[26px]">
              <Pressable onPress={() => router.back()} hitSlop={12} className="active:opacity-70">
                <Icon name="arrow.left" size={22} color="#1E6B35" />
              </Pressable>
              <View className="ml-[26px] flex-row gap-[10px]">
                {Array.from({ length: 4 }, (_, i) => (
                  <View key={i} className="h-[5px] w-[34px] rounded-full bg-[#439A4B]" />
                ))}
              </View>
            </View>

            <Text className="ml-[26px] mt-[24px] pr-[26px] text-[30px] font-bold leading-[36px] text-[#111827]">
              Here&apos;s what your plan includes
            </Text>
            <Text className="ml-[26px] mt-[6px] pr-[26px] text-[16px] leading-[22px] text-[#4F6452]">
              Your personalized plan to help you reach {target} kg.
            </Text>

            <View className="mt-[26px] gap-[10px] px-[26px]">
              {FEATURES.map(([icon, title, subtitle]) => (
                <View
                  key={title}
                  className="h-[68px] flex-row items-center rounded-[16px] border border-[#D8EBD5] bg-white/95 px-[18px] shadow-sm"
                >
                  <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-[#EBF6E9]">
                    <Icon name={icon} size={20} color="#1E6B35" />
                  </View>
                  <View className="ml-[16px] flex-1">
                    <Text className="text-[16px] font-semibold leading-[21px] text-[#111827]">
                      {title}
                    </Text>
                    <Text className="mt-[1px] text-[13px] leading-[18px] text-[#556D5B]">
                      {subtitle}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Continue CTA */}
          <View className="px-[26px]">
            <Pressable
              onPress={onContinue}
              className="h-[52px] items-center justify-center rounded-full bg-[#439A4B] shadow-md active:opacity-90"
            >
              <Text className="text-[17px] font-bold text-white">Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
