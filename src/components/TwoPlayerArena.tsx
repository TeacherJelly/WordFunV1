import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Home,
  Music,
  RotateCcw,
  Settings as SettingsIcon,
  Shuffle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DotNode, GameItem, GameSettings, ModeConfig } from '../types';
import { CANDY_COLORS, extractTokens, generateDotNodes } from '../utils/gameUtils';
import { sound } from '../utils/audio';
import { triggerBackdropBurst } from './DynamicBackdrop';
import { GameBoard } from './GameBoard';
import { SentenceTray, SlotAuditStatus } from './SentenceTray';
import { TugOfWarArena } from './TugOfWarArena';
import { TwoPlayerVictoryModal } from './TwoPlayerVictoryModal';

interface TeamPuzzleState {
  item: GameItem;
  tokens: string[];
  nodes: DotNode[];
  selectedNodeIds: string[];
  auditResults: SlotAuditStatus[] | null;
}

interface TwoPlayerArenaProps {
  settings: GameSettings;
  activeModeConfig: ModeConfig;
  filteredItems: GameItem[];
  onUpdateSettings: (newSettings: GameSettings) => void;
  onOpenSettings: () => void;
  onGoToTitleScreen: () => void;
}

function createTeamState(item: GameItem): TeamPuzzleState {
  const tokens = extractTokens(item);
  return {
    item,
    tokens,
    nodes: generateDotNodes(tokens),
    selectedNodeIds: [],
    auditResults: null,
  };
}

