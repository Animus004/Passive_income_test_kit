import React from 'react';
import { ColorTheme } from '../theme/tokens';
import { HeroSolo, HeroIconType } from '../primitives/HeroSolo';
import { StackTower } from '../primitives/StackTower';
import { CutawayLens, CutawayTargetType } from '../primitives/CutawayLens';
import { ToggleSwitch } from '../primitives/ToggleSwitch';
import { WeightOnWire } from '../primitives/WeightOnWire';
import { TimeFlipCalendar } from '../primitives/TimeFlipCalendar';
import { DialGauge } from '../primitives/DialGauge';
import { SplitCompare } from '../primitives/SplitCompare';
import { PerspectiveFloor, FloorPropType } from '../primitives/PerspectiveFloor';
import { FullBleedBlueprintGrid } from '../primitives/FullBleedBlueprintGrid';
import { ExplodingCluster, ClusterNode } from '../primitives/ExplodingCluster';
import { SplitPanelComic } from '../primitives/SplitPanelComic';
import { InfiniteConveyor, ConveyorItem } from '../primitives/InfiniteConveyor';
import { MacroPunchLens, MacroTargetType } from '../primitives/MacroPunchLens';
import { OddlyBackground, BackgroundPatternType } from './OddlyBackground';

export interface OddlyBeatProps {
  id: number;
  title?: string;
  badge?: string;
  primitive?: string;
  iconType?: HeroIconType;
  items?: Array<{ label: string; color: string; hasEyes?: boolean; dropFrame?: number }>;
  statPercent?: string;
  subLabel?: string;
  offLabel?: string;
  onLabel?: string;
  flipFrame?: number;
  startTime?: string;
  endTime?: string;
  stampText?: string;
  timeLabel?: string;
  dangerText?: string;
  needleTargetAngle?: number;
  leftLabel?: string;
  rightLabel?: string;
  leftSub?: string;
  rightSub?: string;
  leftColor?: string;
  rightColor?: string;
  leftTitle?: string;
  rightTitle?: string;
  glance?: 'center' | 'left' | 'right' | 'up' | 'down';
  hasEyes?: boolean;
  propType?: FloorPropType;
  alertText?: string;
  countdownSeconds?: number;
  systemStatus?: string;
  subText?: string;
  nodes?: ClusterNode[];
  queueCount?: string;
  conveyorItems?: ConveyorItem[];
  speedMultiplier?: number;
  macroTarget?: MacroTargetType;
  keyLabel?: string;
  alertSubtitle?: string;
  backgroundPattern?: BackgroundPatternType;
  targetProp?: CutawayTargetType;
}

export interface OddlyBeatRendererProps {
  beat: OddlyBeatProps;
  theme: ColorTheme;
  language?: 'en' | 'hi';
}

