import React, { ReactNode, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Icon, IconName } from '@/components/Icon';
import { Images } from '@/constants/images';

const SEGMENTS = 4;

export function OnboardingScreen({
  progress,
  title,
  subtitle,
  cta = 'Next',
  onNext,
  disabled,
  header,
  children,
}: {
  progress: number; // 0..1
  title?: string;
  subtitle?: string;
  cta?: string;
  onNext: () => void;
  disabled?: boolean;
  header?: ReactNode;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width > 500;
  const screenWidth = isWebDesktop ? Math.min(width, 420) : width;
  const screenHeight = isWebDesktop ? Math.min(height, 890) : height;
  const filled = 1 + Math.floor(progress * (SEGMENTS - 1));

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
          className="flex-1"
          style={{
            paddingTop: (isWebDesktop ? 20 : insets.top) + 4,
            paddingBottom: isWebDesktop ? 24 : insets.bottom,
          }}
        >
          <View className="mt-[4px] h-[28px] flex-row items-center px-[26px]">
            <Pressable onPress={() => router.back()} hitSlop={12} className="active:opacity-70">
              <Icon name="arrow.left" size={22} color="#1E6B35" />
            </Pressable>
            <View className="ml-[26px] flex-row gap-[10px]">
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <View
                  key={i}
                  className={`h-[5px] w-[34px] rounded-full ${
                    i < filled ? 'bg-[#439A4B]' : 'bg-[#D2E7CD]'
                  }`}
                />
              ))}
            </View>
          </View>

          {title ? (
            <Text className="ml-[26px] mt-[24px] w-[290px] text-[32px] font-bold leading-[38px] text-[#111827]">
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text className="ml-[26px] mt-[6px] w-[264px] text-[16px] leading-[22px] text-[#4F6452]">
              {subtitle}
            </Text>
          ) : null}
          {header}

          <View className="flex-1">{children}</View>

          <Pressable
            onPress={onNext}
            disabled={disabled}
            className={`mx-[26px] mb-[16px] h-[52px] items-center justify-center rounded-full ${
              disabled ? 'bg-[#C8D9C5]' : 'bg-[#439A4B] active:opacity-90'
            }`}
            style={
              !disabled
                ? {
                    shadowColor: '#439A4B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 5,
                  }
                : undefined
            }
          >
            <Text className="text-[17px] font-bold text-white">{cta}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function OptionCard({
  title,
  subtitle,
  icon,
  glyph,
  selected,
  tall,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName | string;
  glyph?: string;
  selected: boolean;
  tall?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        minHeight: tall ? 96 : 70,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? '#439A4B' : 'rgba(215, 235, 212, 0.85)',
        backgroundColor: selected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.92)',
        shadowColor: selected ? '#439A4B' : '#000',
        shadowOffset: { width: 0, height: selected ? 4 : 1 },
        shadowOpacity: selected ? 0.15 : 0.04,
        shadowRadius: selected ? 8 : 4,
        elevation: selected ? 4 : 1,
      }}
      className="flex-row items-center rounded-[16px] px-[22px] py-[13px] active:opacity-85"
    >
      <View className={`items-center ${tall ? 'w-[48px]' : 'w-[32px]'}`}>
        {glyph ? (
          <Text className="text-[46px] leading-[54px] text-[#111827]">{glyph}</Text>
        ) : icon ? (
          <Icon name={icon} size={tall ? 36 : 29} color={selected ? '#439A4B' : '#2D3748'} />
        ) : null}
      </View>
      <View className="ml-[20px] flex-1">
        <Text
          className={`text-[16px] font-semibold leading-[21px] ${
            selected ? 'text-[#1E6B35]' : 'text-[#111827]'
          }`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-[2px] text-[14px] leading-[19px] text-[#556D5B]">{subtitle}</Text>
        ) : null}
      </View>
      {selected ? (
        <View className="h-[24px] w-[24px] items-center justify-center rounded-full bg-[#439A4B]">
          <Icon name="checkmark" size={13} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

const ITEM = 14;
const VISIBLE = 16;
const FADE = [1, 0.9, 0.72, 0.5, 0.3, 0.14];
const fadeStyle = (top: number, opacity: number) =>
  ({
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top,
    height: 7,
    opacity,
    backgroundColor: '#FEFDFD',
  });

export function RulerPicker({
  value,
  onChange,
  min,
  max,
  increment,
  decimals = 0,
  unit,
  labelEvery = 5,
  labelDecimals = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  increment: number;
  decimals?: number;
  unit: string;
  labelEvery?: number;
  labelDecimals?: number;
}) {
  const count = Math.round((max - min) / increment) + 1;
  const height = ITEM * VISIBLE;
  const pad = height / 2 - ITEM / 2;
  const last = useRef(value);
  const centerIndex = Math.round((max - value) / increment);

  const onScroll = (e: NativeSyntheticEvent<{ contentOffset: { y: number } }>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM);
    const v = Math.min(max, Math.max(min, max - i * increment));
    const rounded = Number(v.toFixed(decimals + 1));
    if (rounded !== last.current) {
      last.current = rounded;
      onChange(rounded);
    }
  };

  return (
    <View>
      <View className="flex-row items-end justify-center">
        <Text className="text-[42px] font-bold leading-[46px] text-black">
          {value.toFixed(decimals)}
        </Text>
        <Text className="mb-[7px] ml-[8px] text-[17px] leading-[20px] text-[#6E6E78]">{unit}</Text>
      </View>

      <View className="mt-[26px]" style={{ height }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentOffset={{ x: 0, y: Math.max(0, Math.round((max - value) / increment) * ITEM) }}
          contentContainerStyle={{ paddingVertical: pad }}
        >
          {Array.from({ length: count }, (_, i) => {
            const v = Number((max - i * increment).toFixed(decimals + 1));
            const major = i % labelEvery === 0;
            const showLabel = major && Math.abs(i - centerIndex) > 1;
            return (
              <View key={i} className="justify-center" style={{ height: ITEM }}>
                <View
                  className="absolute left-1/2 rounded-full"
                  style={{
                    marginLeft: major ? -13 : -9,
                    width: major ? 26 : 18,
                    height: major ? 2 : 1.5,
                    backgroundColor: major ? '#C9C9CE' : '#DEDEE2',
                  }}
                />
                {showLabel ? (
                  <Text
                    className="absolute text-[17px] leading-[20px] text-[#9A9AA0]"
                    style={{ left: '50%', marginLeft: 94, top: -3 }}
                  >
                    {v.toFixed(labelDecimals)}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        {FADE.map((o, i) => (
          <View key={`t${i}`} pointerEvents="none" style={fadeStyle(i * 7, o)} />
        ))}
        {FADE.map((o, i) => (
          <View key={`b${i}`} pointerEvents="none" style={fadeStyle(height - (i + 1) * 7, o)} />
        ))}

        <View pointerEvents="none" className="absolute left-0 right-0" style={{ top: pad }}>
          <View className="h-[14px] justify-center">
            <View
              className="absolute h-[2px] bg-[#439A4B]"
              style={{ left: '50%', marginLeft: -87, width: 174 }}
            />
            <View
              className="absolute h-[26px] w-[26px] rounded-full bg-[#439A4B]"
              style={{ left: '50%', marginLeft: -13 }}
            />
            <Text
              className="absolute text-[17px] font-semibold leading-[20px] text-[#1E6B35]"
              style={{ left: '50%', marginLeft: 94 }}
            >
              {value % 1 === 0 ? String(value) : value.toFixed(decimals)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DateWheelPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (dateStr: string) => void;
}) {
  const parsed = new Date(value || '2000-01-01');
  const [selectedYear, setSelectedYear] = useState(parsed.getFullYear() || 2000);
  const [selectedMonth, setSelectedMonth] = useState(parsed.getMonth() || 0);
  const [selectedDay, setSelectedDay] = useState(parsed.getDate() || 1);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 14 - i);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const update = (y: number, m: number, d: number) => {
    const validDay = Math.min(d, new Date(y, m + 1, 0).getDate());
    const formatted = `${y}-${String(m + 1).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
    onChange(formatted);
  };

  return (
    <View className="items-center px-[10px]">
      <View className="rounded-[20px] border border-[#DFEBDD] bg-white/95 p-[18px] w-full max-w-[360px] shadow-sm">
        <View className="items-center border-b border-[#F2F2F4] pb-[14px] mb-[14px]">
          <Text className="text-[13px] font-medium text-[#8A8A90] uppercase tracking-[1px]">
            Selected Birthday
          </Text>
          <Text className="mt-[4px] text-[22px] font-bold text-[#111827]">
            {MONTHS[selectedMonth]} {selectedDay}, {selectedYear}
          </Text>
        </View>

        <View className="flex-row gap-[10px] h-[190px]">
          <View className="flex-1">
            <Text className="text-[12px] font-semibold text-[#8A8A90] text-center mb-[6px]">Month</Text>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {MONTHS.map((name, idx) => {
                const isSelected = selectedMonth === idx;
                return (
                  <Pressable
                    key={name}
                    onPress={() => {
                      setSelectedMonth(idx);
                      update(selectedYear, idx, selectedDay);
                    }}
                    className={`py-[7px] rounded-[10px] items-center my-[2px] ${
                      isSelected ? 'bg-[#439A4B]' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      numberOfLines={1}
                      className={`text-[13px] font-medium ${
                        isSelected ? 'text-white font-bold' : 'text-[#4A4A52]'
                      }`}
                    >
                      {name.substring(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View className="w-[60px]">
            <Text className="text-[12px] font-semibold text-[#8A8A90] text-center mb-[6px]">Day</Text>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {days.map((d) => {
                const isSelected = selectedDay === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => {
                      setSelectedDay(d);
                      update(selectedYear, selectedMonth, d);
                    }}
                    className={`py-[7px] rounded-[10px] items-center my-[2px] ${
                      isSelected ? 'bg-[#439A4B]' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-medium ${
                        isSelected ? 'text-white font-bold' : 'text-[#4A4A52]'
                      }`}
                    >
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View className="w-[74px]">
            <Text className="text-[12px] font-semibold text-[#8A8A90] text-center mb-[6px]">Year</Text>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {years.map((y) => {
                const isSelected = selectedYear === y;
                return (
                  <Pressable
                    key={y}
                    onPress={() => {
                      setSelectedYear(y);
                      update(y, selectedMonth, selectedDay);
                    }}
                    className={`py-[7px] rounded-[10px] items-center my-[2px] ${
                      isSelected ? 'bg-[#439A4B]' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-medium ${
                        isSelected ? 'text-white font-bold' : 'text-[#4A4A52]'
                      }`}
                    >
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}
