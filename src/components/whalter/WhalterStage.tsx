import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { WhalterTrueCharacter, WhalterExpression, WhalterProp, WhalterRole } from "./WhalterTrueCharacter";
import { SubtitleWord } from "../../types";

import { BedroomEnvironment } from "./environments/BedroomEnvironment";
import { DevicesGlitchEnvironment } from "./environments/DevicesGlitchEnvironment";
import { CockpitEnvironment } from "./environments/CockpitEnvironment";
import { AtmEnvironment } from "./environments/AtmEnvironment";
import { SupermarketEnvironment } from "./environments/SupermarketEnvironment";
import { BlackoutSkylineEnvironment } from "./environments/BlackoutSkylineEnvironment";
import { TradingFloorEnvironment } from "./environments/TradingFloorEnvironment";

export interface WhalterCutData {
  sceneIndex: number;
  startFrame: number;
  endFrame: number;
  name: string;
  badgeText?: string;
  metricText: string;
  metricColor?: string;
  contextTag: string;
  heroExpression?: WhalterExpression;
  heroProp?: WhalterProp;
  heroRole?: WhalterRole;
  companionExpression?: WhalterExpression;
}

interface WhalterStageProps {
  currentCut: number;
  cuts?: WhalterCutData[];
  totalFrames?: number;
  subtitles?: SubtitleWord[];
}