function pickRandomItem(pool: GameItem[], excludeIds: string[]): GameItem {
  if (pool.length <= 1) return pool[0];
  const candidates = pool.filter(it => !excludeIds.includes(it.id));
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export const TwoPlayerArena: React.FC<TwoPlayerArenaProps> = ({
  settings,
  activeModeConfig,
  filteredItems,
  onUpdateSettings,
  onOpenSettings,
  onGoToTitleScreen,
}) => {
  const { vocabMode, targetScore } = settings.twoPlayerConfig;

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundWinner, setRoundWinner] = useState<1 | 2 | null>(null);
  const [matchWinner, setMatchWinner] = useState<1 | 2 | null>(null);

  const [team1State, setTeam1State] = useState<TeamPuzzleState | null>(() => {
    if (filteredItems.length === 0) return null;
    return createTeamState(filteredItems[0]);
  });

  const [team2State, setTeam2State] = useState<TeamPuzzleState | null>(() => {
    if (filteredItems.length === 0) return null;
    if (vocabMode === 'same') {
      return createTeamState(filteredItems[0]);
    }
    const second = pickRandomItem(filteredItems, [filteredItems[0].id]);
    return createTeamState(second);
  });

  const roundTimerRef = useRef<number | null>(null);
  const prevItemsRef = useRef<{ t1?: string; t2?: string }>({});

  const clearTimers = useCallback(() => {
    if (roundTimerRef.current !== null) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const dealNextRound = useCallback(
    (nextRoundNum: number) => {
      if (filteredItems.length === 0) return;

      let item1: GameItem;
      let item2: GameItem;

      if (vocabMode === 'same') {
        const shared = filteredItems[(nextRoundNum - 1) % filteredItems.length];
        item1 = shared;
        item2 = shared;
      } else {
        item1 = pickRandomItem(
          filteredItems,
          prevItemsRef.current.t1 ? [prevItemsRef.current.t1] : []
        );
        const excludeFor2 = [item1.id];
        if (filteredItems.length > 2 && prevItemsRef.current.t2) {
          excludeFor2.push(prevItemsRef.current.t2);
        }
        item2 = pickRandomItem(filteredItems, excludeFor2);
      }

      prevItemsRef.current = { t1: item1.id, t2: item2.id };
      setTeam1State(createTeamState(item1));
      setTeam2State(createTeamState(item2));
      setRoundWinner(null);
    },
    [filteredItems, vocabMode]
  );

  // Reset match cleanly when curriculum, game mode, or vocab mode changes
  useEffect(() => {
    clearTimers();
    setTeam1Score(0);
    setTeam2Score(0);
    setRoundNumber(1);
    setMatchWinner(null);
    dealNextRound(1);
  }, [
    settings.gameMode,
    vocabMode,
    activeModeConfig.grade,
    activeModeConfig.semester,
    activeModeConfig.unit,
    activeModeConfig.targetWordCount,
    clearTimers,
    dealNextRound,
  ]);

  const handleRestartMatch = useCallback(() => {
    clearTimers();
    sound.playClick();
    setTeam1Score(0);
    setTeam2Score(0);
    setRoundNumber(1);
    setMatchWinner(null);
    dealNextRound(1);
  }, [clearTimers, dealNextRound]);

  const handleSkipRound = () => {
    if (matchWinner || roundWinner) return;
    clearTimers();
    sound.playClick();
    const next = roundNumber + 1;
    setRoundNumber(next);
    dealNextRound(next);
  };

  const makeTeamHandlers = (team: 1 | 2) => {
    const state = team === 1 ? team1State : team2State;
    const setState = team === 1 ? setTeam1State : setTeam2State;
    const isLocked = roundWinner !== null || matchWinner !== null;

    const onToggleNode = (nodeId: string, clientX: number, clientY: number) => {
      if (isLocked) return;
      setState(prev => {
        if (!prev) return prev;
        const existingIdx = prev.selectedNodeIds.indexOf(nodeId);
        if (existingIdx !== -1) {
          sound.playDisconnect();
          return {
            ...prev,
            auditResults: null,
            selectedNodeIds: prev.selectedNodeIds.filter(id => id !== nodeId),
          };
        }
        if (prev.selectedNodeIds.length >= prev.tokens.length) {
          return prev;
        }
        const node = prev.nodes.find(n => n.id === nodeId);
        const color = node ? CANDY_COLORS[node.colorIndex].hex : '#FBBF24';
        sound.playConnect(prev.selectedNodeIds.length);
        triggerBackdropBurst(clientX, clientY, color, 10);
        return {
          ...prev,
          auditResults: null,
          selectedNodeIds: [...prev.selectedNodeIds, nodeId],
        };
      });
    };

    const onMoveNode = (nodeId: string, xPct: number, yPct: number) => {
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          nodes: prev.nodes.map(n => (n.id === nodeId ? { ...n, x: xPct, y: yPct } : n)),
        };
      });
    };

    const onRemoveAtSlot = (slotIndex: number) => {
      if (isLocked) return;
      sound.playDisconnect();
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          auditResults: null,
          selectedNodeIds: prev.selectedNodeIds.filter((_, idx) => idx !== slotIndex),
        };
      });
    };

    const onReset = () => {
      if (isLocked) return;
      sound.playClick();
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          auditResults: null,
          selectedNodeIds: [],
        };
      });
    };

    const onCheckAnswer = () => {
      if (isLocked || !state || state.selectedNodeIds.length < state.tokens.length) return;
      sound.unlock();

      const nodeMap = new Map(state.nodes.map(n => [n.id, n]));
      const slotStatuses: SlotAuditStatus[] = state.selectedNodeIds.map((id, idx) => {
        const node = nodeMap.get(id);
        if (!node) return 'wrong';
        return node.text === state.tokens[idx] ? 'correct' : 'wrong';
      });

      const isAllCorrect = slotStatuses.every(s => s === 'correct');
      setState(prev => (prev ? { ...prev, auditResults: slotStatuses } : prev));

      if (!isAllCorrect) {
        sound.playTryAgain();
        return;
      }

      // First team to complete scores +1!
      sound.playAuditCheck();
      setRoundWinner(team);

      const nextScore1 = team === 1 ? team1Score + 1 : team1Score;
      const nextScore2 = team === 2 ? team2Score + 1 : team2Score;

      if (team === 1) {
        setTeam1Score(nextScore1);
      } else {
        setTeam2Score(nextScore2);
      }

      clearTimers();
      if ((team === 1 ? nextScore1 : nextScore2) >= targetScore) {
        roundTimerRef.current = window.setTimeout(() => {
          setMatchWinner(team);
        }, 680);
      } else {
        roundTimerRef.current = window.setTimeout(() => {
          const nextRound = roundNumber + 1;
          setRoundNumber(nextRound);
          dealNextRound(nextRound);
        }, 1150);
      }
    };

    return { onToggleNode, onMoveNode, onRemoveAtSlot, onReset, onCheckAnswer };
  };

  const t1Handlers = makeTeamHandlers(1);
  const t2Handlers = makeTeamHandlers(2);

  const t1Progress =
    team1State && team1State.tokens.length > 0
      ? team1State.selectedNodeIds.length / team1State.tokens.length
      : 0;
  const t2Progress =
    team2State && team2State.tokens.length > 0
      ? team2State.selectedNodeIds.length / team2State.tokens.length
      : 0;

  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between p-2 sm:p-3 gap-2">
      {/* Top Two-Player HUD */}
      <header className="w-full max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 px-1 z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoToTitleScreen}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 hover:bg-sky-50 text-slate-800 shadow-md border-2 border-white hover:border-sky-200 hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 font-bold text-xs cursor-pointer whitespace-nowrap"
            title="Go to Title Screen"
          >
            <Home className="w-4 h-4 text-sky-600 transition-transform duration-150 group-hover:scale-110" />
            <span className="hidden sm:inline">Title</span>
          </button>

          <div className="bg-white/95 px-3 py-1.5 rounded-2xl shadow-md border border-white text-xs font-bold text-slate-700 flex items-center gap-2 whitespace-nowrap">
            <span className="text-slate-900">
              {settings.gameMode === 'sentence' ? 'Sentence' : 'Spelling'}
            </span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-sky-700">
              Grade {activeModeConfig.grade} · Sem {activeModeConfig.semester} · Unit {activeModeConfig.unit}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleSkipRound}
            disabled={roundWinner !== null || matchWinner !== null}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/95 hover:bg-amber-50 text-slate-700 font-bold text-xs shadow-md border border-white hover:border-amber-200 transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
            title="Deal Next Vocabulary Round"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Next Round</span>
          </button>

          <button
            type="button"
            onClick={handleRestartMatch}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/95 hover:bg-rose-50 text-slate-700 font-bold text-xs shadow-md border border-white hover:border-rose-200 transition-all cursor-pointer whitespace-nowrap"
            title="Restart Two Players Match (0-0)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Reset Score</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.unlock();
              sound.playClick();
              onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
            }}
            className={`group p-2 rounded-2xl shadow-md border border-white hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer ${
              settings.musicEnabled
                ? 'bg-violet-500 hover:bg-violet-600 text-white'
                : 'bg-white/95 hover:bg-white text-slate-400'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              sound.unlock();
              const next = !settings.sfxEnabled;
              if (next) {
                sound.sfxEnabled = true;
                sound.playClick();
              }
              onUpdateSettings({ ...settings, sfxEnabled: next });
            }}
            className="group p-2 rounded-2xl bg-white/95 hover:bg-emerald-50 text-slate-700 shadow-md border border-white hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 cursor-pointer"
            title="Toggle Sound Effects"
          >
            {settings.sfxEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md border border-white hover:border-amber-200 transition-all duration-150 font-bold text-xs cursor-pointer whitespace-nowrap"
            title="Options & Settings"
          >
            <SettingsIcon className="w-4 h-4 text-sky-600 transition-transform duration-300 group-hover:rotate-90" />
            <span className="hidden sm:inline">Options</span>
          </button>
        </div>
      </header>

      {/* Tug-of-War Live Animated Cartoon Illustration & Scoreboard */}
      <TugOfWarArena
        team1Score={team1Score}
        team2Score={team2Score}
        targetScore={targetScore}
        team1Progress={t1Progress}
        team2Progress={t2Progress}
        roundWinner={roundWinner}
        roundNumber={roundNumber}
        vocabMode={vocabMode}
      />

      {/* Split-Screen Arena: Team 1 (Left) vs Team 2 (Right) */}
      <main className="w-full max-w-[1440px] mx-auto flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 relative">
        {/* Team 1 Half */}
        <section
          aria-label="Team 1 Play Area"
          className="flex flex-col gap-2 min-h-0 h-full"
        >
          {team1State && (
            <>
              <SentenceTray
                item={team1State.item}
                tokens={team1State.tokens}
                selectedNodeIds={team1State.selectedNodeIds}
                nodes={team1State.nodes}
                auditResults={team1State.auditResults}
                onRemoveAtSlot={t1Handlers.onRemoveAtSlot}
                onCheckAnswer={t1Handlers.onCheckAnswer}
                onReset={t1Handlers.onReset}
                compact
                teamLabel="Team 1"
                teamAccent="blue"
                disabled={roundWinner !== null || matchWinner !== null}
              />
              <GameBoard
                item={team1State.item}
                nodes={team1State.nodes}
                selectedNodeIds={team1State.selectedNodeIds}
                auditResults={team1State.auditResults}
                modeConfig={activeModeConfig}
                onToggleNode={t1Handlers.onToggleNode}
                onMoveNode={t1Handlers.onMoveNode}
                compact
                teamAccent="blue"
                disabled={roundWinner !== null || matchWinner !== null}
              />
            </>
          )}
        </section>

        {/* Team 2 Half */}
        <section
          aria-label="Team 2 Play Area"
          className="flex flex-col gap-2 min-h-0 h-full"
        >
          {team2State && (
            <>
              <SentenceTray
                item={team2State.item}
                tokens={team2State.tokens}
                selectedNodeIds={team2State.selectedNodeIds}
                nodes={team2State.nodes}
                auditResults={team2State.auditResults}
                onRemoveAtSlot={t2Handlers.onRemoveAtSlot}
                onCheckAnswer={t2Handlers.onCheckAnswer}
                onReset={t2Handlers.onReset}
                compact
                teamLabel="Team 2"
                teamAccent="coral"
                disabled={roundWinner !== null || matchWinner !== null}
              />
              <GameBoard
                item={team2State.item}
                nodes={team2State.nodes}
                selectedNodeIds={team2State.selectedNodeIds}
                auditResults={team2State.auditResults}
                modeConfig={activeModeConfig}
                onToggleNode={t2Handlers.onToggleNode}
                onMoveNode={t2Handlers.onMoveNode}
                compact
                teamAccent="coral"
                disabled={roundWinner !== null || matchWinner !== null}
              />
            </>
          )}
        </section>
      </main>

      {/* Match Winner Celebration Modal */}
      <TwoPlayerVictoryModal
        winnerTeam={matchWinner}
        team1Score={team1Score}
        team2Score={team2Score}
        targetScore={targetScore}
        onPlayAgain={handleRestartMatch}
        onGoToTitleScreen={onGoToTitleScreen}
      />
    </div>
  );
};
