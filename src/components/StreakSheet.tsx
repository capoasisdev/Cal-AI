import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';

interface StreakSheetProps {
  streak: number;
  onClose: () => void;
}

const getStreakLine = (streak: number) => {
  if (streak === 0) return 'Log one meal today and the fire starts burning.';
  if (streak < 3) return 'The first days are the hardest. You are building momentum!';
  if (streak < 7) return 'Momentum is real. Do not let the fire cool off!';
  return 'A week strong! Consistency is your superpower.';
};

export function StreakSheet({ streak, onClose }: StreakSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-[28px] bg-[#FEFDFD] px-[26px] pt-[20px]"
          style={{ paddingBottom: insets.bottom + 22 }}
        >
          {/* Handle bar */}
          <View className="h-[5px] w-[42px] self-center rounded-full bg-[#E2E2E7]" />

          <View className="mt-[24px] items-center">
            <View className="h-[86px] w-[86px] items-center justify-center rounded-full bg-[#FDECEA]">
              <Icon name="flame.fill" size={44} color="#F4685C" />
            </View>
            <Text className="mt-[16px] text-[46px] font-bold leading-[52px] tracking-[-1px] text-black">
              {streak}
            </Text>
            <Text className="mt-[2px] text-[16px] font-medium text-[#6E6E78]">day streak</Text>
            <Text className="mt-[14px] text-center text-[16px] leading-[22px] text-[#6E6E78] px-[20px]">
              {getStreakLine(streak)}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            className="mt-[28px] h-[54px] items-center justify-center rounded-full bg-[#439A4B] active:opacity-90 shadow-sm"
          >
            <Text className="text-[16px] font-bold text-white">Let&apos;s go</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
