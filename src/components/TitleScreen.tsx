import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  SlidersHorizontal,
  Music,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Star,
  Sparkles,
  Check,
  ArrowRight,
  BookOpen,
  SpellCheck,
  GraduationCap,
  User,
  Users,
  Flag,
} from 'lucide-react';
import {
  GameSettings,
  GradeLevel,
  PlayerMode,
  SemesterNumber,
  TwoPlayerVocabMode,
  UnitNumber,
} from '../types';
import { sound } from '../utils/audio';
import { GRADE_META, GRADES, SEMESTERS, SEMESTER_META, UNITS } from '../utils/gameUtils';
import { triggerBackdropBurst } from './DynamicBackdrop';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  totalWords: number;
}

const TITLE_WORDS = [
  {
    word: 'Word',
    letters: [
      { char: 'W', color: 'text-rose-500', hex: '#F43F5E', note: 0 },
      { char: 'o', color: 'text-amber-500', hex: '#F59E0B', note: 1 },
      { char: 'r', color: 'text-emerald-500', hex: '#10B981', note: 2 },
      { char: 'd', color: 'text-sky-500', hex: '#0EA5E9', note: 3 },
    ],
  },
  {
    word: 'Fun!',
    letters: [
      { char: 'F', color: 'text-violet-500', hex: '#8B5CF6', note: 4 },
      { char: 'u', color: 'text-pink-500', hex: '#EC4899', note: 5 },
      { char: 'n', color: 'text-amber-500', hex: '#F59E0B', note: 6 },
      { char: '!', color: 'text-rose-500', hex: '#F43F5E', note: 7 },
    ],
  },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenSettings,
  settings,
  onUpdateSettings,
  totalWords,
}) => {
  const [mascotError, setMascotError] = useState(false);
  const [isOwlHopping, setIsOwlHopping] = useState(false);
  const hopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hopTimerRef.current !== null) {
        clearTimeout(hopTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.unlock();
        onStartGame();
      } else if (e.code === 'Escape') {
        onOpenSettings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, onOpenSettings]);

  const activeConfig =
    settings.gameMode === 'sentence' ? settings.sentenceConfig : settings.wordsConfig;
  const activeGrade = activeConfig.grade;
  const activeSemester = activeConfig.semester;
  const activeUnit = activeConfig.unit;
  const gradeInfo = GRADE_META[activeGrade];

  const triggerSmallBurst = (e: React.MouseEvent<HTMLElement>, color: string, count = 8) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerBackdropBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, color, count);
  };

  const handleSelectGrade = (grade: GradeLevel, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#F59E0B', 8);
    const meta = GRADE_META[grade];
    onUpdateSettings({
      ...settings,
      sentenceConfig: {
        ...settings.sentenceConfig,
        grade,
        semester: 1,
        unit: 1,
        targetWordCount: meta.suggestedTargetSentence,
      },
      wordsConfig: {
        ...settings.wordsConfig,
        grade,
        semester: 1,
        unit: 1,
        targetWordCount: meta.suggestedTargetWords,
      },
    });
  };

  const handleSelectSemester = (semester: SemesterNumber, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#8B5CF6', 8);
    onUpdateSettings({
      ...settings,
      sentenceConfig: { ...settings.sentenceConfig, semester, unit: 1 },
      wordsConfig: { ...settings.wordsConfig, semester, unit: 1 },
    });
  };

  const handleSelectUnit = (unit: UnitNumber, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#38BDF8', 8);
    onUpdateSettings({
      ...settings,
      sentenceConfig: { ...settings.sentenceConfig, unit },
      wordsConfig: { ...settings.wordsConfig, unit },
    });
  };

  const handleSelectPlayerMode = (playerMode: PlayerMode, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, playerMode === 'two' ? '#F97316' : '#0EA5E9', 10);
    onUpdateSettings({ ...settings, playerMode });
  };

  const handleSelectVocabMode = (vocabMode: TwoPlayerVocabMode, e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playClick();
    triggerSmallBurst(e, '#10B981', 8);
    onUpdateSettings({
      ...settings,
      twoPlayerConfig: { ...settings.twoPlayerConfig, vocabMode },
    });
  };

  const updateTargetScore = (nextScore: number) => {
    const clamped = Math.max(1, Math.min(30, Math.round(nextScore) || 1));
    onUpdateSettings({
      ...settings,
      twoPlayerConfig: { ...settings.twoPlayerConfig, targetScore: clamped },
    });
  };

  const handleMascotClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    sound.playRewardChime();
    triggerSmallBurst(e, '#FBBF24', 12);

    setIsOwlHopping(true);
    if (hopTimerRef.current !== null) {
      clearTimeout(hopTimerRef.current);
    }
    hopTimerRef.current = window.setTimeout(() => {
      setIsOwlHopping(false);
    }, 500);

    if (settings.voiceEnabled) {
      sound.speak("Hoo-hoo! Let's play Word Fun!");
    }
  };

  const handleTitleLetterClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    noteIdx: number,
    hexColor: string
  ) => {
    sound.unlock();
    sound.playConnect(noteIdx);
    triggerSmallBurst(e, hexColor, 6);
  };

  const toggleMusic = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    const next = !settings.musicEnabled;
    sound.playClick();
    if (next) triggerSmallBurst(e, '#A78BFA', 8);
    onUpdateSettings({ ...settings, musicEnabled: next });
  };

  const toggleSfx = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    const next = !settings.sfxEnabled;
    if (next) {
      sound.sfxEnabled = true;
      sound.playClick();
      triggerSmallBurst(e, '#34D399', 8);
    }
    onUpdateSettings({ ...settings, sfxEnabled: next });
  };

  const toggleVoice = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.unlock();
    const next = !settings.voiceEnabled;
    sound.playClick();
    if (next) {
      sound.voiceEnabled = true;
      sound.speak('Voice is on!');
      triggerSmallBurst(e, '#38BDF8', 8);
    }
    onUpdateSettings({ ...settings, voiceEnabled: next });
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between p-4 sm:p-6 overflow-y-auto overflow-x-hidden select-none z-10">
      {/* Top Bar: Alive Audio & Options Controls */}
      <header className="w-full max-w-6xl mx-auto flex flex-wrap items-center justify-end gap-3 z-20">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleMusic}
            className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 whitespace-nowrap ${
              settings.musicEnabled
                ? 'bg-violet-500 text-white hover:bg-violet-600 border-b-[3px] border-violet-700 hover:ring-4 hover:ring-violet-300/40'
                : 'bg-white/95 text-slate-600 hover:bg-white border-b-[3px] border-slate-200 hover:ring-4 hover:ring-slate-200/50'
            }`}
            title="Toggle Background Music"
          >
            <Music className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12" />
            <span>Music {settings.musicEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={toggleSfx}
            className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 whitespace-nowrap ${
              settings.sfxEnabled
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-b-[3px] border-emerald-700 hover:ring-4 hover:ring-emerald-300/40'
                : 'bg-white/95 text-slate-600 hover:bg-white border-b-[3px] border-slate-200 hover:ring-4 hover:ring-slate-200/50'
            }`}
            title="Toggle Sound Effects"
          >
            {settings.sfxEnabled ? (
              <Volume2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <VolumeX className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            )}
            <span>SFX {settings.sfxEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={toggleVoice}
            className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 whitespace-nowrap ${
              settings.voiceEnabled
                ? 'bg-sky-500 text-white hover:bg-sky-600 border-b-[3px] border-sky-700 hover:ring-4 hover:ring-sky-300/40'
                : 'bg-white/95 text-slate-600 hover:bg-white border-b-[3px] border-slate-200 hover:ring-4 hover:ring-slate-200/50'
            }`}
            title="Toggle Speaking Voice"
          >
            {settings.voiceEnabled ? (
              <Mic className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
            ) : (
              <MicOff className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            )}
            <span>Voice {settings.voiceEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              sound.unlock();
              sound.playClick();
              triggerSmallBurst(e, '#F59E0B', 6);
              onOpenSettings();
            }}
            className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/95 hover:bg-amber-50 text-slate-800 font-extrabold text-xs sm:text-sm shadow-sm border-2 border-amber-200 border-b-[3px] border-b-amber-300 transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:ring-4 hover:ring-amber-200/50 active:translate-y-0.5 whitespace-nowrap"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-600 transition-transform duration-300 group-hover:rotate-90" />
            <span>Options</span>
          </button>
        </div>
      </header>

      {/* Main Centerpiece: Kiddy Cartoon Logo + Word Fun! + Mode + Grade 1-6 & Unit 1-4 + PLAY! */}
      <main className="relative z-20 flex flex-col items-center justify-center text-center max-w-5xl w-full mx-auto my-auto py-2 space-y-4 sm:space-y-5">
        {/* Hero Brand Lockup */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="group relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 200 200"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full animate-[spin_45s_linear_infinite] motion-reduce:animate-none"
            >
              <circle
                cx="100"
                cy="100"
                r="93"
                fill="none"
                stroke="#FACC15"
                strokeWidth="5"
                strokeDasharray="12 10"
                strokeLinecap="round"
                opacity="0.95"
              />
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3.5"
                strokeDasharray="5 13"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>

            <Star
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-1 w-6 h-6 text-amber-400 fill-amber-300 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
            <Star
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 left-0 w-5 h-5 text-pink-500 fill-pink-300 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12 group-hover:-translate-x-1 group-hover:translate-y-1"
            />
            <Sparkles
              aria-hidden="true"
              className="pointer-events-none absolute top-3 left-0 w-5 h-5 text-sky-400 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12"
            />

            <button
              type="button"
              onClick={handleMascotClick}
              title="Tap Owl Mascot!"
              aria-label="Tap Cartoon Owl Mascot"
              className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-br from-amber-300 via-rose-400 to-sky-400 shadow-xl transition-all duration-200 cursor-pointer group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-amber-200/70 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${
                isOwlHopping ? 'animate-bounce-short' : ''
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-amber-50 flex items-center justify-center border-4 border-white">
                {!mascotError ? (
                  <img
                    src="/src/assets/images/cartoon_mascot_logo_1794679789169.jpg"
                    alt="Word Fun Cartoon Owl Mascot Logo"
                    decoding="async"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onError={() => setMascotError(true)}
                    className="w-full h-full object-cover select-none"
                  />
                ) : (
                  <Sparkles className="w-14 h-14 text-amber-500" />
                )}
              </div>
            </button>
          </div>

          <div className="text-center md:text-left">
            <h1
              aria-label="Word Fun!"
              style={{
                WebkitTextStroke: '4px #FFFFFF',
                paintOrder: 'stroke fill',
                textShadow: '0 7px 0 rgba(15, 23, 42, 0.16)',
              }}
              className="font-display font-bold tracking-tight leading-none text-5xl sm:text-7xl md:text-[6rem] flex flex-wrap items-center justify-center md:justify-start gap-x-4 sm:gap-x-5"
            >
              {TITLE_WORDS.map(group => (
                <span key={group.word} className="inline-flex items-baseline">
                  {group.letters.map((item, idx) => (
                    <button
                      key={`${group.word}-${idx}`}
                      type="button"
                      onClick={(e) => handleTitleLetterClick(e, item.note, item.hex)}
                      title="Tap letter for music!"
                      className={`${item.color} inline-block transition-transform duration-150 ease-out hover:-translate-y-3 hover:scale-110 hover:-rotate-3 active:scale-95 cursor-pointer bg-transparent border-0 p-0 focus:outline-none`}
                    >
                      {item.char}
                    </button>
                  ))}
                </span>
              ))}
            </h1>
            <p className="mt-2 text-sm sm:text-base font-extrabold text-slate-800 bg-white/95 inline-block px-5 py-1 rounded-full shadow-sm border-2 border-amber-200/80 transition-transform duration-200 hover:scale-[1.02]">
              Connect Words &amp; Spell across Grade 1 to Grade 6
            </p>
          </div>
        </div>

        {/* Player Mode Selector: Single Player (Default) vs Two Player (Tug of War) */}
        <div className="w-full max-w-2xl bg-white/95 rounded-3xl p-2.5 sm:p-3 shadow-lg border-2 border-sky-200 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => handleSelectPlayerMode('single', e)}
              className={`group flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-2xl font-display font-bold text-sm sm:text-base transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap ${
                settings.playerMode === 'single'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md border-b-[3px] border-blue-800 ring-2 ring-sky-300/50'
                  : 'bg-sky-50/80 hover:bg-sky-100 text-slate-700 border-b-[3px] border-sky-200'
              }`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Single Player</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSelectPlayerMode('two', e)}
              className={`group flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-2xl font-display font-bold text-sm sm:text-base transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap ${
                settings.playerMode === 'two'
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md border-b-[3px] border-rose-800 ring-2 ring-orange-300/50'
                  : 'bg-orange-50/80 hover:bg-orange-100 text-slate-700 border-b-[3px] border-orange-200'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Two Players · Tug of War</span>
            </button>
          </div>

          {settings.playerMode === 'two' && (
            <div className="pt-2 border-t border-sky-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 animate-pop-in">
              {/* Two-Player Vocabulary Mode */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={(e) => handleSelectVocabMode('same', e)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    settings.twoPlayerConfig.vocabMode === 'same'
                      ? 'bg-white text-sky-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Same Vocabularies
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSelectVocabMode('random', e)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    settings.twoPlayerConfig.vocabMode === 'random'
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Random Vocabularies
                </button>
              </div>

              {/* Teacher Target Score Input */}
              <div className="flex items-center justify-between sm:justify-end gap-2 bg-amber-50/90 border border-amber-200 px-3 py-1 rounded-2xl">
                <label
                  htmlFor="title-target-score"
                  className="text-xs font-extrabold text-amber-900 flex items-center gap-1 whitespace-nowrap"
                >
                  <Flag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Target Score:</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={settings.twoPlayerConfig.targetScore <= 1}
                    onClick={() => {
                      sound.playClick();
                      updateTargetScore(settings.twoPlayerConfig.targetScore - 1);
                    }}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-amber-100 text-slate-800 font-black text-sm border border-amber-200 disabled:opacity-40 cursor-pointer"
                    aria-label="Decrease target score"
                  >
                    -
                  </button>
                  <input
                    id="title-target-score"
                    type="number"
                    min={1}
                    max={30}
                    value={settings.twoPlayerConfig.targetScore}
                    onChange={e => updateTargetScore(Number(e.target.value))}
                    className="w-12 text-center py-1 rounded-lg bg-white border border-amber-300 font-display font-bold text-sm text-slate-900 tabular-nums focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    disabled={settings.twoPlayerConfig.targetScore >= 30}
                    onClick={() => {
                      sound.playClick();
                      updateTargetScore(settings.twoPlayerConfig.targetScore + 1);
                    }}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-amber-100 text-slate-800 font-black text-sm border border-amber-200 disabled:opacity-40 cursor-pointer"
                    aria-label="Increase target score"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Cards */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={(e) => {
              sound.unlock();
              sound.playClick();
              triggerSmallBurst(e, '#38BDF8', 10);
              onUpdateSettings({ ...settings, gameMode: 'sentence' });
            }}
            className={`group relative overflow-hidden p-4 rounded-3xl text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 border-2 border-b-[5px] hover:-translate-y-1 hover:shadow-xl active:translate-y-0.5 ${
              settings.gameMode === 'sentence'
                ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-300 border-b-blue-800 shadow-lg ring-4 ring-sky-300/35'
                : 'bg-white/95 text-slate-800 border-sky-200 border-b-sky-300 hover:border-sky-400 hover:bg-sky-50/95 shadow-md'
            }`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-20 -translate-x-full group-hover:translate-x-[340%] transition-transform duration-500 ease-out"
            />
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6 ${
                settings.gameMode === 'sentence'
                  ? 'bg-white/25 text-white'
                  : 'bg-sky-100 text-sky-600'
              }`}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-lg sm:text-xl leading-tight">
                Sentence Mode
              </div>
              <div
                className={`text-xs font-semibold truncate mt-0.5 ${
                  settings.gameMode === 'sentence' ? 'text-sky-100' : 'text-slate-500'
                }`}
              >
                Grade {settings.sentenceConfig.grade} · Sem {settings.sentenceConfig.semester} · Unit{' '}
                {settings.sentenceConfig.unit} · {settings.sentenceConfig.targetWordCount} words
              </div>
              <div
                className={`mt-1 inline-flex items-center gap-1 text-xs font-extrabold ${
                  settings.gameMode === 'sentence' ? 'text-amber-200' : 'text-sky-600'
                }`}
              >
                {settings.gameMode === 'sentence' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </>
                ) : (
                  <>
                    <span>Choose Mode</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={(e) => {
              sound.unlock();
              sound.playClick();
              triggerSmallBurst(e, '#A78BFA', 10);
              onUpdateSettings({ ...settings, gameMode: 'spelling' });
            }}
            className={`group relative overflow-hidden p-4 rounded-3xl text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 border-2 border-b-[5px] hover:-translate-y-1 hover:shadow-xl active:translate-y-0.5 ${
              settings.gameMode === 'spelling'
                ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white border-violet-300 border-b-fuchsia-800 shadow-lg ring-4 ring-violet-300/35'
                : 'bg-white/95 text-slate-800 border-violet-200 border-b-violet-300 hover:border-violet-400 hover:bg-violet-50/95 shadow-md'
            }`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-20 -translate-x-full group-hover:translate-x-[340%] transition-transform duration-500 ease-out"
            />
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 ${
                settings.gameMode === 'spelling'
                  ? 'bg-white/25 text-white'
                  : 'bg-violet-100 text-violet-600'
              }`}
            >
              <SpellCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-lg sm:text-xl leading-tight">
                Spelling Mode
              </div>
              <div
                className={`text-xs font-semibold truncate mt-0.5 ${
                  settings.gameMode === 'spelling' ? 'text-violet-100' : 'text-slate-500'
                }`}
              >
                Grade {settings.wordsConfig.grade} · Sem {settings.wordsConfig.semester} · Unit{' '}
                {settings.wordsConfig.unit} · {settings.wordsConfig.targetWordCount} letters
              </div>
              <div
                className={`mt-1 inline-flex items-center gap-1 text-xs font-extrabold ${
                  settings.gameMode === 'spelling' ? 'text-amber-200' : 'text-violet-600'
                }`}
              >
                {settings.gameMode === 'spelling' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </>
                ) : (
                  <>
                    <span>Choose Mode</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Grade 1 - Grade 6, 2 Semesters & 4 Units Selector Panel */}
        <div className="w-full max-w-2xl bg-white/95 rounded-3xl p-3.5 sm:p-4 shadow-lg border-2 border-amber-200 space-y-2.5">
          {/* Grade 1 to Grade 6 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 gap-2">
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-500" />
                <span>Select Grade</span>
              </span>
              <span className="text-xs font-bold text-amber-700 truncate">
                {gradeInfo.label} · {SEMESTER_META[activeSemester].label} · Unit {activeUnit}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {GRADES.map(g => {
                const isSelected = activeGrade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={(e) => handleSelectGrade(g, e)}
                    className={`py-2 px-2 rounded-2xl font-display font-bold text-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-md border-b-[3px] border-orange-700 ring-2 ring-amber-300/60'
                        : 'bg-amber-50 hover:bg-amber-100 text-slate-700 border-b-[3px] border-amber-200 hover:shadow-sm'
                    }`}
                  >
                    Grade {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 Semesters inside the selected Grade */}
          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-amber-100">
            {SEMESTERS.map(sem => {
              const isSelected = activeSemester === sem;
              return (
                <button
                  key={sem}
                  type="button"
                  onClick={(e) => handleSelectSemester(sem, e)}
                  className={`py-2 px-3 rounded-2xl font-display font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-between gap-2 whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md border-b-[3px] border-indigo-800 ring-2 ring-violet-300/50'
                      : 'bg-violet-50/80 hover:bg-violet-100 text-slate-700 border-b-[3px] border-violet-200 hover:shadow-sm'
                  }`}
                >
                  <span>{SEMESTER_META[sem].label}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isSelected ? 'text-violet-100' : 'text-slate-500'
                    }`}
                  >
                    4 Units
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4 Units inside the selected Semester */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-amber-100">
            {UNITS.map(u => {
              const isSelected = activeUnit === u;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={(e) => handleSelectUnit(u, e)}
                  className={`py-2.5 px-3 rounded-2xl text-center font-display font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md border-b-[3px] border-teal-800 ring-2 ring-emerald-300/50'
                      : 'bg-sky-50/80 hover:bg-sky-100 text-slate-800 border-b-[3px] border-sky-200 hover:shadow-sm'
                  }`}
                >
                  Unit {u}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Arcade Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              sound.unlock();
              sound.playClick();
              triggerSmallBurst(e, '#34D399', 12);
              onStartGame();
            }}
            className="group relative overflow-hidden flex items-center gap-3 px-11 py-3.5 sm:py-4 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display font-bold text-2xl sm:text-3xl shadow-xl border-2 border-emerald-300/60 border-b-[6px] border-b-emerald-700 hover:-translate-y-1 hover:shadow-2xl hover:ring-4 hover:ring-emerald-300/45 active:translate-y-1 active:border-b-2 transition-all duration-200 cursor-pointer"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-20 -translate-x-full group-hover:translate-x-[340%] transition-transform duration-500 ease-out"
            />
            <Play className="relative w-7 h-7 sm:w-8 sm:h-8 fill-white transition-transform duration-200 group-hover:scale-115 group-hover:translate-x-0.5" />
            <span className="relative">PLAY!</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              sound.unlock();
              sound.playClick();
              triggerSmallBurst(e, '#F59E0B', 8);
              onOpenSettings();
            }}
            className="group relative overflow-hidden flex items-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-3xl bg-white/95 hover:bg-amber-50 text-slate-800 font-display font-bold text-xl shadow-md border-2 border-amber-200 border-b-[6px] border-b-amber-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-300 hover:ring-4 hover:ring-amber-200/50 active:translate-y-1 active:border-b-2 transition-all duration-200 cursor-pointer"
          >
            <SlidersHorizontal className="w-6 h-6 text-amber-500 transition-transform duration-300 group-hover:rotate-90" />
            <span>Options</span>
          </button>
        </div>
      </main>

      {/* Clean Single-Line Shortcut & Curriculum Summary Footer */}
      <footer className="w-full text-center z-20 pt-2">
        <p className="inline-block px-5 py-1.5 rounded-full bg-white/90 text-xs font-bold text-slate-700 shadow-sm border border-amber-100">
          Enter / Space to Play · Esc for Options · {settings.playerMode === 'two' ? `Two Players (${settings.twoPlayerConfig.vocabMode === 'same' ? 'Same' : 'Random'} · Target ${settings.twoPlayerConfig.targetScore})` : 'Single Player'} · Grade {activeGrade} · {SEMESTER_META[activeSemester].label} · Unit {activeUnit} · {totalWords} Items
        </p>
      </footer>
    </div>
  );
};