export const OddlyBeatRenderer: React.FC<OddlyBeatRendererProps> = ({
  beat,
  theme,
  language = 'en',
}) => {
  const primitive = beat.primitive || (beat.id === 1 ? 'HeroSolo' : beat.id === 2 ? 'StackTower' : 'HeroSolo');

  // Automatic procedural background matching primitive energy
  const bgPattern: BackgroundPatternType =
    beat.backgroundPattern ||
    (primitive === 'FullBleedBlueprintGrid'
      ? 'grid'
      : primitive === 'PerspectiveFloor'
      ? 'floor'
      : primitive === 'ExplodingCluster' || primitive === 'MacroPunchLens'
      ? 'burst'
      : primitive === 'InfiniteConveyor'
      ? 'dots'
      : beat.id === 1
      ? 'dots'
      : 'dots');

  const renderContent = () => {
    switch (primitive) {
      case 'SplitPanelComic':
        return (
          <SplitPanelComic
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            leftTitle={beat.leftTitle || beat.leftLabel}
            leftSub={beat.leftSub}
            leftColor={beat.leftColor}
            rightTitle={beat.rightTitle || beat.rightLabel}
            rightSub={beat.rightSub}
            rightColor={beat.rightColor}
          />
        );

      case 'InfiniteConveyor':
        return (
          <InfiniteConveyor
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            queueCount={beat.queueCount}
            speedMultiplier={beat.speedMultiplier}
            items={beat.conveyorItems}
          />
        );

      case 'MacroPunchLens':
        return (
          <MacroPunchLens
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            target={beat.macroTarget || (beat as any).target || 'sweating_eye'}
            keyLabel={beat.keyLabel}
            alertSubtitle={beat.alertSubtitle}
          />
        );

      case 'PerspectiveFloor':
        return (
          <PerspectiveFloor
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            propType={beat.propType || (beat.iconType as any) || 'coffee'}
            alertText={beat.alertText}
          />
        );

      case 'FullBleedBlueprintGrid':
        return (
          <FullBleedBlueprintGrid
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            countdownSeconds={beat.countdownSeconds || 4}
            systemStatus={beat.systemStatus || 'DEFUSAL ACTIVE'}
            subText={beat.subText}
          />
        );

      case 'ExplodingCluster':
        return (
          <ExplodingCluster
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            nodes={beat.nodes}
          />
        );

      case 'HeroSolo':
        return (
          <HeroSolo
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            iconType={beat.iconType || 'brain'}
            glance={beat.glance || 'center'}
            hasEyes={beat.hasEyes !== false}
            isHook={beat.id === 1}
          />
        );

      case 'StackTower':
        return (
          <StackTower
            theme={theme}
            title={beat.title}
            items={beat.items}
          />
        );

      case 'CutawayLens':
        return (
          <CutawayLens
            theme={theme}
            title={beat.title}
            statPercent={beat.statPercent}
            subLabel={beat.subLabel || beat.badge}
            targetProp={
              beat.targetProp ||
              (beat.subLabel && /battery|energy|power|drain|dip|crash/i.test(beat.subLabel) ? 'battery' : undefined) ||
              (beat.title && /battery|energy|power|drain|dip|crash/i.test(beat.title) ? 'battery' : undefined) ||
              (beat.iconType as any) ||
              'brain'
            }
          />
        );

      case 'ToggleSwitch':
        return (
          <ToggleSwitch
            theme={theme}
            title={beat.title || 'SYSTEM OVERRIDE'}
            offLabel={beat.offLabel || 'OFF'}
            onLabel={beat.onLabel || 'ON'}
            flipFrame={beat.flipFrame || 14}
          />
        );

      case 'WeightOnWire':
        return (
          <WeightOnWire
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            hasEyes={beat.hasEyes !== false}
          />
        );

      case 'TimeFlipCalendar':
        return (
          <TimeFlipCalendar
            theme={theme}
            title={beat.title}
            startTime={beat.startTime}
            endTime={beat.endTime}
            stampText={beat.stampText}
          />
        );

      case 'DialGauge':
        return (
          <DialGauge
            theme={theme}
            title={beat.title || 'ACTIVITY METER'}
            timeLabel={beat.timeLabel}
            dangerText={beat.dangerText || 'PANIC MODE'}
            needleTargetAngle={beat.needleTargetAngle || 150}
          />
        );

      case 'SplitCompare':
        return (
          <SplitCompare
            theme={theme}
            title={beat.title || 'EXPECTATION VS REALITY'}
            leftLabel={beat.leftLabel || 'PLAN'}
            rightLabel={beat.rightLabel || 'REALITY'}
            leftSub={beat.leftSub || 'CALM & READY'}
            rightSub={beat.rightSub || 'PANIC BUTTON'}
            leftColor={beat.leftColor || '#60A5FA'}
            rightColor={beat.rightColor || '#F43F5E'}
          />
        );

      default:
        return (
          <HeroSolo
            theme={theme}
            title={beat.title}
            badgeText={beat.badge}
            iconType={beat.iconType || 'brain'}
            glance="center"
          />
        );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Procedural Vector Background (No more sterile flat pastel void!) */}
      <OddlyBackground theme={theme} pattern={bgPattern} />

      {/* Foreground Content Assembly */}
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
        {renderContent()}
      </div>
    </div>
  );
};
