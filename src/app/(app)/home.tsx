import React, { useRef, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { Ring } from '@/components/ring';
import { StreakSheet } from '@/components/StreakSheet';
import { Images } from '@/constants/images';
import { MACROS } from '@/constants/macros';
import { useApp } from '@/context/AppContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const THUMB = 62;
const TAB_BAR = Platform.select({ ios: 49, default: 60 });

const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const mealType = (d: Date) => {
  const h = d.getHours();
  return h < 11 ? 'Breakfast' : h < 16 ? 'Lunch' : h < 21 ? 'Dinner' : 'Snack';
};

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const today = midnight(new Date());
  const [selected, setSelected] = useState(today);
  const [showStreak, setShowStreak] = useState(false);

  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width > 500;
  const contentWidth = isWebDesktop ? Math.min(width, 440) : width;
  const dayColWidth = (contentWidth - 24) / 7;

  const strip = useRef<ScrollView>(null);
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - 14);
  const days = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const { profile, meals: allMeals } = useApp();
  const plan = {
    calories: profile?.dailyCalories ?? 2200,
    protein: profile?.proteinG ?? 165,
    carbs: profile?.carbsG ?? 220,
    fat: profile?.fatG ?? 73,
  };

  const isToday = selected === today;
  const selectedDate = new Date(selected);
  const streak = profile?.streak ?? 1;

  // Filter meals for the selected date
  const selectedDateStr = isoDate(selectedDate);
  const meals = allMeals.filter((m) => isoDate(new Date(m.loggedAt)) === selectedDateStr);

  const eaten = meals.reduce(
    (t, m) => ({
      calories: t.calories + (m.calories ?? 0),
      protein: t.protein + (m.proteinG ?? 0),
      carbs: t.carbs + (m.carbsG ?? 0),
      fat: t.fat + (m.fatG ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesLeft = Math.max(0, plan.calories - eaten.calories);
  const calProgress = plan.calories > 0 ? eaten.calories / plan.calories : 0;

  return (
    <View
      collapsable={false}
      className="flex-1 bg-[#F8FCF8] items-center"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      <View style={{ width: '100%', maxWidth: 440 }} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR + 28 }}
        >
          {/* Top Bar: Brand Logo & Streak Chip */}
          <View className="mt-[10px] flex-row items-center justify-between px-[20px]">
            <Image
              source={Images.saladoLogo}
              style={{ width: 110, height: 32 }}
              contentFit="contain"
            />
            <Pressable
              onPress={() => setShowStreak(true)}
              className="flex-row items-center rounded-full border border-[#D5E9D2] bg-[#EDF7EB] px-[12px] py-[6px] active:opacity-70 shadow-sm"
            >
              <Icon name="flame.fill" size={16} color="#E86339" />
              <Text className="ml-[6px] text-[14px] font-bold text-[#1E6B35]">{streak}</Text>
            </Pressable>
          </View>

          {/* Calendar Strip */}
          <ScrollView
            ref={strip}
            horizontal
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => strip.current?.scrollToEnd({ animated: false })}
            snapToInterval={contentWidth}
            decelerationRate="fast"
            className="mt-[16px] flex-grow-0"
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            {days.map((d) => {
              const time = midnight(d);
              const isSelected = time === selected;
              const isFuture = time > today;
              return (
                <Pressable
                  key={time}
                  disabled={isFuture}
                  onPress={() => setSelected(time)}
                  className="items-center"
                  style={{ width: dayColWidth }}
                >
                  <View
                    className="w-[44px] items-center rounded-[16px] py-[6px]"
                    style={
                      isSelected
                        ? {
                            backgroundColor: '#439A4B',
                            shadowColor: '#439A4B',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 6,
                            elevation: 3,
                          }
                        : undefined
                    }
                  >
                    <Text
                      className="text-[12px] font-medium"
                      style={{ color: isFuture ? '#B8C9BA' : isSelected ? '#FFFFFF' : '#6F8472' }}
                    >
                      {WEEKDAYS[d.getDay()]}
                    </Text>
                    <View
                      className="mt-[4px] h-[32px] w-[32px] items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                        borderWidth: isSelected ? 0 : 1.5,
                        borderStyle: isFuture ? 'solid' : 'dashed',
                        borderColor: isFuture ? '#E2EDE0' : '#D0E3CD',
                      }}
                    >
                      <Text
                        className="text-[15px] font-bold"
                        style={{ color: isFuture ? '#B8C9BA' : isSelected ? '#1E6B35' : '#1A2E1D' }}
                      >
                        {d.getDate()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Calories Left Card */}
          <View className="mx-[20px] mt-[18px] flex-row items-center rounded-[24px] border border-[#DCECDA] bg-white px-[22px] py-[20px] shadow-sm">
            <View className="flex-1">
              <Text className="text-[44px] font-bold leading-[48px] tracking-[-1px] text-[#111827]">
                {caloriesLeft.toLocaleString('en-US')}
              </Text>
              <Text className="mt-[2px] text-[15px] font-medium leading-[20px] text-[#556D5B]">
                Calories left
              </Text>
              <Text className="mt-[6px] text-[12px] text-[#718774]">
                {eaten.calories > 0
                  ? `${eaten.calories.toLocaleString()} of ${plan.calories.toLocaleString()} consumed`
                  : `Goal: ${plan.calories.toLocaleString()} cal`}
              </Text>
            </View>
            <Ring
              size={92}
              stroke={9}
              progress={calProgress}
              color="#439A4B"
              track="#E8F4E6"
            >
              <View className="items-center justify-center">
                <Icon name="flame.fill" size={26} color="#439A4B" />
              </View>
            </Ring>
          </View>

          {/* Macro Breakdown Cards */}
          <View className="mt-[12px] flex-row gap-[10px] px-[20px]">
            {MACROS.map((macro) => {
              const target = plan[macro.key];
              const left = Math.max(0, target - eaten[macro.key]);
              return (
                <View
                  key={macro.key}
                  className="flex-1 items-start rounded-[20px] border border-[#DCECDA] bg-white p-[14px] shadow-sm"
                >
                  <Text className="text-[20px] font-bold leading-[25px] tracking-[-0.4px] text-[#111827]">
                    {left}g
                  </Text>
                  <Text className="mt-[1px] text-[12px] font-medium leading-[16px] text-[#556D5B]">
                    {macro.label} left
                  </Text>
                  <View className="mt-[12px] w-full items-center">
                    <Ring
                      size={54}
                      stroke={6}
                      progress={target > 0 ? eaten[macro.key] / target : 0}
                      color={macro.color}
                      track="#EDF5EB"
                    >
                      <Icon name={macro.icon} size={18} color={macro.color} />
                    </Ring>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Meals Section Header */}
          <View className="mx-[20px] mt-[26px] flex-row items-center justify-between">
            <Text className="text-[20px] font-bold tracking-[-0.4px] text-[#111827]">
              {isToday
                ? "Today's meals"
                : selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
            </Text>
            {isToday && meals.length > 0 && (
              <Pressable
                onPress={() => router.push('/camera')}
                hitSlop={8}
                className="flex-row items-center active:opacity-70"
              >
                <Icon name="camera.fill" size={14} color="#1E6B35" />
                <Text className="ml-[4px] text-[13px] font-bold text-[#1E6B35]">Add meal</Text>
              </Pressable>
            )}
          </View>

          {/* Meals List / Empty State */}
          {meals.length ? (
            <View className="mt-[12px] gap-[10px] px-[20px]">
              {meals.map((meal) => {
                const mealDate = new Date(meal.loggedAt);
                return (
                  <View
                    key={meal.id}
                    className="flex-row items-center rounded-[18px] border border-[#DCECDA] bg-white p-[10px] shadow-sm"
                  >
                    {meal.imageUrl ? (
                      <Image
                        source={{ uri: meal.imageUrl }}
                        style={{ width: THUMB, height: THUMB, borderRadius: 14 }}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View
                        style={{ width: THUMB, height: THUMB, borderRadius: 14 }}
                        className="items-center justify-center bg-[#EBF5EA]"
                      >
                        <Icon name="fork.knife" size={24} color="#558E5C" />
                      </View>
                    )}
                    <View className="ml-[14px] flex-1">
                      <Text numberOfLines={1} className="text-[16px] font-semibold text-[#111827]">
                        {meal.name}
                      </Text>
                      <Text className="mt-[2px] text-[13px] text-[#6B826E]">
                        {mealDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        · {mealType(mealDate)}
                      </Text>
                      <View className="mt-[6px] flex-row gap-[10px]">
                        {MACROS.map((macro) => (
                          <View key={macro.key} className="flex-row items-center">
                            <View
                              className="h-[7px] w-[7px] rounded-full"
                              style={{ backgroundColor: macro.color }}
                            />
                            <Text className="ml-[4px] text-[12px] text-[#556D5B]">
                              {meal[macro.key === 'protein' ? 'proteinG' : macro.key === 'carbs' ? 'carbsG' : 'fatG']}g
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <Text className="ml-[10px] mr-[6px] text-[16px] font-bold text-[#1E6B35]">
                      {meal.calories}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="mx-[20px] mt-[12px] items-center rounded-[22px] border border-[#DCECDA] bg-white/95 px-[20px] py-[24px] shadow-sm">
              <View className="h-[50px] w-[50px] items-center justify-center rounded-full bg-[#EAF5E8]">
                <Icon name="fork.knife" size={22} color="#1E6B35" />
              </View>
              <Text className="mt-[12px] text-center text-[16px] font-bold text-[#111827]">
                {isToday ? 'No meals logged yet' : 'No meals recorded'}
              </Text>
              <Text className="mt-[4px] text-center text-[13px] leading-[19px] text-[#556D5B] max-w-[270px]">
                {isToday
                  ? 'Snap your first meal of the day to track calories and macros effortlessly.'
                  : 'No meal entries were logged for this date.'}
              </Text>
              {isToday && (
                <Pressable
                  onPress={() => router.push('/camera')}
                  className="mt-[16px] flex-row items-center rounded-full bg-[#439A4B] px-[20px] py-[9px] active:opacity-90 shadow-sm"
                >
                  <Icon name="camera.fill" size={15} color="#FFFFFF" />
                  <Text className="ml-[6px] text-[14px] font-bold text-white">Log Meal</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {showStreak ? <StreakSheet streak={streak} onClose={() => setShowStreak(false)} /> : null}
    </View>
  );
}
