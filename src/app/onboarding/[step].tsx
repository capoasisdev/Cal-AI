import React, { useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import {
  DateWheelPicker,
  OnboardingScreen,
  OptionCard,
  RulerPicker,
} from '@/components/onboarding';
import { useApp } from '@/context/AppContext';
import { answers, stepIndex, steps } from '@/onboarding/steps';

export default function OnboardingStep() {
  const { step: key } = useLocalSearchParams<{ step: string }>();
  const router = useRouter();
  const index = stepIndex(key);
  const step = steps[index];
  const { answers: appAnswers, updateAnswer } = useApp();
  const store = answers as Record<string, string | number | undefined>;
  const [value, setValue] = useState(() =>
    step ? (appAnswers[step.field as keyof typeof appAnswers] ?? store[step.field]) : undefined
  );

  if (!step) return <Redirect href="/" />;

  const commit = (v: string | number) => {
    setValue(v);
    store[step.field] = v;
    updateAnswer(step.field as any, v);
  };

  const next = steps[index + 1];
  const shell = {
    progress: (index + 1) / steps.length,
    title: step.title,
    subtitle: step.subtitle,
    disabled: value === undefined,
    onNext: () =>
      next
        ? router.push({ pathname: '/onboarding/[step]', params: { step: next.key } })
        : router.push('/onboarding/building'),
  };

  if (step.kind === 'cards') {
    return (
      <OnboardingScreen {...shell}>
        <View className="mt-[38px] gap-[10px] px-[26px]">
          {step.options.map((o) => (
            <OptionCard
              key={o.value}
              title={o.title}
              subtitle={o.subtitle}
              icon={o.icon}
              glyph={o.glyph}
              tall={step.tall}
              selected={value === o.value}
              onPress={() => commit(o.value)}
            />
          ))}
        </View>
      </OnboardingScreen>
    );
  }

  if (step.kind === 'date') {
    return (
      <OnboardingScreen {...shell}>
        <View className="mt-[20px] px-[26px]">
          <DateWheelPicker
            value={typeof value === 'string' ? value : '2000-01-01'}
            onChange={(d) => commit(d)}
          />
        </View>
      </OnboardingScreen>
    );
  }

  const current = typeof value === 'number' ? value : step.min;
  const note = step.note?.(current);
  return (
    <OnboardingScreen {...shell} disabled={false}>
      <View className="mt-[30px]">
        <RulerPicker
          value={current}
          onChange={commit}
          min={step.min}
          max={step.max}
          increment={step.increment}
          decimals={step.decimals}
          labelEvery={step.labelEvery}
          labelDecimals={step.labelDecimals}
          unit={step.unit}
        />
        {note ? (
          <Text className="mt-[28px] px-[40px] text-center text-[14px] leading-[19px] text-[#8A6D2F]">
            {note}
          </Text>
        ) : null}
      </View>
    </OnboardingScreen>
  );
}
