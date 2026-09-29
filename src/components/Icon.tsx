import React from 'react';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export type IconName =
  | 'house'
  | 'house.fill'
  | 'camera'
  | 'camera.fill'
  | 'person'
  | 'person.fill'
  | 'flame'
  | 'flame.fill'
  | 'leaf'
  | 'leaf.fill'
  | 'water'
  | 'drop.fill'
  | 'arrow.left'
  | 'arrow.right'
  | 'arrow.counterclockwise'
  | 'checkmark'
  | 'checkmark.circle.fill'
  | 'fork.knife'
  | 'sofa'
  | 'figure.walk'
  | 'dumbbell'
  | 'figure.run'
  | 'star.fill'
  | 'sparkles'
  | 'photo.on.rectangle'
  | 'calendar'
  | 'gearshape'
  | 'globe'
  | 'trash'
  | 'chevron.right'
  | 'exclamationmark.triangle.fill'
  | 'chart.line.downtrend.xyaxis'
  | 'chart.line.flattrend.xyaxis'
  | 'chart.line.uptrend.xyaxis'
  | 'target'
  | 'viewfinder'
  | 'chart.pie'
  | 'chart.bar'
  | 'carrot'
  | 'clock'
  | 'bookmark'
  | 'square.and.arrow.up'
  | 'ellipsis'
  | 'minus'
  | 'search'
  | 'close';

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 20, color = '#000000', style }: IconProps) {
  switch (name) {
    case 'search':
      return <Ionicons name="search" size={size} color={color} style={style} />;
    case 'close':
      return <Ionicons name="close" size={size} color={color} style={style} />;
    case 'bookmark':
      return <Ionicons name="bookmark-outline" size={size} color={color} style={style} />;
    case 'square.and.arrow.up':
      return <Ionicons name="share-outline" size={size} color={color} style={style} />;
    case 'ellipsis':
      return <Ionicons name="ellipsis-horizontal" size={size} color={color} style={style} />;
    case 'minus':
      return <Ionicons name="remove" size={size} color={color} style={style} />;
    case 'house':
      return <Ionicons name="home-outline" size={size} color={color} style={style} />;
    case 'house.fill':
      return <Ionicons name="home" size={size} color={color} style={style} />;
    case 'camera':
      return <Ionicons name="camera-outline" size={size} color={color} style={style} />;
    case 'camera.fill':
      return <Ionicons name="camera" size={size} color={color} style={style} />;
    case 'person':
      return <Ionicons name="person-outline" size={size} color={color} style={style} />;
    case 'person.fill':
      return <Ionicons name="person" size={size} color={color} style={style} />;
    case 'flame':
    case 'flame.fill':
      return <Ionicons name="flame" size={size} color={color} style={style} />;
    case 'leaf':
    case 'leaf.fill':
      return <Ionicons name="leaf" size={size} color={color} style={style} />;
    case 'water':
    case 'drop.fill':
      return <Ionicons name="water" size={size} color={color} style={style} />;
    case 'arrow.left':
      return <Ionicons name="arrow-back" size={size} color={color} style={style} />;
    case 'arrow.right':
      return <Ionicons name="arrow-forward" size={size} color={color} style={style} />;
    case 'arrow.counterclockwise':
      return <Ionicons name="refresh" size={size} color={color} style={style} />;
    case 'checkmark':
      return <Ionicons name="checkmark" size={size} color={color} style={style} />;
    case 'checkmark.circle.fill':
      return <Ionicons name="checkmark-circle" size={size} color={color} style={style} />;
    case 'fork.knife':
      return <Ionicons name="restaurant" size={size} color={color} style={style} />;
    case 'sofa':
      return <MaterialCommunityIcons name="sofa" size={size} color={color} style={style} />;
    case 'figure.walk':
      return <Ionicons name="walk" size={size} color={color} style={style} />;
    case 'dumbbell':
      return <Ionicons name="barbell" size={size} color={color} style={style} />;
    case 'figure.run':
      return <Ionicons name="fitness" size={size} color={color} style={style} />;
    case 'star.fill':
      return <Ionicons name="star" size={size} color={color} style={style} />;
    case 'sparkles':
      return <Ionicons name="sparkles" size={size} color={color} style={style} />;
    case 'photo.on.rectangle':
      return <Ionicons name="images" size={size} color={color} style={style} />;
    case 'calendar':
      return <Ionicons name="calendar-outline" size={size} color={color} style={style} />;
    case 'gearshape':
      return <Ionicons name="settings-outline" size={size} color={color} style={style} />;
    case 'globe':
      return <Ionicons name="globe-outline" size={size} color={color} style={style} />;
    case 'trash':
      return <Ionicons name="trash-outline" size={size} color={color} style={style} />;
    case 'chevron.right':
      return <Ionicons name="chevron-forward" size={size} color={color} style={style} />;
    case 'exclamationmark.triangle.fill':
      return <Ionicons name="warning" size={size} color={color} style={style} />;
    case 'chart.line.downtrend.xyaxis':
      return <Ionicons name="trending-down" size={size} color={color} style={style} />;
    case 'chart.line.flattrend.xyaxis':
      return <Ionicons name="reorder-two" size={size} color={color} style={style} />;
    case 'chart.line.uptrend.xyaxis':
      return <Ionicons name="trending-up" size={size} color={color} style={style} />;
    case 'target':
      return <Ionicons name="locate-outline" size={size} color={color} style={style} />;
    case 'viewfinder':
      return <Ionicons name="scan-outline" size={size} color={color} style={style} />;
    case 'chart.pie':
      return <Ionicons name="pie-chart-outline" size={size} color={color} style={style} />;
    case 'chart.bar':
      return <Ionicons name="bar-chart-outline" size={size} color={color} style={style} />;
    case 'chart.bar.fill':
      return <Ionicons name="bar-chart" size={size} color={color} style={style} />;
    case 'plus':
      return <Ionicons name="add" size={size} color={color} style={style} />;
    case 'scale':
      return <Ionicons name="speedometer-outline" size={size} color={color} style={style} />;
    case 'carrot':
      return <MaterialCommunityIcons name="carrot" size={size} color={color} style={style} />;
    case 'clock':
      return <Ionicons name="time-outline" size={size} color={color} style={style} />;
    case 'hand.raised':
      return <Ionicons name="hand-left-outline" size={size} color={color} style={style} />;
    case 'doc.text':
      return <Ionicons name="document-text-outline" size={size} color={color} style={style} />;
    case 'person.text.rectangle':
      return <Ionicons name="id-card-outline" size={size} color={color} style={style} />;
    case 'person.2.badge.plus':
      return <MaterialCommunityIcons name="account-multiple-plus-outline" size={size} color={color} style={style} />;
    case 'bubble.left.and.text.bubble.right':
      return <Ionicons name="chatbubbles-outline" size={size} color={color} style={style} />;
    case 'rectangle.portrait.and.arrow.right':
      return <Ionicons name="log-out-outline" size={size} color={color} style={style} />;
    case 'open.outline':
      return <Ionicons name="open-outline" size={size} color={color} style={style} />;
    default:
      return <Ionicons name="ellipse" size={size} color={color} style={style} />;
  }
}
