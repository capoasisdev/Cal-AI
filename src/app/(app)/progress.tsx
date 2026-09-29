import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
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
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Icon } from '@/components/Icon';
import { BottomTabInset } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

type TimeRange = 'Week' | 'Month' | '3M' | '6M' | 'Year';
const TIME_TABS: TimeRange[] = ['Week', 'Month', '3M', '6M', 'Year'];

const GREEN = '#4CAF50';
const GREEN_LIGHT = '#E8F5E9';
const GREEN_DARK = '#2E7D32';
const AMBER = '#F5A623';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, meals, weightLogs, addWeightLog } = useApp();

  const [activeTab, setActiveTab] = useState<TimeRange>('Week');
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedBarIdx, setSelectedBarIdx] = useState(6);
  const [chartWidth, setChartWidth] = useState(300);

  const isImperial = profile.unitPreference === 'imperial';
  const unitLabel = isImperial ? 'lbs' : 'kg';
  const toDisplay = (kg: number) =>
    isImperial ? (kg * 2.20462).toFixed(1) : kg.toFixed(1);
  const toKg = (val: number) => (isImperial ? val / 2.20462 : val);

  const currentWeightKg = profile.weightKg || 74;
  const targetWeightKg = profile.targetWeightKg || 70;

  const sortedLogsAsc = useMemo(
    () => [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [weightLogs]
  );
  const startingWeightKg =
    sortedLogsAsc.length > 0 ? sortedLogsAsc[0].weightKg : currentWeightKg + 0.8;
  const weightDiff = currentWeightKg - startingWeightKg;

  const last7 = useMemo(() => {
    const today = new Date();
    const target = profile.dailyCalories || 2178;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMeals = meals.filter((m) => m.loggedAt.startsWith(iso));
      const calories = dayMeals.reduce((s, m) => s + (m.calories || 0), 0);
      const protein = dayMeals.reduce((s, m) => s + (m.proteinG || 0), 0);
      const carbs = dayMeals.reduce((s, m) => s + (m.carbsG || 0), 0);
      const fat = dayMeals.reduce((s, m) => s + (m.fatG || 0), 0);
      return { iso, dayName, calories, protein, carbs, fat, target, isToday: i === 6 };
    });
  }, [meals, profile.dailyCalories]);

  const activeDays = last7.filter((d) => d.calories > 0);
  const avgCalories = activeDays.length
    ? Math.round(activeDays.reduce((s, d) => s + d.calories, 0) / activeDays.length)
    : 0;
  const onTargetDays = last7.filter((d) => {
    const ratio = d.calories / (d.target || 1);
    return d.calories > 0 && ratio >= 0.8 && ratio <= 1.2;
  }).length;
  const pctOnTarget = last7[0]?.target
    ? Math.round((avgCalories / last7[0].target) * 100)
    : 0;

  const todayData = last7[6];
  const targetProtein = profile.proteinG || 133;
  const targetCarbs = profile.carbsG || 274;
  const targetFat = profile.fatG || 61;

  const todayMeals = meals.filter((m) => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return m.loggedAt.startsWith(iso);
  });

  const maxCal = Math.max(last7[0]?.target || 2200, ...last7.map((d) => d.calories), 1);
  const BAR_MAX_H = 120;
  const goalBarH = ((last7[0]?.target || 2200) / maxCal) * BAR_MAX_H;

  const trendPoints = useMemo(() => {
    if (sortedLogsAsc.length >= 2) {
      return sortedLogsAsc.slice(-8).map((l) => l.weightKg);
    }
    const diff = profile.goal === 'lose' ? 0.12 : profile.goal === 'gain' ? -0.1 : 0;
    return Array.from({ length: 8 }, (_, i) => currentWeightKg + diff * (7 - i));
  }, [sortedLogsAsc, currentWeightKg, profile.goal]);

  const svgW = chartWidth - 4;
  const svgH = 70;
  const padX = 10;
  const minW = Math.min(...trendPoints) - 0.5;
  const maxW = Math.max(...trendPoints) + 0.5;
  const rangeW = maxW - minW || 1;
  const tCoords = trendPoints.map((w, i) => ({
    x: padX + (i / Math.max(1, trendPoints.length - 1)) * (svgW - padX * 2),
    y: 8 + (svgH - 16) * (1 - (w - minW) / rangeW),
  }));
  const linePath = tCoords.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const [inputWeight, setInputWeight] = useState(toDisplay(currentWeightKg));
  const [saveOk, setSaveOk] = useState(false);

  const handleSave = async () => {
    const parsed = parseFloat(inputWeight);
    if (isNaN(parsed) || parsed <= 0) return;
    await addWeightLog(parseFloat(toKg(parsed).toFixed(1)));
    setSaveOk(true);
    setTimeout(() => {
      setShowLogModal(false);
      setSaveOk(false);
    }, 700);
  };

  const handleAdj = (d: number) => {
    const v = parseFloat(inputWeight) || currentWeightKg;
    setInputWeight(Math.max(10, v + d).toFixed(1));
  };

  return (
    <View collapsable={false} style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSub}>Past 7 Days</Text>
        </View>
        <View style={styles.calIcon}>
          <Icon name="calendar" size={20} color="#333" />
        </View>
      </View>

      {/* Time Tabs */}
      <View style={styles.tabRow}>
        {TIME_TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + BottomTabInset + 28 }]}
      >
        {/* ── Average Daily Intake ─────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>AVERAGE DAILY INTAKE</Text>
              <View style={styles.row}>
                <Text style={styles.bigNum}>
                  {avgCalories > 0 ? avgCalories.toLocaleString() : '—'}
                </Text>
                <Text style={styles.bigUnit}> kcal/day</Text>
              </View>
            </View>
            <View style={styles.greenBadge}>
              <Text style={styles.greenBadgeText}>✓ {pctOnTarget}% on target</Text>
            </View>
          </View>
          <Text style={styles.subText}>Target: {(last7[0]?.target || 0).toLocaleString()} kcal</Text>

          {/* Bar Chart */}
          <View
            onLayout={(e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width)}
            style={{ marginTop: 14 }}
          >
            <View style={[styles.goalLine, { bottom: 26 + goalBarH }]}>
              <Text style={styles.goalLineLabel}>Goal: {last7[0]?.target || 0}</Text>
            </View>

            <View style={[styles.row, { alignItems: 'flex-end', height: BAR_MAX_H + 26 }]}>
              {last7.map((d, idx) => {
                const barH = d.calories > 0
                  ? Math.max(6, (d.calories / maxCal) * BAR_MAX_H)
                  : 0;
                const isSelected = idx === selectedBarIdx;
                return (
                  <Pressable
                    key={d.iso}
                    onPress={() => setSelectedBarIdx(idx)}
                    style={{ flex: 1, alignItems: 'center' }}
                  >
                    <View style={[styles.barTrack, { height: BAR_MAX_H }]}>
                      {d.calories > 0 && (
                        <View
                          style={[
                            styles.barFill,
                            { height: barH },
                            isSelected || d.isToday ? styles.barAmber : styles.barGray,
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.barLbl,
                        d.isToday && styles.barLblToday,
                        isSelected && styles.barLblSelected,
                      ]}
                    >
                      {d.isToday ? 'Today' : d.dayName.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Weight Trend ─────────────────────────────────────────────── */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={[styles.row, { marginBottom: 12 }]}>
            <View style={styles.iconCircle}>
              <Icon name="scale" size={18} color={GREEN} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.sectionTitle}>Weight Trend</Text>
              <Text style={styles.greenSubtext}>
                {weightDiff <= 0
                  ? `${Math.abs(weightDiff).toFixed(1)} kg lost since start`
                  : `+${weightDiff.toFixed(1)} kg since start`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.currentWeightNum}>{toDisplay(currentWeightKg)}</Text>
              <Text style={styles.currentWeightUnit}> {unitLabel}</Text>
            </View>
          </View>

          {/* SVG Line Chart */}
          <View style={{ height: svgH + 4 }}
            onLayout={(e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width)}
          >
            <Svg width={svgW} height={svgH}>
              <Line
                x1={padX} y1={svgH - 2} x2={svgW - padX} y2={svgH - 2}
                stroke="#E0E0E0" strokeWidth="1" strokeDasharray="4,4"
              />
              {linePath ? (
                <Path
                  d={linePath}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {tCoords.map((pt, i) => (
                <Circle
                  key={i}
                  cx={pt.x} cy={pt.y}
                  r={i === tCoords.length - 1 ? 5.5 : 4}
                  fill={i === tCoords.length - 1 ? GREEN : 'white'}
                  stroke={GREEN}
                  strokeWidth="2"
                />
              ))}
            </Svg>
          </View>

          <View style={styles.dashedDiv} />

          {/* STARTING / CURRENT / GOAL */}
          <View style={[styles.row, { marginTop: 14 }]}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.statLbl}>STARTING</Text>
              <Text style={styles.statVal}>{toDisplay(startingWeightKg)} {unitLabel}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[styles.statLbl, { color: GREEN }]}>CURRENT</Text>
              <Text style={[styles.statVal, { color: GREEN }]}>{toDisplay(currentWeightKg)} {unitLabel}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.statLbl}>GOAL</Text>
              <Text style={styles.statVal}>{toDisplay(targetWeightKg)} {unitLabel}</Text>
            </View>
          </View>
        </View>

        {/* ── Macro Nutrients Logged ─────────────────────────────────────── */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={[styles.row, { marginBottom: 14 }]}>
            <Icon name="clock" size={16} color={GREEN} />
            <Text style={[styles.sectionTitle, { marginLeft: 8, flex: 1 }]}>Macro Nutrients Logged</Text>
            <Text style={styles.subText}>Current Distribution</Text>
          </View>
          <View style={styles.row}>
            {/* Protein */}
            <View style={[styles.macroBox, styles.macroBlue]}>
              <Text style={[styles.macroName, { color: '#1565C0' }]}>PROTEIN</Text>
              <Text style={[styles.macroAmt, { color: '#1565C0' }]}>{todayData.protein}g</Text>
              <Text style={styles.macroTgt}>/{targetProtein}g target</Text>
            </View>
            {/* Carbs */}
            <View style={[styles.macroBox, styles.macroOrange]}>
              <Text style={[styles.macroName, { color: '#E65100' }]}>CARBS</Text>
              <Text style={[styles.macroAmt, { color: '#E65100' }]}>{todayData.carbs}g</Text>
              <Text style={styles.macroTgt}>/{targetCarbs}g target</Text>
            </View>
            {/* Fat */}
            <View style={[styles.macroBox, styles.macroGreen]}>
              <Text style={[styles.macroName, { color: GREEN_DARK }]}>FAT</Text>
              <Text style={[styles.macroAmt, { color: GREEN_DARK }]}>{todayData.fat}g</Text>
              <Text style={styles.macroTgt}>/{targetFat}g target</Text>
            </View>
          </View>
        </View>

        {/* ── Logging Rate + Active Streak ──────────────────────────────── */}
        <View style={[styles.row, { marginTop: 12, gap: 12 }]}>
          <View style={[styles.card, { flex: 1 }]}>
            <View style={[styles.row, { marginBottom: 4 }]}>
              <Text style={styles.sectionTitle}>Logging Rate</Text>
              <Icon name="checkmark.circle.fill" size={18} color={GREEN} />
            </View>
            <Text style={styles.bigStatNum}>{pctOnTarget}%</Text>
            <Text style={[styles.subText, { marginTop: 2 }]}>
              {todayMeals.length} meals recorded today
            </Text>
          </View>

          <View style={[styles.card, { flex: 1 }]}>
            <View style={[styles.row, { marginBottom: 4 }]}>
              <Text style={styles.sectionTitle}>Active Streak</Text>
              <Text style={{ fontSize: 18 }}>🔥</Text>
            </View>
            <Text style={styles.bigStatNum}>{profile.streak || activeDays.length} days</Text>
            <Text style={[styles.subText, { marginTop: 2 }]}>
              Best record: {Math.max(profile.streak || 0, activeDays.length, 1)} days
            </Text>
          </View>
        </View>

        {/* ── Bottom Buttons ─────────────────────────────────────────────── */}
        <View style={[styles.row, { marginTop: 20, gap: 12 }]}>
          <Pressable onPress={() => router.replace('/(app)/home')} style={styles.btnOutline}>
            <Text style={styles.btnOutlineTxt}>Back to Dashboard</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(app)/camera')} style={styles.btnGreen}>
            <Text style={styles.btnGreenTxt}>+ Log Food</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Log Weight Modal ──────────────────────────────────────────────── */}
      {showLogModal && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowLogModal(false)} statusBarTranslucent>
          <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowLogModal(false)} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
              <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
                <View style={styles.handle} />
                <Text style={styles.sheetTitle}>Log Weight</Text>
                {saveOk && (
                  <View style={styles.successBanner}>
                    <Text style={styles.successTxt}>✓ Weight saved!</Text>
                  </View>
                )}
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <TextInput
                      value={inputWeight}
                      onChangeText={setInputWeight}
                      keyboardType="numeric"
                      style={styles.wInput}
                    />
                    <Text style={styles.wUnit}>{unitLabel}</Text>
                  </View>
                  <View style={[styles.row, { marginTop: 10, gap: 10 }]}>
                    {([-0.5, -0.1, 0.1, 0.5] as const).map((d) => (
                      <Pressable key={d} onPress={() => handleAdj(d)} style={styles.stepBtn}>
                        <Text style={styles.stepBtnLbl}>{d > 0 ? '+' : ''}{d}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={[styles.row, { gap: 10 }]}>
                  <Pressable onPress={() => setShowLogModal(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelTxt}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSave} style={styles.saveBtn}>
                    <Text style={styles.saveTxt}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  headerSub: { fontSize: 12, color: '#888', marginTop: -2 },
  calIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 18, paddingBottom: 12, gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  tabActive: { backgroundColor: GREEN },
  tabLabel: { fontSize: 14, fontWeight: '500', color: '#888' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.6 },
  bigNum: { fontSize: 36, fontWeight: '900', color: '#111', letterSpacing: -1 },
  bigUnit: { fontSize: 14, fontWeight: '500', color: '#555' },
  subText: { fontSize: 12, color: '#888' },

  // Green badge
  greenBadge: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: GREEN,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  greenBadgeText: { fontSize: 11, fontWeight: '700', color: GREEN_DARK },

  // Bar chart
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: AMBER,
    zIndex: 2,
  },
  goalLineLabel: {
    position: 'absolute',
    right: 0,
    top: -14,
    fontSize: 10,
    fontWeight: '700',
    color: AMBER,
  },
  barTrack: {
    width: 30,
    borderRadius: 15,
    backgroundColor: '#EFEFEF',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 15 },
  barAmber: { backgroundColor: AMBER },
  barGray: { backgroundColor: '#DCDCDC' },
  barLbl: { fontSize: 11, color: '#999', marginTop: 5, fontWeight: '500' },
  barLblToday: { color: GREEN, fontWeight: '700' },
  barLblSelected: { color: '#111', fontWeight: '700' },

  // Weight trend
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  greenSubtext: { fontSize: 12, color: GREEN, marginTop: 1 },
  currentWeightNum: { fontSize: 28, fontWeight: '900', color: '#111' },
  currentWeightUnit: { fontSize: 15, fontWeight: '600', color: '#888' },
  dashedDiv: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#DDD', marginTop: 12 },
  statLbl: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.5 },
  statVal: { fontSize: 15, fontWeight: '700', color: '#111', marginTop: 3 },

  // Macros
  macroBox: { flex: 1, borderRadius: 16, padding: 12, marginHorizontal: 3 },
  macroBlue: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#BBDEFB' },
  macroOrange: { backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: '#FFE0B2' },
  macroGreen: { backgroundColor: GREEN_LIGHT, borderWidth: 1, borderColor: '#C8E6C9' },
  macroName: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  macroAmt: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  macroTgt: { fontSize: 11, color: '#888', marginTop: 2 },

  // Stat cards
  bigStatNum: { fontSize: 26, fontWeight: '900', color: '#111', letterSpacing: -0.5 },

  // Bottom buttons
  btnOutline: {
    flex: 1, height: 50, borderRadius: 25,
    borderWidth: 1.5, borderColor: '#CCC',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  btnOutlineTxt: { fontSize: 14, fontWeight: '600', color: '#333' },
  btnGreen: {
    flex: 1, height: 50, borderRadius: 25,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: GREEN, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnGreenTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 14,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 14,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: 4 },
  successBanner: {
    backgroundColor: GREEN_LIGHT, borderRadius: 12,
    paddingVertical: 8, alignItems: 'center', marginBottom: 8,
  },
  successTxt: { fontSize: 14, fontWeight: '600', color: GREEN_DARK },
  wInput: { fontSize: 52, fontWeight: '900', color: '#111', textAlign: 'center', minWidth: 140 },
  wUnit: { fontSize: 22, fontWeight: '600', color: '#888', marginLeft: 6 },
  stepBtn: { backgroundColor: '#F2F2F2', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  stepBtnLbl: { fontSize: 13, fontWeight: '700', color: '#333' },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: 16,
    backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center',
  },
  cancelTxt: { fontSize: 15, fontWeight: '600', color: '#555' },
  saveBtn: {
    flex: 1, height: 50, borderRadius: 16,
    backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
  },
  saveTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
