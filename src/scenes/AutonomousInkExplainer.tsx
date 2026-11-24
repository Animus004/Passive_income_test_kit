import React from "react";
import { Series } from "remotion";
import { Scene1 } from "./autonomous/Scene1";
import { Scene2 } from "./autonomous/Scene2";
import { Scene3 } from "./autonomous/Scene3";
import { Scene4 } from "./autonomous/Scene4";
import { Scene5 } from "./autonomous/Scene5";

export const AutonomousInkExplainer: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={362}>
        <Scene1 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={395}>
        <Scene2 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={342}>
        <Scene3 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={339}>
        <Scene4 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={368}>
        <Scene5 />
      </Series.Sequence>
    </Series>
  );
};