export const WhalterStage: React.FC<WhalterStageProps> = ({
  currentCut = 1,
  cuts = [],
  totalFrames = 1416,
  subtitles = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Active cut relative timing
  const activeCut = cuts.find((c) => c.sceneIndex === currentCut) || cuts[0] || {
    sceneIndex: 1,
    startFrame: 0,
    endFrame: 125,
    name: "The 72H Blackout Hook",
    badgeText: "#2",
    metricText: "12:01:00 AM",
    metricColor: "#EF4444",
    contextTag: "ALL SCREENS FROZEN",
    heroExpression: "wavy" as WhalterExpression,
    heroProp: "phone" as WhalterProp,
    heroRole: "civilian" as WhalterRole,
    companionExpression: "shocked" as WhalterExpression,
  };

  const cutStart = activeCut.startFrame || 0;
  const f = Math.max(0, frame - cutStart);

  // Snappy spring bounce on scene entry
  const hudSpring = spring({ frame: f, fps, config: { damping: 10, stiffness: 220 } });
  const hudScale = interpolate(hudSpring, [0, 1], [0.85, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: "hidden",
        backgroundColor: "#0F172A",
      }}
    >
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        fill="none"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* ================================================================ */}
        {/* 1. DYNAMIC GLOBAL ENVIRONMENTS PER SCENE                         */}
        {/* ================================================================ */}
        {currentCut === 1 ? (
          <BedroomEnvironment frame={f} />
        ) : currentCut === 2 ? (
          <DevicesGlitchEnvironment frame={f} />
        ) : currentCut === 3 ? (
          <CockpitEnvironment frame={f} />
        ) : currentCut === 4 ? (
          <AtmEnvironment frame={f} />
        ) : currentCut === 5 ? (
          <SupermarketEnvironment frame={f} />
        ) : currentCut === 6 ? (
          <BlackoutSkylineEnvironment frame={f} />
        ) : currentCut === 7 ? (
          <TradingFloorEnvironment frame={f} />
        ) : (
          <BedroomEnvironment frame={f} />
        )}

        {/* ================================================================ */}
        {/* 2. CHARACTER CHOREOGRAPHY PER SCENE                              */}
        {/* ================================================================ */}
        {currentCut === 1 ? (
          // Scene 1: Bedroom Hook (Hero in bed with phone)
          <g>
            <WhalterTrueCharacter
              x={540}
              y={1050}
              scale={1.38}
              isHero={true}
              prop="phone"
              expression={activeCut.heroExpression || "wavy"}
              shirtColor="#2563EB"
              subtitles={subtitles}
            />
          </g>
        ) : currentCut === 2 ? (
          // Scene 2: 8 Billion Screens Freeze Worldwide
          <g>
            <WhalterTrueCharacter
              x={260}
              y={1060}
              scale={1.22}
              prop="phone"
              expression="shocked"
              shirtColor="#0D9488"
              hairColor="blonde"
              bounceOffset={0.4}
            />
            <WhalterTrueCharacter
              x={820}
              y={1060}
              scale={1.22}
              prop="phone"
              expression="panic"
              shirtColor="#DC2626"
              hairColor="purple"
              flipX={true}
              bounceOffset={0.8}
            />
            <WhalterTrueCharacter
              x={540}
              y={1060}
              scale={1.38}
              isHero={true}
              prop="phone"
              expression={activeCut.heroExpression || "wavy"}
              shirtColor="#2563EB"
              subtitles={subtitles}
            />
          </g>
        ) : currentCut === 3 ? (
          // Scene 3: Cockpit - 30,000 Airplanes Flying Blind
          <g>
            {/* Captain (Left) */}
            <WhalterTrueCharacter
              x={330}
              y={1040}
              scale={1.32}
              isHero={true}
              role="pilot"
              expression="panic"
              shirtColor="#1E293B"
              hairColor="black"
              subtitles={subtitles}
            />
            {/* First Officer (Right) */}
            <WhalterTrueCharacter
              x={750}
              y={1040}
              scale={1.28}
              role="pilot"
              expression="shocked"
              shirtColor="#1E293B"
              hairColor="brown"
              flipX={true}
              bounceOffset={0.5}
            />
          </g>
        ) : currentCut === 4 ? (
          // Scene 4: Banking ATM Crash
          <g>
            {/* Queue Bystanders */}
            <WhalterTrueCharacter
              x={180}
              y={1080}
              scale={1.12}
              expression="shocked"
              shirtColor="#0D9488"
              hairColor="blonde"
              bounceOffset={0.3}
            />
            <WhalterTrueCharacter
              x={880}
              y={1080}
              scale={1.14}
              expression="panic"
              shirtColor="#7C3AED"
              hairColor="grey"
              flipX={true}
              bounceOffset={0.7}
            />
            {/* Center Customer swiping card at ATM */}
            <WhalterTrueCharacter
              x={540}
              y={1050}
              scale={1.38}
              isHero={true}
              prop="card"
              expression={activeCut.heroExpression || "panic"}
              shirtColor="#EAB308"
              hairColor="brown"
              subtitles={subtitles}
            />
          </g>
        ) : currentCut === 5 ? (
          // Scene 5: Supermarket Empty Shelves
          <g>
            {/* Toilet Paper Hoarder */}
            <WhalterTrueCharacter
              x={280}
              y={1060}
              scale={1.24}
              expression="panic"
              shirtColor="#0D9488"
              hairColor="blonde"
              bounceOffset={0.4}
            />
            {/* Hero Reaching for the Last Can of Beans */}
            <WhalterTrueCharacter
              x={640}
              y={1060}
              scale={1.36}
              isHero={true}
              prop="beans"
              expression={activeCut.heroExpression || "shocked"}
              shirtColor="#2563EB"
              hairColor="brown"
              subtitles={subtitles}
            />
          </g>
        ) : currentCut === 6 ? (
          // Scene 6: Power Grid Desync & City Blackout
          <g>
            {/* Bystander watching dark skyline */}
            <WhalterTrueCharacter
              x={220}
              y={1070}
              scale={1.15}
              expression="shocked"
              shirtColor="#DC2626"
              hairColor="black"
              bounceOffset={0.2}
            />
            {/* Far Bystander */}
            <WhalterTrueCharacter
              x={860}
              y={1070}
              scale={1.15}
              expression="panic"
              shirtColor="#0D9488"
              hairColor="purple"
              flipX={true}
              bounceOffset={0.6}
            />
            {/* Hero on Rooftop holding Candle */}
            <WhalterTrueCharacter
              x={540}
              y={1040}
              scale={1.38}
              isHero={true}
              prop="candle"
              expression={activeCut.heroExpression || "panic"}
              shirtColor="#2563EB"
              hairColor="brown"
              subtitles={subtitles}
            />
          </g>
        ) : currentCut === 7 ? (
          // Scene 7: Wall Street Trading Floor ($12T Erased & Chocolate Barter)
          <g>
            {/* Wall Street Broker Offering Rolex Watch */}
            <WhalterTrueCharacter
              x={320}
              y={1050}
              scale={1.3}
              role="trader"
              prop="watch"
              expression="panic"
              shirtColor="#334155"
              hairColor="grey"
              bounceOffset={0.3}
            />
            {/* Hero Holding Gold Chocolate Bar */}
            <WhalterTrueCharacter
              x={740}
              y={1050}
              scale={1.36}
              isHero={true}
              prop="chocolate"
              expression="smug"
              shirtColor="#2563EB"
              hairColor="brown"
              flipX={true}
              subtitles={subtitles}
            />
          </g>
        ) : (
          // Scene 8: Wi-Fi Router Loop Hook
          <g>
            <WhalterTrueCharacter
              x={540}
              y={1050}
              scale={1.38}
              isHero={true}
              prop="phone"
              expression="skeptical"
              shirtColor="#2563EB"
              hairColor="brown"
              subtitles={subtitles}
            />
          </g>
        )}

        {/* ================================================================ */}
        {/* 3. WHALTER SIGNATURE TOP INFORMATION HUD                         */}
        {/* ================================================================ */}
        <g transform={`translate(0, 130) scale(${hudScale})`} style={{ transformOrigin: "540px 100px" }}>
          {/* Yellow Episode / Part Badge */}
          <g transform="translate(540, 0)">
            <rect
              x="-48"
              y="-36"
              width="96"
              height="46"
              rx="23"
              fill="#EAB308"
              stroke="#000000"
              strokeWidth="6"
            />
            <text
              x="0"
              y="-4"
              fill="#000000"
              fontSize="28"
              fontWeight="900"
              fontFamily="'Arial Black', Impact, sans-serif"
              textAnchor="middle"
            >
              {activeCut.badgeText || "#2"}
            </text>
          </g>

          {/* Giant Dynamic Metric Counter (Impact Font with Heavy Black Outline) */}
          <text
            x="540"
            y="75"
            fill={activeCut.metricColor || "#FFFFFF"}
            stroke="#000000"
            strokeWidth="14"
            paintOrder="stroke fill"
            fontSize="68"
            fontWeight="900"
            fontFamily="'Impact', Arial Black, sans-serif"
            textAnchor="middle"
            letterSpacing="2"
          >
            {activeCut.metricText}
          </text>

          {/* Context Sub-Tag */}
          <text
            x="540"
            y="130"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="8"
            paintOrder="stroke fill"
            fontSize="28"
            fontWeight="900"
            fontFamily="'Impact', Arial Black, sans-serif"
            textAnchor="middle"
            letterSpacing="1"
          >
            {activeCut.contextTag}
          </text>
        </g>
      </svg>
    </div>
  );
};
