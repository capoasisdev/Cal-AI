import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '@/components/Icon';
import { BottomTabInset } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { PlanService } from '@/services/planService';

const LEGAL_ORIGIN = 'https://bulky-ai-legal-demo.pages.dev';
const PRIVACY_URL = `${LEGAL_ORIGIN}/privacy`;
const TERMS_URL = `${LEGAL_ORIGIN}/terms`;

type ModalType =
  | 'personal'
  | 'preferences'
  | 'language'
  | 'family'
  | 'privacy'
  | 'terms'
  | 'feedback'
  | 'signout'
  | 'delete'
  | null;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="ml-[26px] mb-[8px] mt-[26px] text-[15px] font-medium text-[#8A8A90]">
      {children}
    </Text>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View className="mx-[18px] overflow-hidden rounded-[20px] bg-white">{children}</View>;
}

function Row({
  icon,
  label,
  value,
  onPress,
  tint = '#000000',
  divider,
}: {
  icon: IconName | string;
  label: string;
  value?: string;
  onPress?: () => void;
  tint?: string;
  divider?: boolean;
}) {
  const content = (
    <View className="flex-row items-center px-[18px] py-[15px]">
      <Icon name={icon} size={21} color={tint} style={{ width: 24, height: 24 }} />
      <Text className="ml-[12px] flex-1 text-[17px]" style={{ color: tint }} numberOfLines={1}>
        {label}
      </Text>
      {value ? <Text className="text-[16px] text-[#8A8A90] mr-[4px]">{value}</Text> : null}
      {onPress ? (
        <Icon
          name="chevron.right"
          size={14}
          color="#C2C2C9"
          style={{ width: 16, height: 16, marginLeft: 2 }}
        />
      ) : null}
    </View>
  );

  return (
    <View style={divider ? { borderTopWidth: 1, borderTopColor: '#F1F1F3' } : undefined}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          android_ripple={{ color: '#EBEBEF' }}
          style={({ pressed }) => [{ backgroundColor: pressed ? '#F5F5F7' : 'transparent' }]}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile, resetAllData } = useApp();

  // Active sheet modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Personal details form state
  const [height, setHeight] = useState(String(profile.heightCm || 175));
  const [weight, setWeight] = useState(String(profile.weightKg || 70));
  const [targetWeight, setTargetWeight] = useState(String(profile.targetWeightKg || 70));
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>(profile.goal || 'maintain');
  const [diet, setDiet] = useState<'classic' | 'keto' | 'vegan' | 'vegetarian'>(
    profile.dietPreference || 'classic'
  );
  const [recalcMacros, setRecalcMacros] = useState(true);

  // Preferences form state
  const [editCalories, setEditCalories] = useState(String(profile.dailyCalories || 2200));
  const [editProtein, setEditProtein] = useState(String(profile.proteinG || 165));
  const [editCarbs, setEditCarbs] = useState(String(profile.carbsG || 220));
  const [editFat, setEditFat] = useState(String(profile.fatG || 73));
  const [prefNotice, setPrefNotice] = useState<string | null>(null);

  // Language state
  const [currentLang, setCurrentLang] = useState(profile.language || 'English');
  const languages = [
    'English',
    'Español',
    'Français',
    'Deutsch',
    'हिन्दी',
    '日本語',
    'Português',
    'Italiano',
  ];

  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState<'Idea' | 'Bug' | 'Question'>('Idea');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Status message in sheet
  const [sheetSuccessMessage, setSheetSuccessMessage] = useState<string | null>(null);

  const memberSince = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Sep 2026';

  const openPersonalModal = () => {
    setHeight(String(profile.heightCm || 175));
    setWeight(String(profile.weightKg || 70));
    setTargetWeight(String(profile.targetWeightKg || 70));
    setGoal(profile.goal || 'maintain');
    setDiet(profile.dietPreference || 'classic');
    setSheetSuccessMessage(null);
    setActiveModal('personal');
  };

  const openPreferencesModal = () => {
    setEditCalories(String(profile.dailyCalories || 2200));
    setEditProtein(String(profile.proteinG || 165));
    setEditCarbs(String(profile.carbsG || 220));
    setEditFat(String(profile.fatG || 73));
    setPrefNotice(null);
    setSheetSuccessMessage(null);
    setActiveModal('preferences');
  };

  const handleSavePersonal = async () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const tw = parseFloat(targetWeight);

    const safeH = isNaN(h) || h < 50 || h > 260 ? (profile.heightCm || 175) : h;
    const safeW = isNaN(w) || w < 20 || w > 300 ? (profile.weightKg || 70) : w;
    const safeTw = isNaN(tw) || tw < 20 || tw > 300 ? (profile.targetWeightKg || 70) : tw;

    const updates: any = {
      heightCm: safeH,
      weightKg: safeW,
      targetWeightKg: safeTw,
      goal,
      dietPreference: diet,
    };

    if (recalcMacros) {
      const calculated = PlanService.calculatePlan({
        gender: profile.gender || 'male',
        dateOfBirth: profile.dateOfBirth || '2000-01-01',
        heightCm: safeH,
        weightKg: safeW,
        goal,
        targetWeightKg: safeTw,
        activityLevel: profile.activityLevel || 'moderate',
        paceKgPerWeek: profile.paceKgPerWeek || 0.5,
        dietPreference: diet,
      });

      updates.dailyCalories = calculated.calories;
      updates.proteinG = calculated.protein;
      updates.carbsG = calculated.carbs;
      updates.fatG = calculated.fat;
      updates.planRationale = calculated.rationale;
    }

    await updateProfile(updates);
    setSheetSuccessMessage('Personal details saved successfully!');
    setTimeout(() => {
      setActiveModal(null);
      setSheetSuccessMessage(null);
    }, 600);
  };

  const handleAutoRecalcPreferences = () => {
    const calculated = PlanService.calculatePlan({
      gender: profile.gender || 'male',
      dateOfBirth: profile.dateOfBirth || '2000-01-01',
      heightCm: profile.heightCm || 175,
      weightKg: profile.weightKg || 70,
      goal: profile.goal || 'maintain',
      targetWeightKg: profile.targetWeightKg || 70,
      activityLevel: profile.activityLevel || 'moderate',
      paceKgPerWeek: profile.paceKgPerWeek || 0.5,
      dietPreference: profile.dietPreference || 'classic',
    });

    setEditCalories(String(calculated.calories));
    setEditProtein(String(calculated.protein));
    setEditCarbs(String(calculated.carbs));
    setEditFat(String(calculated.fat));
    setPrefNotice('Calculated optimal targets using Mifflin-St Jeor equation.');
  };

  const handleSavePreferences = async () => {
    const c = parseInt(editCalories, 10);
    const p = parseInt(editProtein, 10);
    const cb = parseInt(editCarbs, 10);
    const f = parseInt(editFat, 10);

    if (isNaN(c) || c < 500 || c > 8000) {
      setPrefNotice('Please enter a valid calorie target (500 - 8000 kcal).');
      return;
    }

    await updateProfile({
      dailyCalories: c,
      proteinG: isNaN(p) ? profile.proteinG : p,
      carbsG: isNaN(cb) ? profile.carbsG : cb,
      fatG: isNaN(f) ? profile.fatG : f,
    });

    setSheetSuccessMessage('Nutrition targets updated!');
    setTimeout(() => {
      setActiveModal(null);
      setSheetSuccessMessage(null);
    }, 600);
  };

  const handleToggleUnit = async () => {
    const next = profile.unitPreference === 'metric' ? 'imperial' : 'metric';
    await updateProfile({ unitPreference: next });
  };

  const handleSelectLanguage = async (lang: string) => {
    setCurrentLang(lang);
    await updateProfile({ language: lang });
    setSheetSuccessMessage(`Language set to ${lang}`);
    setTimeout(() => {
      setActiveModal(null);
      setSheetSuccessMessage(null);
    }, 500);
  };

  const handleToggleFamilyPlan = async () => {
    const next = !profile.hasFamilyPlan;
    await updateProfile({ hasFamilyPlan: next });
    setSheetSuccessMessage(next ? 'Family Plan activated!' : 'Family Plan deactivated');
    setTimeout(() => {
      setActiveModal(null);
      setSheetSuccessMessage(null);
    }, 600);
  };

  const handleOpenExternal = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // Fallback
    }
  };

  const handleSignOut = () => {
    setActiveModal(null);
    router.replace('/');
  };

  const handleDeleteAccount = async () => {
    await resetAllData();
    setActiveModal(null);
    router.replace('/');
  };

  return (
    <View collapsable={false} className="flex-1 bg-[#F4F4F6]" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + BottomTabInset + 28 }}
      >
        <Text className="ml-[22px] mt-[10px] text-[34px] font-bold tracking-[-0.8px] text-black">
          Profile
        </Text>

        {/* Profile Card */}
        <View className="mx-[18px] mt-[18px] flex-row items-center rounded-[20px] bg-white p-[16px]">
          <View className="h-[56px] w-[56px] items-center justify-center rounded-full bg-[#F1F1F6]">
            <Icon name="person.fill" size={26} color="#B4B4BC" />
          </View>
          <View className="ml-[14px] flex-1">
            <Text numberOfLines={1} className="text-[20px] font-bold text-black">
              Your profile
            </Text>
            <Text numberOfLines={1} className="mt-[2px] text-[15px] text-[#8A8A90]">
              {profile.hasFamilyPlan ? 'Family Plan Member' : 'Signed in'}
            </Text>
          </View>
        </View>

        {/* Account Section */}
        <SectionTitle>Account</SectionTitle>
        <Card>
          <Row icon="calendar" label="Member since" value={memberSince} />
          <Row
            divider
            icon="person.text.rectangle"
            label="Personal Details"
            onPress={openPersonalModal}
          />
          <Row
            divider
            icon="gearshape"
            label="Preferences"
            onPress={openPreferencesModal}
          />
          <Row
            divider
            icon="globe"
            label="Language"
            value={currentLang}
            onPress={() => {
              setSheetSuccessMessage(null);
              setActiveModal('language');
            }}
          />
          <Row
            divider
            icon="person.2.badge.plus"
            label="Upgrade to Family Plan"
            value={profile.hasFamilyPlan ? 'Active' : undefined}
            onPress={() => {
              setSheetSuccessMessage(null);
              setActiveModal('family');
            }}
          />
        </Card>

        {/* About Section */}
        <SectionTitle>About</SectionTitle>
        <Card>
          <Row
            icon="hand.raised"
            label="Privacy Policy"
            onPress={() => setActiveModal('privacy')}
          />
          <Row
            divider
            icon="doc.text"
            label="Terms of Service"
            onPress={() => setActiveModal('terms')}
          />
        </Card>

        {/* Support Section */}
        <SectionTitle>Support</SectionTitle>
        <Card>
          <Row
            icon="bubble.left.and.text.bubble.right"
            label="Send feedback"
            onPress={() => {
              setFeedbackSubmitted(false);
              setFeedbackText('');
              setActiveModal('feedback');
            }}
          />
        </Card>

        {/* Sign out */}
        <View className="mt-[26px]">
          <Card>
            <Row
              icon="rectangle.portrait.and.arrow.right"
              label="Sign out"
              onPress={() => setActiveModal('signout')}
            />
          </Card>
        </View>

        {/* Delete Account */}
        <View className="mt-[10px]">
          <Card>
            <Row
              icon="trash"
              label="Delete your account"
              tint="#E5484D"
              onPress={() => setActiveModal('delete')}
            />
          </Card>
        </View>
        <Text className="mt-[10px] px-[26px] text-[13px] leading-[18px] text-[#A0A0A8]">
          Deleting your account removes your profile and meal history for good.
        </Text>
      </ScrollView>

      {/* Bulletproof Bottom Sheet Modal Container */}
      {activeModal && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveModal(null)}
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            {/* Independent Backdrop Sibling - tapping outside closes */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setActiveModal(null)}
              accessibilityLabel="Dismiss sheet"
            />

            {/* Independent Sheet Container - NOT inside a Pressable! */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardContainer}
            >
              <View style={[styles.sheetCard, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
                {/* Drag Indicator */}
                <View className="h-[5px] w-[38px] self-center rounded-full bg-[#E2E2E7] mb-[16px]" />

                {/* Optional Status Banner */}
                {sheetSuccessMessage && (
                  <View className="mb-[14px] flex-row items-center justify-center rounded-[12px] bg-[#EBF9F1] py-[10px] px-[14px]">
                    <Icon name="checkmark.circle.fill" size={18} color="#27A745" />
                    <Text className="ml-[8px] text-[14px] font-semibold text-[#1F7A38]">
                      {sheetSuccessMessage}
                    </Text>
                  </View>
                )}

                {/* 1. PERSONAL DETAILS SHEET */}
                {activeModal === 'personal' && (
                  <View>
                    <Text className="text-center text-[20px] font-bold text-black mb-[16px]">
                      Personal Details
                    </Text>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{ maxHeight: 380 }}
                      contentContainerStyle={{ gap: 14, paddingBottom: 10 }}
                    >
                      {/* Height */}
                      <View>
                        <Text className="text-[13px] font-semibold text-[#8A8A90] mb-[6px]">
                          Current Height ({profile.unitPreference === 'imperial' ? 'inches' : 'cm'})
                        </Text>
                        <TextInput
                          value={height}
                          onChangeText={setHeight}
                          keyboardType="numeric"
                          placeholder={profile.unitPreference === 'imperial' ? '69' : '175'}
                          className="h-[46px] rounded-[12px] border border-[#EDEDEF] bg-[#F8F8FA] px-[14px] text-[16px] text-black font-semibold"
                        />
                      </View>

                      {/* Weight & Target Weight */}
                      <View className="flex-row gap-[12px]">
                        <View className="flex-1">
                          <Text className="text-[13px] font-semibold text-[#8A8A90] mb-[6px]">
                            Weight ({profile.unitPreference === 'imperial' ? 'lbs' : 'kg'})
                          </Text>
                          <TextInput
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                            placeholder={profile.unitPreference === 'imperial' ? '155' : '70'}
                            className="h-[46px] rounded-[12px] border border-[#EDEDEF] bg-[#F8F8FA] px-[14px] text-[16px] text-black font-semibold"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[13px] font-semibold text-[#8A8A90] mb-[6px]">
                            Target Weight ({profile.unitPreference === 'imperial' ? 'lbs' : 'kg'})
                          </Text>
                          <TextInput
                            value={targetWeight}
                            onChangeText={setTargetWeight}
                            keyboardType="numeric"
                            placeholder={profile.unitPreference === 'imperial' ? '155' : '70'}
                            className="h-[46px] rounded-[12px] border border-[#EDEDEF] bg-[#F8F8FA] px-[14px] text-[16px] text-black font-semibold"
                          />
                        </View>
                      </View>

                      {/* Goal */}
                      <View>
                        <Text className="text-[13px] font-semibold text-[#8A8A90] mb-[6px]">
                          Dietary Goal
                        </Text>
                        <View className="flex-row gap-[8px]">
                          {(
                            [
                              { key: 'lose', label: 'Lose Weight' },
                              { key: 'maintain', label: 'Maintain' },
                              { key: 'gain', label: 'Gain Muscle' },
                            ] as const
                          ).map((item) => (
                            <Pressable
                              key={item.key}
                              onPress={() => setGoal(item.key)}
                              className={`flex-1 py-[11px] rounded-[12px] items-center border ${
                                goal === item.key
                                  ? 'bg-black border-black'
                                  : 'bg-white border-[#EDEDEF]'
                              }`}
                            >
                              <Text
                                className={`text-[12px] font-bold ${
                                  goal === item.key ? 'text-white' : 'text-black'
                                }`}
                              >
                                {item.label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      {/* Diet Preference */}
                      <View>
                        <Text className="text-[13px] font-semibold text-[#8A8A90] mb-[6px]">
                          Diet Style
                        </Text>
                        <View className="flex-row flex-wrap gap-[8px]">
                          {(['classic', 'keto', 'vegan', 'vegetarian'] as const).map((d) => (
                            <Pressable
                              key={d}
                              onPress={() => setDiet(d)}
                              className={`px-[16px] py-[9px] rounded-[12px] border ${
                                diet === d ? 'bg-black border-black' : 'bg-white border-[#EDEDEF]'
                              }`}
                            >
                              <Text
                                className={`text-[13px] font-semibold capitalize ${
                                  diet === d ? 'text-white' : 'text-black'
                                }`}
                              >
                                {d}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      {/* Recalculate macro checkbox */}
                      <Pressable
                        onPress={() => setRecalcMacros(!recalcMacros)}
                        className="flex-row items-center rounded-[12px] border border-[#EDEDEF] bg-[#F8F8FA] p-[12px] mt-[4px]"
                      >
                        <View
                          className={`h-[20px] w-[20px] items-center justify-center rounded-[6px] border ${
                            recalcMacros ? 'bg-black border-black' : 'border-[#C2C2C9] bg-white'
                          }`}
                        >
                          {recalcMacros && <Icon name="checkmark" size={14} color="#FFFFFF" />}
                        </View>
                        <Text className="ml-[10px] flex-1 text-[13px] font-medium text-black">
                          Auto-update daily calorie & macro targets from these stats
                        </Text>
                      </Pressable>
                    </ScrollView>

                    {/* Actions */}
                    <View className="mt-[18px] flex-row gap-[10px]">
                      <Pressable
                        onPress={() => setActiveModal(null)}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#F0F0F3] active:opacity-70"
                      >
                        <Text className="text-[15px] font-semibold text-black">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleSavePersonal}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-black active:opacity-90"
                      >
                        <Text className="text-[15px] font-semibold text-white">Save Changes</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 2. PREFERENCES SHEET */}
                {activeModal === 'preferences' && (
                  <View>
                    <Text className="text-center text-[20px] font-bold text-black mb-[16px]">
                      Preferences & Daily Goals
                    </Text>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{ maxHeight: 380 }}
                      contentContainerStyle={{ gap: 14, paddingBottom: 10 }}
                    >
                      {/* Unit System */}
                      <View className="flex-row items-center justify-between rounded-[14px] border border-[#EDEDEF] bg-[#F8F8FA] p-[14px]">
                        <View>
                          <Text className="text-[15px] font-semibold text-black">Unit System</Text>
                          <Text className="text-[12px] text-[#8A8A90] mt-[1px]">
                            {profile.unitPreference === 'metric'
                              ? 'Metric (Kilograms, Centimeters)'
                              : 'Imperial (Pounds, Inches)'}
                          </Text>
                        </View>
                        <Pressable
                          onPress={handleToggleUnit}
                          className="rounded-full bg-black px-[16px] py-[7px] active:opacity-80"
                        >
                          <Text className="text-[12px] font-bold text-white uppercase tracking-wider">
                            {profile.unitPreference}
                          </Text>
                        </Pressable>
                      </View>

                      {/* Daily Calorie Target */}
                      <View>
                        <View className="flex-row items-center justify-between mb-[4px]">
                          <Text className="text-[13px] font-semibold text-[#8A8A90]">
                            Daily Calorie Target
                          </Text>
                          <Text className="text-[12px] font-bold text-black">kcal</Text>
                        </View>
                        <TextInput
                          value={editCalories}
                          onChangeText={setEditCalories}
                          keyboardType="numeric"
                          className="h-[46px] rounded-[12px] border border-[#EDEDEF] bg-[#F8F8FA] px-[14px] text-[18px] font-bold text-black"
                        />
                      </View>

                      {/* Macros Row */}
                      <View className="flex-row gap-[10px]">
                        <View className="flex-1">
                          <Text className="text-[12px] font-semibold text-[#F4685C] mb-[4px]">
                            Protein (g)
                          </Text>
                          <TextInput
                            value={editProtein}
                            onChangeText={setEditProtein}
                            keyboardType="numeric"
                            className="h-[46px] rounded-[12px] border border-[#EDEDEF] bg-[#F8F8FA] px-[12px] text-[16px] font-bold text-black"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[12px] font-semibold text-[#F0A424] mb-[4px]">
                            Carbs (g)
                          </Text>
                          <TextInput
                            value={editCarbs}
                            onChangeText={setEditCarbs}
                            keyboardType="numeric"
                            className="h-[46px] rounded-[12px] border border-[#EDEDEF] bg-[#F8F8FA] px-[12px] text-[16px] font-bold text-black"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[12px] font-semibold text-[#F7C948] mb-[4px]">
                            Fat (g)
                          </Text>
                          <TextInput
                            value={editFat}
                            onChangeText={setEditFat}
                            keyboardType="numeric"
                            className="h-[46px] rounded-[12px] border border-[#EDEDEF] bg-[#F8F8FA] px-[12px] text-[16px] font-bold text-black"
                          />
                        </View>
                      </View>

                      {prefNotice && (
                        <Text className="text-[12px] text-[#27A745] font-medium leading-[16px]">
                          {prefNotice}
                        </Text>
                      )}

                      {/* Recalculate button */}
                      <Pressable
                        onPress={handleAutoRecalcPreferences}
                        className="flex-row items-center justify-center rounded-[12px] border border-[#EDEDEF] bg-white py-[11px] active:bg-[#F8F8FA]"
                      >
                        <Icon name="arrow.counterclockwise" size={16} color="#000000" />
                        <Text className="ml-[8px] text-[13px] font-semibold text-black">
                          Auto-calculate from my profile stats
                        </Text>
                      </Pressable>
                    </ScrollView>

                    {/* Actions */}
                    <View className="mt-[18px] flex-row gap-[10px]">
                      <Pressable
                        onPress={() => setActiveModal(null)}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#F0F0F3] active:opacity-70"
                      >
                        <Text className="text-[15px] font-semibold text-black">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleSavePreferences}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-black active:opacity-90"
                      >
                        <Text className="text-[15px] font-semibold text-white">Save Targets</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 3. LANGUAGE SHEET */}
                {activeModal === 'language' && (
                  <View>
                    <Text className="text-center text-[20px] font-bold text-black mb-[16px]">
                      Select Language
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
                      <View className="gap-[8px]">
                        {languages.map((lang) => (
                          <Pressable
                            key={lang}
                            onPress={() => handleSelectLanguage(lang)}
                            android_ripple={{ color: '#EBEBEF' }}
                            className={`flex-row items-center justify-between p-[15px] rounded-[14px] border ${
                              currentLang === lang
                                ? 'border-black bg-[#F8F8FA]'
                                : 'border-[#EDEDEF] bg-white'
                            }`}
                          >
                            <Text
                              className={`text-[16px] ${
                                currentLang === lang
                                  ? 'font-bold text-black'
                                  : 'font-medium text-[#222225]'
                              }`}
                            >
                              {lang}
                            </Text>
                            {currentLang === lang && (
                              <Icon name="checkmark" size={18} color="#000000" />
                            )}
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>

                    <Pressable
                      onPress={() => setActiveModal(null)}
                      className="mt-[16px] h-[48px] items-center justify-center rounded-[14px] bg-[#F0F0F3] active:opacity-70"
                    >
                      <Text className="text-[15px] font-semibold text-black">Done</Text>
                    </Pressable>
                  </View>
                )}

                {/* 4. FAMILY PLAN SHEET */}
                {activeModal === 'family' && (
                  <View>
                    <View className="h-[56px] w-[56px] items-center justify-center rounded-full bg-[#F0F0F5] self-center mb-[12px]">
                      <Icon name="person.2.badge.plus" size={28} color="#000000" />
                    </View>
                    <Text className="text-[22px] font-bold text-black text-center">
                      Salado AI Family Plan
                    </Text>
                    <Text className="mt-[6px] text-center text-[14px] leading-[20px] text-[#6E6E78] px-[10px]">
                      Share nutrition tracking, instant AI photo meal scanning, and personalized
                      macros with up to 5 family members.
                    </Text>

                    <View className="mt-[18px] gap-[10px] rounded-[16px] bg-[#F8F8FA] p-[16px] border border-[#EDEDEF]">
                      <View className="flex-row items-center gap-[10px]">
                        <Icon name="checkmark" size={16} color="#000000" />
                        <Text className="text-[14px] text-black">
                          5 individual accounts under one household
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-[10px]">
                        <Icon name="checkmark" size={16} color="#000000" />
                        <Text className="text-[14px] text-black">
                          Custom calorie and macro targets for each member
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-[10px]">
                        <Icon name="checkmark" size={16} color="#000000" />
                        <Text className="text-[14px] text-black">
                          Unlimited instant food & recipe recognition
                        </Text>
                      </View>
                    </View>

                    <View className="mt-[20px] flex-row gap-[10px]">
                      <Pressable
                        onPress={() => setActiveModal(null)}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#F0F0F3] active:opacity-70"
                      >
                        <Text className="text-[15px] font-semibold text-black">Close</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleToggleFamilyPlan}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-black active:opacity-90"
                      >
                        <Text className="text-[15px] font-semibold text-white">
                          {profile.hasFamilyPlan ? 'Deactivate Plan' : 'Activate (Test Mode)'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 5. PRIVACY POLICY SHEET */}
                {activeModal === 'privacy' && (
                  <View>
                    <Text className="text-[20px] font-bold text-black text-center mb-[14px]">
                      Privacy Policy
                    </Text>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{ maxHeight: 320 }}
                      className="mb-[16px]"
                    >
                      <Text className="text-[14px] leading-[22px] text-[#4A4A52]">
                        Your privacy is our highest priority at Salado AI.
                        {'\n\n'}
                        1. <Text className="font-bold text-black">Camera & Food Photos</Text>:
                        Photos captured through Salado AI are processed solely for identifying food
                        items, ingredients, and estimating nutritional values. They are never sold or
                        shared with third-party advertisers.
                        {'\n\n'}
                        2. <Text className="font-bold text-black">On-Device Storage</Text>: In
                        testing and offline mode, your questionnaire answers, targets, and logged
                        meals remain stored safely on your device.
                        {'\n\n'}
                        3. <Text className="font-bold text-black">Full Data Control</Text>: You
                        retain complete ownership of your dietary records. You can reset or wipe all
                        data at any moment using &quot;Delete your account&quot;.
                      </Text>
                    </ScrollView>

                    <View className="flex-row gap-[10px]">
                      <Pressable
                        onPress={() => handleOpenExternal(PRIVACY_URL)}
                        className="h-[48px] flex-1 flex-row items-center justify-center rounded-[14px] border border-[#EDEDEF] bg-[#F8F8FA] active:bg-[#EEEEF0]"
                      >
                        <Icon name="open.outline" size={16} color="#000000" />
                        <Text className="ml-[6px] text-[14px] font-semibold text-black">
                          Web Version
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setActiveModal(null)}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-black active:opacity-90"
                      >
                        <Text className="text-[14px] font-semibold text-white">Done</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 6. TERMS OF SERVICE SHEET */}
                {activeModal === 'terms' && (
                  <View>
                    <Text className="text-[20px] font-bold text-black text-center mb-[14px]">
                      Terms of Service
                    </Text>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{ maxHeight: 320 }}
                      className="mb-[16px]"
                    >
                      <Text className="text-[14px] leading-[22px] text-[#4A4A52]">
                        Welcome to Salado AI. By utilizing the app, you acknowledge and agree to these
                        terms:
                        {'\n\n'}
                        1. <Text className="font-bold text-black">General Wellness Use</Text>:
                        Nutritional estimations, calorie totals, and macro distributions are
                        provided for informational and wellness tracking purposes. They do not
                        constitute medical or clinical dietary prescriptions.
                        {'\n\n'}
                        2. <Text className="font-bold text-black">Image Submissions</Text>: Users
                        agree to submit photos exclusively of meals, snacks, groceries, and
                        beverages.
                        {'\n\n'}
                        3. <Text className="font-bold text-black">Account Security</Text>: You are
                        responsible for maintaining the privacy and security of your device.
                      </Text>
                    </ScrollView>

                    <View className="flex-row gap-[10px]">
                      <Pressable
                        onPress={() => handleOpenExternal(TERMS_URL)}
                        className="h-[48px] flex-1 flex-row items-center justify-center rounded-[14px] border border-[#EDEDEF] bg-[#F8F8FA] active:bg-[#EEEEF0]"
                      >
                        <Icon name="open.outline" size={16} color="#000000" />
                        <Text className="ml-[6px] text-[14px] font-semibold text-black">
                          Web Version
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setActiveModal(null)}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-black active:opacity-90"
                      >
                        <Text className="text-[14px] font-semibold text-white">Done</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 7. SEND FEEDBACK SHEET */}
                {activeModal === 'feedback' && (
                  <View>
                    <Text className="text-[20px] font-bold text-black text-center mb-[4px]">
                      Send Feedback
                    </Text>
                    <Text className="text-center text-[14px] text-[#6E6E78] mb-[16px]">
                      Tell us how we can make Salado AI better for you.
                    </Text>

                    {feedbackSubmitted ? (
                      <View className="items-center py-[16px]">
                        <Icon name="checkmark.circle.fill" size={48} color="#27A745" />
                        <Text className="mt-[12px] text-[18px] font-bold text-black">
                          Thank you!
                        </Text>
                        <Text className="mt-[4px] text-center text-[14px] text-[#6E6E78]">
                          Your feedback has been received and will help improve Salado AI.
                        </Text>
                        <Pressable
                          onPress={() => setActiveModal(null)}
                          className="mt-[20px] h-[48px] w-full items-center justify-center rounded-[14px] bg-black active:opacity-90"
                        >
                          <Text className="text-[15px] font-semibold text-white">Done</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View>
                        {/* Category Selector */}
                        <View className="flex-row gap-[8px] mb-[14px]">
                          {(['Idea', 'Bug', 'Question'] as const).map((cat) => (
                            <Pressable
                              key={cat}
                              onPress={() => setFeedbackCategory(cat)}
                              className={`flex-1 py-[8px] rounded-[10px] items-center border ${
                                feedbackCategory === cat
                                  ? 'bg-black border-black'
                                  : 'bg-white border-[#EDEDEF]'
                              }`}
                            >
                              <Text
                                className={`text-[12px] font-semibold ${
                                  feedbackCategory === cat ? 'text-white' : 'text-black'
                                }`}
                              >
                                {cat}
                              </Text>
                            </Pressable>
                          ))}
                        </View>

                        {/* Star Rating */}
                        <View className="flex-row justify-center gap-[10px] mb-[14px]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Pressable key={star} onPress={() => setFeedbackRating(star)}>
                              <Icon
                                name="star.fill"
                                size={28}
                                color={star <= feedbackRating ? '#FFB800' : '#E2E2E7'}
                              />
                            </Pressable>
                          ))}
                        </View>

                        {/* Message Input */}
                        <TextInput
                          value={feedbackText}
                          onChangeText={setFeedbackText}
                          placeholder="What can we improve? Feature requests, bugs, notes..."
                          placeholderTextColor="#9A9AA0"
                          multiline
                          numberOfLines={4}
                          className="min-h-[100px] rounded-[14px] border border-[#EDEDEF] bg-[#F8F8FA] p-[14px] text-[15px] text-black text-align-top mb-[18px]"
                        />

                        {/* Actions */}
                        <View className="flex-row gap-[10px]">
                          <Pressable
                            onPress={() => setActiveModal(null)}
                            className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#F0F0F3] active:opacity-70"
                          >
                            <Text className="text-[15px] font-semibold text-black">Cancel</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (!feedbackText.trim()) return;
                              setFeedbackSubmitted(true);
                            }}
                            className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-black active:opacity-90"
                          >
                            <Text className="text-[15px] font-semibold text-white">Submit</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* 8. SIGN OUT CONFIRMATION SHEET */}
                {activeModal === 'signout' && (
                  <View>
                    <View className="h-[56px] w-[56px] items-center justify-center rounded-full bg-[#F0F0F5] self-center mb-[12px]">
                      <Icon name="rectangle.portrait.and.arrow.right" size={26} color="#000000" />
                    </View>
                    <Text className="text-[20px] font-bold text-black text-center">
                      Sign out?
                    </Text>
                    <Text className="mt-[6px] text-center text-[14px] leading-[20px] text-[#6E6E78] px-[16px]">
                      You can sign back in anytime. Your profile and nutrition targets will remain saved on this device.
                    </Text>

                    <View className="mt-[22px] flex-row gap-[10px]">
                      <Pressable
                        onPress={() => setActiveModal(null)}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#F0F0F3] active:opacity-70"
                      >
                        <Text className="text-[15px] font-semibold text-black">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleSignOut}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-black active:opacity-90"
                      >
                        <Text className="text-[15px] font-semibold text-white">Sign out</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 9. DELETE ACCOUNT CONFIRMATION SHEET */}
                {activeModal === 'delete' && (
                  <View>
                    <View className="h-[56px] w-[56px] items-center justify-center rounded-full bg-[#FDE8E8] self-center mb-[12px]">
                      <Icon name="trash" size={26} color="#E5484D" />
                    </View>
                    <Text className="text-[20px] font-bold text-[#E5484D] text-center">
                      Delete your account?
                    </Text>
                    <Text className="mt-[6px] text-center text-[14px] leading-[20px] text-[#6E6E78] px-[12px]">
                      This permanently deletes your profile, target calories, and every single logged meal. This action cannot be undone.
                    </Text>

                    <View className="mt-[22px] flex-row gap-[10px]">
                      <Pressable
                        onPress={() => setActiveModal(null)}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#F0F0F3] active:opacity-70"
                      >
                        <Text className="text-[15px] font-semibold text-black">Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleDeleteAccount}
                        className="h-[48px] flex-1 items-center justify-center rounded-[14px] bg-[#E5484D] active:opacity-90"
                      >
                        <Text className="text-[15px] font-semibold text-white">
                          Permanently Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    pointerEvents: 'box-none',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 16,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 24,
  },
});
