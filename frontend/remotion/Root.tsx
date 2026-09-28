import React from 'react';
import { Composition } from 'remotion';
import { 
  TeaserComposition, 
  TEASER_TOTAL_FRAMES, 
  TEASER_FPS, 
  TEASER_WIDTH, 
  TEASER_HEIGHT 
} from './TeaserComposition';
import '../app/globals.css';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Teaser"
      component={TeaserComposition}
      durationInFrames={TEASER_TOTAL_FRAMES}
      fps={TEASER_FPS}
      width={TEASER_WIDTH}
      height={TEASER_HEIGHT}
    />
  );
};
