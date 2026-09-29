import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused, useNavigation, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { IngredientModal } from '@/components/IngredientModal';
import { Images } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import { AIService, FoodAnalysisResult, Ingredient } from '@/services/aiService';

type Shot = { uri: string; base64?: string };

type EnhancedIngredient = Ingredient & {
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
};

export default function Camera() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [shot, setShot] = useState<Shot | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const isFocused = useIsFocused();
  const { addMeal } = useApp();

  // Hide the bottom tab bar while viewing the scan result
  useEffect(() => {
    if (result && shot) {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation.setOptions({ tabBarStyle: undefined });
    }
    return () => {
      navigation.setOptions({ tabBarStyle: undefined });
    };
  }, [result, shot, navigation]);

  const reset = () => {
    setShot(null);
    setResult(null);
    setAnalyzing(false);
  };

  const capture = async () => {
    try {
      const picture = await cameraRef.current?.takePictureAsync({ quality: 0.5, base64: true });
      if (picture?.uri) {
        setShot({ uri: picture.uri, base64: picture.base64 ?? undefined });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const pickFromGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        base64: true,
      });

      const asset = res.assets?.[0];
      if (asset?.uri) {
        setShot({ uri: asset.uri, base64: asset.base64 ?? undefined });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleAnalyze = async () => {
    if (!shot) return;
    setAnalyzing(true);
    try {
      const output = await AIService.analyzeFoodImage(shot.base64 || shot.uri);
      setResult(output);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const galleryButton = (
    <Pressable
      onPress={pickFromGallery}
      className="h-[52px] w-[52px] items-center justify-center rounded-full bg-[#1E1E23] active:opacity-70"
    >
      <Icon name="photo.on.rectangle" size={22} color="#FFFFFF" />
    </Pressable>
  );

  if (!permission) return <Screen />;

  if (!permission.granted) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-[40px]">
          <View className="h-[76px] w-[76px] items-center justify-center rounded-full bg-[#1E1E23]">
            <Icon name="camera.fill" size={32} color="#FFFFFF" />
          </View>
          <Text className="mt-[22px] text-center text-[22px] font-bold text-white">
            Camera access
          </Text>
          <Text className="mt-[8px] text-center text-[15px] leading-[21px] text-[#9A9AA0]">
            Salado AI reads your meals from a photo. Nothing leaves your phone until you take one.
          </Text>
          <Pressable
            onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
            className="mt-[24px] h-[52px] items-center justify-center rounded-full bg-white px-[34px] active:opacity-90"
          >
            <Text className="text-[16px] font-semibold text-black">
              {permission.canAskAgain ? 'Allow camera' : 'Open Settings'}
            </Text>
          </Pressable>
          <Pressable onPress={pickFromGallery} className="mt-[16px] p-[8px] active:opacity-70">
            <Text className="text-[15px] font-medium text-[#9A9AA0]">Choose from gallery</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (result && shot) {
    return (
      <Screen>
        <Result
          result={result}
          uri={shot.uri}
          onDone={reset}
          onSave={async (multiplier = 1, customCal, customP, customC, customF) => {
            if (result.status === 'completed') {
              await addMeal({
                name: result.name,
                imageUrl: shot.uri,
                calories: Math.round((customCal ?? result.calories) * multiplier),
                proteinG: Math.round((customP ?? result.proteinG) * multiplier),
                carbsG: Math.round((customC ?? result.carbsG) * multiplier),
                fatG: Math.round((customF ?? result.fatG) * multiplier),
                loggedAt: new Date().toISOString(),
                status: 'completed',
              });
            }
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1">
        {shot ? (
          <Image source={{ uri: shot.uri }} style={{ flex: 1 }} contentFit="cover" />
        ) : isFocused ? (
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        ) : null}
      </View>

      <View className="absolute inset-x-0 bottom-0" style={{ paddingBottom: insets.bottom + 26 }}>
        {shot ? (
          <View className="flex-row items-center justify-center gap-[12px] px-[24px]">
            <Pressable
              onPress={reset}
              disabled={analyzing}
              className="h-[56px] w-[56px] items-center justify-center rounded-full bg-[#1E1E23] active:opacity-70"
            >
              <Icon name="arrow.counterclockwise" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={handleAnalyze}
              disabled={analyzing}
              className="h-[56px] flex-1 flex-row items-center justify-center rounded-full bg-white active:opacity-90"
            >
              {analyzing ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Icon name="sparkles" size={18} color="#000000" />
                  <Text className="ml-[8px] text-[17px] font-semibold text-black">
                    Analyze the food
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View className="items-center">
            <Text className="mb-[18px] text-[15px] text-white/70">
              Fit the whole plate in frame
            </Text>
            <View className="w-full flex-row items-center justify-center">
              <View className="absolute left-[34px]">{galleryButton}</View>
              <Pressable
                onPress={capture}
                className="h-[76px] w-[76px] items-center justify-center rounded-full border-[4px] border-white/40 active:opacity-70"
              >
                <View className="h-[60px] w-[60px] rounded-full bg-white" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

function Result({
  result,
  uri,
  onDone,
  onSave,
}: {
  result: FoodAnalysisResult;
  uri: string;
  onDone: () => void;
  onSave: (
    multiplier: number,
    calories?: number,
    protein?: number,
    carbs?: number,
    fat?: number
  ) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [servings, setServings] = useState(1);
  const [saving, setSaving] = useState(false);
  const { width, height } = useWindowDimensions();

  // Ingredients state
  const [ingredientsList, setIngredientsList] = useState<EnhancedIngredient[]>(() => {
    if (result.ingredients && result.ingredients.length > 0) {
      return result.ingredients;
    }
    return [
      {
        name: result.name || 'Main Portion',
        calories: result.calories,
        portion: '1 serving',
        proteinG: result.proteinG,
        carbsG: result.carbsG,
        fatG: result.fatG,
      },
    ];
  });

  // Modal state
  const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<{
    index: number;
    item: Ingredient;
  } | null>(null);

  const isWeb = Platform.OS === 'web';
  const isWebDesktop = isWeb && width > 500;
  const screenWidth = isWebDesktop ? Math.min(width, 420) : width;
  const screenHeight = isWebDesktop ? Math.min(height, 890) : height;

  const failed = result.status === 'failed';
  const notFood = result.errorReason === 'not_food';

  const currentTimeStr = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Dynamic calories and macros calculation based on ingredients
  const totalBaseCalories = useMemo(() => {
    return ingredientsList.reduce((sum, item) => sum + (item.calories || 0), 0);
  }, [ingredientsList]);

  const totalBaseProtein = useMemo(() => {
    const fromIngs = ingredientsList.reduce((sum, item) => sum + (item.proteinG || 0), 0);
    return Math.max(result.proteinG || 0, fromIngs);
  }, [ingredientsList, result.proteinG]);

  const totalBaseCarbs = useMemo(() => {
    const fromIngs = ingredientsList.reduce((sum, item) => sum + (item.carbsG || 0), 0);
    return Math.max(result.carbsG || 0, fromIngs);
  }, [ingredientsList, result.carbsG]);

  const totalBaseFat = useMemo(() => {
    const fromIngs = ingredientsList.reduce((sum, item) => sum + (item.fatG || 0), 0);
    return Math.max(result.fatG || 0, fromIngs);
  }, [ingredientsList, result.fatG]);

  const scaledCalories = Math.round(totalBaseCalories * servings);
  const scaledProtein = Math.round(totalBaseProtein * servings);
  const scaledCarbs = Math.round(totalBaseCarbs * servings);
  const scaledFat = Math.round(totalBaseFat * servings);

  const handleAddIngredient = (item: EnhancedIngredient) => {
    setIngredientsList((prev) => [...prev, item]);
  };

  const handleUpdateIngredient = (index: number, item: EnhancedIngredient) => {
    setIngredientsList((prev) => {
      const copy = [...prev];
      copy[index] = item;
      return copy;
    });
  };

  const handleDeleteIngredient = (index: number) => {
    setIngredientsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await onSave(servings, totalBaseCalories, totalBaseProtein, totalBaseCarbs, totalBaseFat);
      onDone();
      router.push('/home');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I logged ${result.name} - ${scaledCalories} kcal with Salado AI!`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onDone}>
      <View
        className="flex-1 bg-[#121214] items-center justify-center"
        style={
          isWeb
            ? {
                position: 'fixed' as any,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                height: '100vh' as any,
                width: '100vw' as any,
                overflow: 'hidden',
              }
            : undefined
        }
      >
        <StatusBar style="light" />

        {/* Screen Frame Container */}
        <View
          style={{
            width: isWebDesktop ? screenWidth : '100%',
            height: isWebDesktop ? screenHeight : '100%',
            borderRadius: isWebDesktop ? 40 : 0,
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            ...(isWebDesktop
              ? {
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)',
                }
              : {}),
          }}
          className="flex-1 w-full"
        >
          {/* Top Hero Food Image Section */}
          <View
            style={{ height: Math.min(screenHeight * 0.36, 280), width: '100%' }}
            className="relative w-full bg-black overflow-hidden"
          >
            <Image
              source={uri ? { uri } : Images.saladBowl}
              style={[
                StyleSheet.absoluteFill,
                { width: '100%', height: '100%' },
                Platform.OS === 'web' ? ({ objectFit: 'cover' } as any) : null,
              ]}
              contentFit="cover"
              priority="high"
            />

            {/* Subtle top shadow gradient for nav controls */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 85,
                backgroundColor: 'rgba(0,0,0,0.32)',
              }}
            />

            {/* Floating Top Navigation Header */}
            <View
              className="absolute inset-x-0 top-0 flex-row items-center justify-between px-[18px]"
              style={{ paddingTop: (isWebDesktop ? 16 : insets.top) + 6 }}
            >
              <Pressable
                onPress={onDone}
                hitSlop={10}
                className="h-[38px] w-[38px] items-center justify-center rounded-full bg-black/45 active:opacity-70 shadow-sm"
              >
                <Icon name="arrow.left" size={19} color="#FFFFFF" />
              </Pressable>

              <Text className="text-[17px] font-bold text-white tracking-[-0.2px]">Nutrition</Text>

              <View className="flex-row items-center gap-[8px]">
                <Pressable
                  onPress={handleShare}
                  hitSlop={10}
                  className="h-[38px] w-[38px] items-center justify-center rounded-full bg-black/45 active:opacity-70 shadow-sm"
                >
                  <Icon name="square.and.arrow.up" size={17} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  onPress={() => {}}
                  hitSlop={10}
                  className="h-[38px] w-[38px] items-center justify-center rounded-full bg-black/45 active:opacity-70 shadow-sm"
                >
                  <Icon name="ellipsis" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Bottom Sheet White Card */}
          <View
            className="flex-1 bg-white"
            style={{
              marginTop: -26,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              overflow: 'hidden',
            }}
          >
            {failed ? (
              <View className="flex-1 items-center justify-center px-[32px]">
                <View className="h-[70px] w-[70px] items-center justify-center rounded-full bg-[#FEE2E2]">
                  <Icon name="exclamationmark.triangle.fill" size={32} color="#DC2626" />
                </View>
                <Text className="mt-[18px] text-[20px] font-bold text-[#111827]">
                  {notFood ? "That doesn't look like food" : "We couldn't read that one"}
                </Text>
                <Text className="mt-[8px] text-center text-[15px] leading-[21px] text-[#6B7280]">
                  Try again with the meal centred and well lit.
                </Text>
                <Pressable
                  onPress={onDone}
                  className="mt-[28px] h-[52px] items-center justify-center rounded-full bg-[#111827] px-[32px] active:opacity-90"
                >
                  <Text className="text-[16px] font-bold text-white">Scan another</Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-1">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 22,
                    paddingTop: 20,
                    paddingBottom: 16,
                  }}
                >
                  {/* Time & Bookmark Header */}
                  <View className="flex-row items-center">
                    <Icon name="bookmark" size={18} color="#2A2A32" />
                    <View className="ml-[10px] rounded-[6px] bg-[#F3F4F6] px-[8px] py-[3px]">
                      <Text className="text-[12px] font-bold text-[#4B5563]">{currentTimeStr}</Text>
                    </View>
                  </View>

                  {/* Meal Title & Stepper */}
                  <View className="mt-[12px] flex-row items-center justify-between">
                    <Text
                      numberOfLines={2}
                      className="flex-1 pr-[12px] text-[21px] font-bold leading-[27px] text-[#111827]"
                    >
                      {result.name}
                    </Text>

                    {/* Serving Stepper */}
                    <View className="flex-row items-center rounded-full border border-[#E5E7EB] bg-white px-[8px] py-[4px] shadow-2xs">
                      <Pressable
                        onPress={() =>
                          setServings((s) => Math.max(0.5, Number((s - 0.5).toFixed(1))))
                        }
                        hitSlop={8}
                        className="px-[6px] py-[2px] active:opacity-60"
                      >
                        <Text className="text-[18px] font-bold text-[#374151]">−</Text>
                      </Pressable>
                      <Text className="min-w-[22px] text-center text-[15px] font-bold text-[#111827]">
                        {servings}
                      </Text>
                      <Pressable
                        onPress={() => setServings((s) => Number((s + 0.5).toFixed(1)))}
                        hitSlop={8}
                        className="px-[6px] py-[2px] active:opacity-60"
                      >
                        <Text className="text-[18px] font-bold text-[#374151]">+</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Prominent Floating Calories Card */}
                  <View className="mt-[16px] flex-row items-center rounded-[22px] border border-[#F0F2F5] bg-white p-[16px] shadow-sm">
                    <View className="h-[48px] w-[48px] items-center justify-center rounded-full bg-[#F5F6F9]">
                      <Icon name="flame.fill" size={24} color="#1E1C24" />
                    </View>
                    <View className="ml-[14px]">
                      <Text className="text-[13px] font-medium text-[#6B7280]">Calories</Text>
                      <Text className="text-[32px] font-bold leading-[36px] text-[#111827]">
                        {scaledCalories}
                      </Text>
                    </View>
                  </View>

                  {/* Macro Breakdown 3-Card Row */}
                  <View className="mt-[12px] flex-row gap-[10px]">
                    {/* Protein */}
                    <View className="flex-1 rounded-[18px] border border-[#F0F2F5] bg-white p-[12px] shadow-xs">
                      <View className="flex-row items-center">
                        <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-[#FEE2E2]">
                          <Icon name="flame.fill" size={12} color="#EF4444" />
                        </View>
                        <Text className="ml-[6px] text-[12px] font-medium text-[#6B7280]">
                          Protein
                        </Text>
                      </View>
                      <Text className="mt-[6px] text-[17px] font-bold text-[#111827]">
                        {scaledProtein}g
                      </Text>
                    </View>

                    {/* Carbs */}
                    <View className="flex-1 rounded-[18px] border border-[#F0F2F5] bg-white p-[12px] shadow-xs">
                      <View className="flex-row items-center">
                        <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-[#FEF3C7]">
                          <Icon name="leaf.fill" size={12} color="#F59E0B" />
                        </View>
                        <Text className="ml-[6px] text-[12px] font-medium text-[#6B7280]">
                          Carbs
                        </Text>
                      </View>
                      <Text className="mt-[6px] text-[17px] font-bold text-[#111827]">
                        {scaledCarbs}g
                      </Text>
                    </View>

                    {/* Fats */}
                    <View className="flex-1 rounded-[18px] border border-[#F0F2F5] bg-white p-[12px] shadow-xs">
                      <View className="flex-row items-center">
                        <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-[#E0E7FF]">
                          <Icon name="drop.fill" size={12} color="#6366F1" />
                        </View>
                        <Text className="ml-[6px] text-[12px] font-medium text-[#6B7280]">
                          Fats
                        </Text>
                      </View>
                      <Text className="mt-[6px] text-[17px] font-bold text-[#111827]">
                        {scaledFat}g
                      </Text>
                    </View>
                  </View>

                  {/* Dots indicator */}
                  <View className="mt-[10px] flex-row justify-center items-center gap-[6px]">
                    <View className="h-[5px] w-[5px] rounded-full bg-[#111827]" />
                    <View className="h-[5px] w-[5px] rounded-full bg-[#D1D5DB]" />
                  </View>

                  {/* Ingredients Section */}
                  <View className="mt-[18px] flex-row items-center justify-between">
                    <Text className="text-[17px] font-bold text-[#111827]">Ingredients</Text>
                    <Pressable
                      onPress={() => {
                        setEditingIngredient(null);
                        setIngredientModalVisible(true);
                      }}
                      hitSlop={8}
                      className="flex-row items-center active:opacity-70"
                    >
                      <Icon name="plus" size={14} color="#1E6B35" />
                      <Text className="ml-[4px] text-[14px] font-bold text-[#1E6B35]">
                        Add more
                      </Text>
                    </Pressable>
                  </View>

                  {/* Ingredients List with Tap-to-Edit */}
                  <View className="mt-[8px] gap-[8px]">
                    {ingredientsList.map((ing, idx) => (
                      <Pressable
                        key={`${ing.name}-${idx}`}
                        onPress={() => {
                          setEditingIngredient({ index: idx, item: ing });
                          setIngredientModalVisible(true);
                        }}
                        className="flex-row items-center justify-between rounded-[16px] bg-[#F7F8FA] px-[16px] py-[13px] active:bg-[#EFF1F4] shadow-2xs"
                      >
                        <View className="flex-1 pr-[10px]">
                          <Text className="text-[14px] font-semibold text-[#1F2937]">
                            {ing.name}{' '}
                            <Text className="font-normal text-[#6B7280]">
                              • {Math.round((ing.calories || 0) * servings)} cal
                            </Text>
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-[6px]">
                          <Text className="text-[14px] text-[#6B7280]">{ing.portion}</Text>
                          <Text className="text-[11px] text-[#9CA3AF]">✎</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {/* Pinned Bottom Action Buttons */}
                <View
                  className="flex-row gap-[12px] px-[22px] pt-[12px] bg-white border-t border-[#F2F2F5]"
                  style={{ paddingBottom: Math.max(16, insets.bottom + 10) }}
                >
                  <Pressable
                    onPress={onDone}
                    className="h-[52px] flex-1 flex-row items-center justify-center rounded-full border border-[#E5E7EB] bg-white active:opacity-80 shadow-xs"
                  >
                    <Icon name="sparkles" size={16} color="#111827" />
                    <Text className="ml-[8px] text-[15px] font-bold text-[#111827]">
                      Fix Results
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleFinish}
                    disabled={saving}
                    className={`h-[52px] flex-1 items-center justify-center rounded-full bg-[#1E1C24] shadow-sm ${
                      saving ? 'opacity-60' : 'active:opacity-90'
                    }`}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="text-[16px] font-bold text-white">Done</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Ingredient Search, Add & Edit Modal */}
      <IngredientModal
        visible={ingredientModalVisible}
        onClose={() => {
          setIngredientModalVisible(false);
          setEditingIngredient(null);
        }}
        onAddIngredient={handleAddIngredient}
        onUpdateIngredient={handleUpdateIngredient}
        onDeleteIngredient={handleDeleteIngredient}
        editingIngredient={editingIngredient}
      />
    </Modal>
  );
}

function Screen({ children }: { children?: React.ReactNode }) {
  return (
    <View collapsable={false} className="flex-1 bg-[#111114]">
      <StatusBar style="light" />
      {children}
    </View>
  );
}
