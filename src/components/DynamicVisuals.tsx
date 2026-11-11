import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { MetricGaugeScene } from "./director/MetricGaugeScene";
import { ComparisonScene } from "./director/ComparisonScene";
import { AlertThreatScene } from "./director/AlertThreatScene";
import { TechTerminalScene } from "./director/TechTerminalScene";
import { RevealOutroScene } from "./director/RevealOutroScene";
import { CameraRig } from "./depth/CameraRig";
import defaultStoryboard from "../../public/storyboard.json";

export interface StoryboardScene {
  index: number;
  type: "metric_gauge" | "comparison" | "alert_threat" | "tech_terminal" | "reveal_outro" | string;
  title?: string;
  value?: number | string;
  suffix?: string;
  subtitle?: string;
  itemA?: string;
  itemB?: string;
  highlight?: string;
  alertText?: string;
  codeSnippet?: string;
  status?: string;
  badge?: string;
  headline?: string;
  subline?: string;
  cta?: string;
  icon?: string;
}

export const DynamicVisuals: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  const storyboard = defaultStoryboard?.storyboard || {
    themeColor: "#38bdf8",
    accentColor: "#f59e0b",
    dangerColor: "#ef4444",
    scenes: [
      {
        index: 1,
        type: "metric_gauge",
        title: "CORE METRIC",
        value: 99,
        suffix: "%",
        subtitle: "Key Metric",
        icon: "⚡",
      },
      {
        index: 2,
        type: "reveal_outro",
        badge: "MIND BLOWN",
        headline: "SUBSCRIBE FOR DAILY TECH",
        cta: "SUBSCRIBE",
        icon: "🔥",
      },
    ],
  };

  const scenes: StoryboardScene[] = storyboard.scenes || [];
  const sceneCount = Math.max(1, scenes.length);
  const framesPerScene = Math.floor(durationInFrames / sceneCount);

  const renderSceneComponent = (scene: StoryboardScene) => {
    switch (scene.type) {
      case "metric_gauge":
        return (
          <MetricGaugeScene
            title={scene.title}
            value={scene.value}
            suffix={scene.suffix}
            subtitle={scene.subtitle}
            icon={scene.icon}
            color={storyboard.themeColor || "#38bdf8"}
          />
        );
      case "comparison":
        return (
          <ComparisonScene
            title={scene.title}
            itemA={scene.itemA}
            itemB={scene.itemB}
            highlight={scene.highlight}
            icon={scene.icon}
            color={storyboard.accentColor || "#f59e0b"}
          />
        );
      case "alert_threat":
        return (
          <AlertThreatScene
            title={scene.title}
            subtitle={scene.subtitle}
            alertText={scene.alertText}
            icon={scene.icon}
            color={storyboard.dangerColor || "#ef4444"}
          />
        );
      case "tech_terminal":
        return (
          <TechTerminalScene
            title={scene.title}
            codeSnippet={scene.codeSnippet}
            status={scene.status}
            icon={scene.icon}
            color={storyboard.themeColor || "#38bdf8"}
          />
        );
      case "reveal_outro":
      default:
        return (
          <RevealOutroScene
            badge={scene.badge}
            headline={scene.headline}
            subline={scene.subline}
            cta={scene.cta}
            icon={scene.icon}
            color={storyboard.accentColor || "#f59e0b"}
          />
        );
    }
  };

  return (
    <CameraRig>
      {scenes.map((scene, idx) => {
        const from = idx * framesPerScene;
        const isLast = idx === sceneCount - 1;
        const duration = isLast ? durationInFrames - from : framesPerScene;

        return (
          <Sequence key={`scene-${idx}-${scene.type}`} from={from} durationInFrames={duration}>
            {renderSceneComponent(scene)}
          </Sequence>
        );
      })}
    </CameraRig>
  );
};
