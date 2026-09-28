'use client';

import React, { useState, useRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { 
  TeaserComposition, 
  TEASER_TOTAL_FRAMES, 
  TEASER_FPS, 
  TEASER_WIDTH, 
  TEASER_HEIGHT 
} from '@/remotion/TeaserComposition';
import { Navbar } from '@/components/Navbar';
import { Play, Pause, RotateCcw, Monitor, Smartphone, Sparkles, Download, Check } from 'lucide-react';

export default function TeaserStudioPage() {
  const playerRef = useRef<PlayerRef>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const jumpToScene = (frame: number) => {
    playerRef.current?.seekTo(frame);
  };

  const handleCopyRenderCommand = () => {
    navigator.clipboard.writeText('npx remotion render remotion/index.ts Teaser public/videos/teaser.mp4');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col items-center">
        {/* Header */}
        <div className="w-full mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                AlphaSector Teaser Studio (Remotion 60 FPS)
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              High-octane No-VO product teaser rendered programmatically with real React components and spring physics.
            </p>
          </div>

          {/* Aspect Ratio Switcher & Render Command */}
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Master</span>
              </button>

              <button
                onClick={() => setAspectRatio('9:16')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Mobile</span>
              </button>
            </div>

            <button
              onClick={handleCopyRenderCommand}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-all"
              title="Salin CLI render command"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span>{copiedCmd ? 'Command Tersalin!' : 'Copy Render CLI'}</span>
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div 
          className={`w-full transition-all duration-300 flex justify-center items-center my-auto ${
            aspectRatio === '16:9' ? 'max-w-5xl' : 'max-w-sm'
          }`}
        >
          <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black relative group">
            <Player
              ref={playerRef}
              component={TeaserComposition}
              durationInFrames={TEASER_TOTAL_FRAMES}
              compositionWidth={TEASER_WIDTH}
              compositionHeight={TEASER_HEIGHT}
              fps={TEASER_FPS}
              style={{
                width: '100%',
                aspectRatio: aspectRatio === '16:9' ? '16 / 9' : '9 / 16',
              }}
              controls
              autoPlay={false}
              loop
            />
          </div>
        </div>

        {/* Scene Jump Navigation Deck */}
        <div className="w-full max-w-5xl mt-6 p-4 rounded-2xl bg-[#0d121e]/90 border border-slate-800 glass-panel flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-400 mr-2">Jump to Scene:</span>
          
          <button 
            onClick={() => jumpToScene(0)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all font-medium"
          >
            01. The Hook (0s)
          </button>

          <button 
            onClick={() => jumpToScene(360)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all font-medium"
          >
            02. AlphaAgent (6s)
          </button>

          <button 
            onClick={() => jumpToScene(960)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all font-medium"
          >
            03. Screener & Battle (16s)
          </button>

          <button 
            onClick={() => jumpToScene(1560)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all font-medium"
          >
            04. Smart Money 2.0 (26s)
          </button>

          <button 
            onClick={() => jumpToScene(2160)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all font-medium"
          >
            05. Workflow & Notion (36s)
          </button>

          <button 
            onClick={() => jumpToScene(2520)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all font-medium"
          >
            06. Outro Riser (42s)
          </button>
        </div>
      </main>
    </div>
  );
}
