import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Images } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import { answers, draft } from '@/onboarding/steps';

const LINES = [
  'Reading your answers…',
  'Estimating your daily burn…',
  'Balancing your macros…',
  'Finishing your plan…',
];
const TICK = 700;

export default function BuildingPlan() {
  const router = useRouter();
  const { generateAndSetPlan } = useApp();
  const [i, setI] = useState(0);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);
  const { width, height } = useWindowDimensions();

  const isWebDesktop = Platform.OS === 'web' && width > 500;
  const screenWidth = isWebDesktop ? Math.min(width, 420) : width;
  const screenHeight = isWebDesktop ? Math.min(height, 890) : height;

  const generate = useCallback(async () => {
    setFailed(false);
    try {
      const plan = generateAndSetPlan();
      draft.plan = plan;
      setTimeout(() => {
        router.replace('/onboarding/plan');
      }, 2400);
    } catch (error) {
      setFailed(true);
    }
  }, [router, generateAndSetPlan]);

  useEffect(() => {
    const id = setInterval(() => setI((n) => n + 1), TICK);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    generate();
  }, [generate]);

  if (!answers.gender) {
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
        className="flex-1 w-full items-center justify-center px-[36px]"
      >
        {/* Splash background with leaves */}
        <Image
          source={Images.splashBg}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
          priority="high"
        />

        <View className="items-center justify-center z-10 w-full">
          <Image
            source={Images.saladoLogo}
            style={{ width: 230, height: 115 }}
            contentFit="contain"
          />
          <Text className="mt-[28px] text-center text-[28px] font-bold leading-[34px] text-[#111827]">
            {failed ? "That didn't work" : 'Building your plan'}
          </Text>

          {failed ? (
            <>
              <Text className="mt-[8px] text-center text-[16px] leading-[22px] text-[#4F6452]">
                We couldn&apos;t build your plan just now. Check your connection and try again.
              </Text>
              <Pressable
                onPress={generate}
                className="mt-[24px] h-[50px] items-center justify-center rounded-full bg-[#439A4B] px-[32px] active:opacity-90 shadow-md"
              >
                <Text className="text-[16px] font-bold text-white">Try again</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="mt-[8px] text-center text-[16px] leading-[22px] text-[#4F6452]">
                {LINES[Math.min(i, LINES.length - 1)]}
              </Text>
              <View className="mt-[30px] h-[6px] w-[220px] overflow-hidden rounded-full bg-[#D2E7CD]">
                <View
                  className="h-full rounded-full bg-[#439A4B]"
                  style={{ width: `${Math.min(95, ((i + 1) / LINES.length) * 95)}%` }}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
