'use client';

import React from 'react';
import { Sequence } from 'remotion';
import { Scene1Hook } from './scenes/Scene1Hook';
import { Scene2Agent } from './scenes/Scene2Agent';
import { Scene3ScreenerBattle } from './scenes/Scene3ScreenerBattle';
import { Scene4SmartMoney } from './scenes/Scene4SmartMoney';
import { Scene5Workflow } from './scenes/Scene5Workflow';
import { Scene6Outro } from './scenes/Scene6Outro';

export const TEASER_TOTAL_FRAMES = 2880; // 48 seconds at 60 FPS
export const TEASER_FPS = 60;
export const TEASER_WIDTH = 1920;
export const TEASER_HEIGHT = 1080;

export const TeaserComposition: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#05070c] text-slate-100 overflow-hidden relative">
      {/* Scene 1: The Hook & The Problem (0s - 6s / frames 0 - 360) */}
      <Sequence from={0} durationInFrames={360}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: Meet Your Agent & Parallel MCP (6s - 16s / frames 360 - 960) */}
      <Sequence from={360} durationInFrames={600}>
        <Scene2Agent />
      </Sequence>

      {/* Scene 3: Screener Pro & Peer Battle (16s - 26s / frames 960 - 1560) */}
      <Sequence from={960} durationInFrames={600}>
        <Scene3ScreenerBattle />
      </Sequence>

      {/* Scene 4: Smart Money 2.0 Forensic Radar (26s - 36s / frames 1560 - 2160) */}
      <Sequence from={1560} durationInFrames={600}>
        <Scene4SmartMoney />
      </Sequence>

      {/* Scene 5: Context Injection & Notion Sync (36s - 42s / frames 2160 - 2520) */}
      <Sequence from={2160} durationInFrames={360}>
        <Scene5Workflow />
      </Sequence>

      {/* Scene 6: Outro & Call-To-Action (42s - 48s / frames 2520 - 2880) */}
      <Sequence from={2520} durationInFrames={360}>
        <Scene6Outro />
      </Sequence>
    </div>
  );
};
