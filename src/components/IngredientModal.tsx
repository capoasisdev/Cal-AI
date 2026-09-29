import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { COMMON_INGREDIENTS, CommonIngredient } from '@/constants/ingredients';
import { Ingredient } from '@/services/aiService';

type Category = 'All' | 'Greens' | 'Proteins' | 'Veggies' | 'Dressings' | 'Toppings' | 'Grains';
const CATEGORIES: Category[] = [
  'All',
  'Greens',
  'Proteins',
  'Veggies',
  'Dressings',
  'Toppings',
  'Grains',
];

interface IngredientModalProps {
  visible: boolean;
  onClose: () => void;
  onAddIngredient: (item: Ingredient & { proteinG?: number; carbsG?: number; fatG?: number }) => void;
  onUpdateIngredient?: (
    index: number,
    item: Ingredient & { proteinG?: number; carbsG?: number; fatG?: number }
  ) => void;
  onDeleteIngredient?: (index: number) => void;
  editingIngredient?: {
    index: number;
    item: Ingredient;
  } | null;
}

export function IngredientModal({
  visible,
  onClose,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
  editingIngredient,
}: IngredientModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width > 500;
  const screenWidth = isWebDesktop ? Math.min(width, 420) : width;
  const screenHeight = isWebDesktop ? Math.min(height, 890) : height;

  const isEditMode = Boolean(editingIngredient);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  // Form state for custom or selected ingredient
  const [activeItem, setActiveItem] = useState<{
    name: string;
    portion: string;
    calories: string;
    proteinG: string;
    carbsG: string;
    fatG: string;
  } | null>(() => {
    if (editingIngredient) {
      return {
        name: editingIngredient.item.name,
        portion: editingIngredient.item.portion,
        calories: String(editingIngredient.item.calories),
        proteinG: '0',
        carbsG: '0',
        fatG: '0',
      };
    }
    return null;
  });

  // When editingIngredient changes, sync activeItem
  React.useEffect(() => {
    if (editingIngredient) {
      setActiveItem({
        name: editingIngredient.item.name,
        portion: editingIngredient.item.portion,
        calories: String(editingIngredient.item.calories),
        proteinG: '0',
        carbsG: '0',
        fatG: '0',
      });
    } else {
      setActiveItem(null);
      setSearch('');
      setSelectedCategory('All');
    }
  }, [editingIngredient, visible]);

  // Filtered ingredients
  const filteredList = useMemo(() => {
    return COMMON_INGREDIENTS.filter((ing) => {
      const matchesCategory =
        selectedCategory === 'All' || ing.category === selectedCategory;
      const matchesSearch =
        search.trim() === '' ||
        ing.name.toLowerCase().includes(search.toLowerCase()) ||
        ing.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const handleSelectPredefined = (ing: CommonIngredient) => {
    setActiveItem({
      name: ing.name,
      portion: ing.portion,
      calories: String(ing.calories),
      proteinG: String(ing.proteinG),
      carbsG: String(ing.carbsG),
      fatG: String(ing.fatG),
    });
  };

  const handleSave = () => {
    if (!activeItem || !activeItem.name.trim()) return;

    const cal = parseInt(activeItem.calories, 10) || 0;
    const itemData = {
      name: activeItem.name.trim(),
      portion: activeItem.portion.trim() || '1 serving',
      calories: Math.max(0, cal),
      proteinG: parseFloat(activeItem.proteinG) || 0,
      carbsG: parseFloat(activeItem.carbsG) || 0,
      fatG: parseFloat(activeItem.fatG) || 0,
    };

    if (isEditMode && editingIngredient && onUpdateIngredient) {
      onUpdateIngredient(editingIngredient.index, itemData);
    } else {
      onAddIngredient(itemData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (isEditMode && editingIngredient && onDeleteIngredient) {
      onDeleteIngredient(editingIngredient.index);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        className="flex-1 bg-black/60 items-center justify-end md:justify-center"
        style={Platform.OS === 'web' ? ({ position: 'fixed', inset: 0, zIndex: 999999 } as any) : undefined}
      >
        <View
          style={{
            width: isWebDesktop ? screenWidth : '100%',
            height: isWebDesktop ? screenHeight * 0.92 : '92%',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            borderBottomLeftRadius: isWebDesktop ? 32 : 0,
            borderBottomRightRadius: isWebDesktop ? 32 : 0,
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
          }}
          className="flex-col bg-white"
        >
          {/* Header Bar */}
          <View
            className="flex-row items-center justify-between border-b border-[#F0F2F5] px-[20px] py-[16px]"
            style={{ paddingTop: (isWebDesktop ? 16 : insets.top) + 4 }}
          >
            <Pressable
              onPress={onClose}
              hitSlop={12}
              className="h-[36px] w-[36px] items-center justify-center rounded-full bg-[#F3F4F6] active:opacity-70"
            >
              <Icon name="close" size={18} color="#374151" />
            </Pressable>

            <Text className="text-[18px] font-bold text-[#111827]">
              {isEditMode
                ? 'Edit Ingredient'
                : activeItem
                ? 'Customize Ingredient'
                : 'Add Ingredient'}
            </Text>

            {activeItem ? (
              <Pressable
                onPress={handleSave}
                hitSlop={12}
                className="rounded-full bg-[#439A4B] px-[14px] py-[6px] active:opacity-80"
              >
                <Text className="text-[14px] font-bold text-white">Save</Text>
              </Pressable>
            ) : (
              <View className="w-[36px]" />
            )}
          </View>

          {/* Form Mode: Editing or Customizing */}
          {activeItem ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 22 }}
              className="flex-1"
            >
              {/* Back to search if in add mode */}
              {!isEditMode && (
                <Pressable
                  onPress={() => setActiveItem(null)}
                  className="mb-[16px] flex-row items-center active:opacity-70"
                >
                  <Icon name="arrow.left" size={16} color="#439A4B" />
                  <Text className="ml-[6px] text-[14px] font-semibold text-[#439A4B]">
                    Back to search
                  </Text>
                </Pressable>
              )}

              {/* Ingredient Name Input */}
              <Text className="text-[13px] font-bold uppercase tracking-wider text-[#6B7280]">
                Ingredient Name
              </Text>
              <TextInput
                value={activeItem.name}
                onChangeText={(text) => setActiveItem({ ...activeItem, name: text })}
                placeholder="e.g. Avocado, Grilled Chicken"
                placeholderTextColor="#9CA3AF"
                className="mt-[6px] h-[50px] rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-[16px] text-[16px] font-semibold text-[#111827]"
              />

              {/* Portion Input */}
              <Text className="mt-[18px] text-[13px] font-bold uppercase tracking-wider text-[#6B7280]">
                Portion / Quantity
              </Text>
              <TextInput
                value={activeItem.portion}
                onChangeText={(text) => setActiveItem({ ...activeItem, portion: text })}
                placeholder="e.g. 1 cup, 150g, 2 tbsp"
                placeholderTextColor="#9CA3AF"
                className="mt-[6px] h-[50px] rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-[16px] text-[16px] font-semibold text-[#111827]"
              />

              {/* Calories Input */}
              <Text className="mt-[18px] text-[13px] font-bold uppercase tracking-wider text-[#6B7280]">
                Calories (kcal)
              </Text>
              <TextInput
                value={activeItem.calories}
                onChangeText={(text) =>
                  setActiveItem({ ...activeItem, calories: text.replace(/[^0-9]/g, '') })
                }
                placeholder="e.g. 120"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
                className="mt-[6px] h-[50px] rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] px-[16px] text-[18px] font-bold text-[#1E6B35]"
              />

              {/* Optional Macros Breakdown */}
              <View className="mt-[20px] rounded-[20px] border border-[#E5E7EB] bg-[#F9FAFB] p-[16px]">
                <Text className="text-[13px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Macros (Optional)
                </Text>
                <View className="mt-[12px] flex-row gap-[10px]">
                  <View className="flex-1">
                    <Text className="text-[12px] font-medium text-[#EF4444]">Protein (g)</Text>
                    <TextInput
                      value={activeItem.proteinG}
                      onChangeText={(text) =>
                        setActiveItem({ ...activeItem, proteinG: text.replace(/[^0-9.]/g, '') })
                      }
                      placeholder="0"
                      keyboardType="numeric"
                      className="mt-[4px] h-[42px] rounded-[12px] border border-[#E5E7EB] bg-white px-[12px] text-[15px] font-bold text-[#111827]"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[12px] font-medium text-[#F59E0B]">Carbs (g)</Text>
                    <TextInput
                      value={activeItem.carbsG}
                      onChangeText={(text) =>
                        setActiveItem({ ...activeItem, carbsG: text.replace(/[^0-9.]/g, '') })
                      }
                      placeholder="0"
                      keyboardType="numeric"
                      className="mt-[4px] h-[42px] rounded-[12px] border border-[#E5E7EB] bg-white px-[12px] text-[15px] font-bold text-[#111827]"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[12px] font-medium text-[#6366F1]">Fat (g)</Text>
                    <TextInput
                      value={activeItem.fatG}
                      onChangeText={(text) =>
                        setActiveItem({ ...activeItem, fatG: text.replace(/[^0-9.]/g, '') })
                      }
                      placeholder="0"
                      keyboardType="numeric"
                      className="mt-[4px] h-[42px] rounded-[12px] border border-[#E5E7EB] bg-white px-[12px] text-[15px] font-bold text-[#111827]"
                    />
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View className="mt-[28px] gap-[12px]">
                <Pressable
                  onPress={handleSave}
                  className="h-[52px] items-center justify-center rounded-full bg-[#439A4B] active:opacity-90 shadow-sm"
                >
                  <Text className="text-[16px] font-bold text-white">
                    {isEditMode ? 'Update Ingredient' : 'Add to Meal'}
                  </Text>
                </Pressable>

                {isEditMode && (
                  <Pressable
                    onPress={handleDelete}
                    className="h-[52px] flex-row items-center justify-center rounded-full border border-[#FCA5A5] bg-[#FEF2F2] active:opacity-80"
                  >
                    <Icon name="trash" size={16} color="#DC2626" />
                    <Text className="ml-[6px] text-[15px] font-bold text-[#DC2626]">
                      Delete Ingredient
                    </Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          ) : (
            /* Search & List Mode */
            <View className="flex-1">
              {/* Search Box */}
              <View className="px-[20px] pt-[14px]">
                <View className="h-[48px] flex-row items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-[14px]">
                  <Icon name="search" size={18} color="#9CA3AF" />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search ingredients (e.g. Avocado, Chicken...)"
                    placeholderTextColor="#9CA3AF"
                    className="ml-[10px] flex-1 text-[15px] text-[#111827]"
                  />
                  {search.length > 0 && (
                    <Pressable onPress={() => setSearch('')} hitSlop={8}>
                      <Icon name="close" size={16} color="#9CA3AF" />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Category Filter Pills */}
              <View className="mt-[12px]">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
                >
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        className={`rounded-full px-[14px] py-[6px] border ${
                          isSelected
                            ? 'bg-[#439A4B] border-[#439A4B]'
                            : 'bg-[#F9FAFB] border-[#E5E7EB]'
                        }`}
                      >
                        <Text
                          className={`text-[13px] font-semibold ${
                            isSelected ? 'text-white' : 'text-[#4B5563]'
                          }`}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Custom Add Button if query doesn't directly match */}
              {search.trim().length > 0 && (
                <Pressable
                  onPress={() =>
                    setActiveItem({
                      name: search.trim(),
                      portion: '1 serving',
                      calories: '50',
                      proteinG: '0',
                      carbsG: '0',
                      fatG: '0',
                    })
                  }
                  className="mx-[20px] mt-[12px] flex-row items-center justify-between rounded-[16px] border border-[#D5E9D2] bg-[#F4FAF2] px-[16px] py-[12px] active:opacity-80 shadow-2xs"
                >
                  <View className="flex-row items-center">
                    <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-[#439A4B]">
                      <Icon name="plus" size={16} color="#FFFFFF" />
                    </View>
                    <Text className="ml-[10px] text-[14px] font-bold text-[#1E6B35]">
                      Add &ldquo;{search.trim()}&rdquo; as custom item
                    </Text>
                  </View>
                  <Icon name="chevron.right" size={16} color="#439A4B" />
                </Pressable>
              )}

              {/* Predefined Ingredients List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
                className="mt-[6px] flex-1"
              >
                {filteredList.map((ing) => (
                  <Pressable
                    key={ing.id}
                    onPress={() => handleSelectPredefined(ing)}
                    className="mb-[8px] flex-row items-center justify-between rounded-[16px] border border-[#F0F2F5] bg-white px-[16px] py-[12px] active:bg-[#F9FAFB] shadow-xs"
                  >
                    <View className="flex-1 pr-[12px]">
                      <Text className="text-[15px] font-bold text-[#111827]">{ing.name}</Text>
                      <Text className="mt-[2px] text-[13px] text-[#6B7280]">
                        {ing.portion} • <Text className="font-semibold text-[#1E6B35]">{ing.calories} cal</Text>
                        {ing.proteinG > 0 ? ` • ${ing.proteinG}g P` : ''}
                      </Text>
                    </View>
                    <View className="h-[32px] w-[32px] items-center justify-center rounded-full bg-[#EAF5E8]">
                      <Icon name="plus" size={16} color="#1E6B35" />
                    </View>
                  </Pressable>
                ))}

                {filteredList.length === 0 && search.trim().length === 0 && (
                  <View className="items-center py-[40px]">
                    <Text className="text-[15px] text-[#6B7280]">No ingredients found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
