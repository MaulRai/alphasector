import React from 'react';
import { Composition } from 'remotion';
import { 
  TeaserComposition, 
  TEASER_TOTAL_FRAMES, 
  TEASER_FPS, 
  TEASER_WIDTH, 
  TEASER_HEIGHT 
} from './TeaserComposition';
import { SceneAlphaAgent3D } from './scenes/SceneAlphaAgent3D';
import { ScenePeerBattle3D } from './scenes/ScenePeerBattle3D';
import { SceneSmartMoney3D } from './scenes/SceneSmartMoney3D';
import '../app/globals.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Teaser"
        component={TeaserComposition}
        durationInFrames={TEASER_TOTAL_FRAMES}
        fps={TEASER_FPS}
        width={TEASER_WIDTH}
        height={TEASER_HEIGHT}
      />
      <Composition
        id="AlphaAgent3D"
        component={SceneAlphaAgent3D}
        durationInFrames={300} // 5 seconds at 60 FPS
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="PeerBattle3D"
        component={ScenePeerBattle3D}
        durationInFrames={300} // 5 seconds at 60 FPS
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="SmartMoney3D"
        component={SceneSmartMoney3D}
        durationInFrames={300} // 5 seconds at 60 FPS
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
