'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { CodeEditor } from '@/components/CodeEditor';
import { DuelBattleHeader } from '@/components/duels/DuelBattleHeader';
import { DuelTestRunner, type TestResultItem } from '@/components/duels/DuelTestRunner';
import { DuelVictoryModal } from '@/components/duels/DuelVictoryModal';
import { useDuelRealtime } from '@/hooks/useDuelRealtime';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { runCodeInSandbox } from '@/lib/code-runner';
import {
  DUEL_PROBLEMS,
  buildTestHarness,
  parseProblemFromJson,
  type DuelProblem,
} from '@/lib/duel-problems';
import { Swords, ArrowLeft, Sparkles, Flame } from 'lucide-react';

interface DuelDetailContentProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    total_xp: number;
    streak?: number;
  };
  initialDuel: any;
}

export function DuelDetailContent({ user, initialDuel }: DuelDetailContentProps) {
  const [duel, setDuel] = useState<any>(initialDuel);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutos
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Match a preset problem or parse a generated problem definition.
  const problem: DuelProblem = useMemo(() => {
    // 1. Try to parse a generated problem from problem_body JSON.
    const aiProblem = parseProblemFromJson(initialDuel.problem_body);
    if (aiProblem) return aiProblem;

    // 2. Try to match a preset problem by title
    const found = DUEL_PROBLEMS.find(
      (p) =>
        p.title.toLowerCase() === initialDuel.problem_title?.toLowerCase() ||
        initialDuel.problem_title?.toLowerCase().includes(p.title.toLowerCase())
    );
    if (found) return found;

    // 3. Fallback: problem generated dynamically with generic test case
    return {
      id: 'custom-duel',
      title: initialDuel.problem_title,
      difficulty: 'Médio' as const,
      description: initialDuel.problem_body,
      functionName: 'solve',
      starters: {
        TS: '// Escreva a solução para o problema\nfunction solve() {\n  return true;\n}',
        JS: '// Escreva a solução para o problema\nfunction solve() {\n  return true;\n}',
        PYTHON: '# Escreva a solução para o problema\ndef solve():\n    return True\n',
      },
      testCases: [
        {
          id: 't1',
          description: 'Validação da função',
          inputDisplay: 'solve()',
          expectedDisplay: 'true',
          testExpression: {
            TS: 'Boolean(solve()) === true',
            JS: 'Boolean(solve()) === true',
            PYTHON: 'bool(solve()) == True',
          },
        },
      ],
    };
  }, [initialDuel]);

  // Code state initialized with language starter code
  const langKey = (initialDuel.language?.toUpperCase() as 'TS' | 'JS' | 'PYTHON') || 'TS';
  const initialStarter =
    initialDuel.solutions?.find((s: any) => s.user_id === user.id)?.code ||
    problem.starters[langKey] ||
    problem.starters.TS;

  const [code, setCode] = useState(initialStarter);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [winnerUsername, setWinnerUsername] = useState('');
  const [opponentCode, setOpponentCode] = useState<string | undefined>(undefined);
  const [xpAwarded, setXpAwarded] = useState(0);

  useEffect(() => {
    const updateSoundState = () => {
      setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
    };
    updateSoundState();
    window.addEventListener('storage', updateSoundState);
    return () => window.removeEventListener('storage', updateSoundState);
  }, []);

  const { playSound } = useSoundEffects(soundEnabled);

  // Realtime hook
  const {
    presenceUsers,
    opponentState,
    duelPhase,
    countdownNumber,
    isSelfReady,
    sendReady,
    startCountdown,
    sendTyping,
    sendTestProgress,
    sendVictory,
    sendRematch,
    setDuelPhase,
  } = useDuelRealtime({
    duelId: duel.id,
    user,
    onOpponentWon: (data) => {
      setIsWinner(false);
      setWinnerUsername(data.winnerUsername || 'Oponente');
      setOpponentCode(data.code);
      setXpAwarded(20);
      setShowVictoryModal(true);
      playSound('quiz_incorrect');
    },
    onRematchOffer: () => {
      alert('Seu oponente pediu uma revanche!');
      setShowVictoryModal(false);
      setTestResults([]);
      setCode(problem.starters[langKey] || problem.starters.TS);
      setTimeLeft(300);
      setDuelPhase('waiting');
    },
  });

  // Countdown timer when battle is active
  useEffect(() => {
    if (duelPhase !== 'battle') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duelPhase]);

  // Auto-submit when time expires
  useEffect(() => {
    if (duelPhase === 'battle' && timeLeft === 0 && !isSubmitting && !showVictoryModal) {
      handleSubmitSolution();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, duelPhase]);

  // Typing heartbeat to opponent
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const lines = newCode.split('\n').length;
    sendTyping(lines);
  };

  // Run test cases
  const handleRunTests = async () => {
    if (isRunningTests || !code.trim()) return;
    setIsRunningTests(true);
    setConsoleOutput('');

    try {
      const harness = buildTestHarness(code, problem, duel.language);
      const res = await runCodeInSandbox(harness, duel.language);

      let parsedResults: TestResultItem[] = [];
      let cleanOutput = res.output || '';

      const startToken = '###TEST_RESULTS_START###';
      const endToken = '###TEST_RESULTS_END###';

      if (cleanOutput.includes(startToken) && cleanOutput.includes(endToken)) {
        const jsonStr = cleanOutput.substring(
          cleanOutput.indexOf(startToken) + startToken.length,
          cleanOutput.indexOf(endToken)
        );
        try {
          parsedResults = JSON.parse(jsonStr);
          cleanOutput = cleanOutput.replace(`${startToken}${jsonStr}${endToken}`, '').trim();
        } catch {
          // fallback
        }
      } else if (res.ok) {
        parsedResults = problem.testCases.map((tc) => ({
          id: tc.id,
          passed: true,
          desc: tc.description,
        }));
      }

      setTestResults(parsedResults);
      setConsoleOutput(cleanOutput || (res.error ? `Erro: ${res.error}` : 'Execução concluída.'));

      const passedCount = parsedResults.filter((r) => r.passed).length;
      sendTestProgress(passedCount, problem.testCases.length);

      if (passedCount === problem.testCases.length && problem.testCases.length > 0) {
        playSound('quiz_correct');
      } else {
        playSound('quiz_incorrect');
      }
    } catch (err: any) {
      console.error(err);
      setConsoleOutput(`Erro de execução: ${err.message || 'Falha ao executar os testes.'}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const allPassed =
    testResults.length > 0 &&
    testResults.length === problem.testCases.length &&
    testResults.every((r) => r.passed);

  // Submit solution & trigger victory
  const handleSubmitSolution = async () => {
    if (!code.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/duels/${duel.id}/solution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        const data = await res.json();
        const xpEarned = data.xpResult?.xpEarned ?? 50;

        setIsWinner(true);
        setWinnerUsername(user.username);
        setXpAwarded(xpEarned);
        setShowVictoryModal(true);
        playSound('levelup');

        // Broadcast victory event to opponent
        await sendVictory(code);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao submeter solução.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOpponentReady = opponentState.isReady;
  const isChallenger = duel.challenger_id === user.id;

  const me = {
    username: user.username,
    avatar_url: user.avatar_url,
  };

  // Determine opponent based on whether user is the challenger or opponent
  let opponentDisplay = null;
  if (isChallenger) {
    opponentDisplay =
      duel.opponent ||
      (opponentState.isConnected
        ? {
            username: opponentState.username || 'Oponente',
            avatar_url: opponentState.avatarUrl,
          }
        : null);
  } else {
    opponentDisplay = duel.challenger;
  }

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main className="flex min-h-screen w-full min-w-0 max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex-grow flex-col border-r border-dd-border/80 bg-dd-bg pb-24 md:pb-8">
          {/* Header Fixo */}
          <div className="sticky top-0 z-30 bg-dd-bg/95 backdrop-blur-md border-b border-dd-border/60 p-4 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <Link
                href="/duels"
                className="p-2 hover:bg-dd-surface rounded-full transition-colors text-dd-text cursor-pointer"
                title="Voltar à Arena"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-sm sm:text-base font-black text-dd-text flex items-center gap-2 truncate">
                  <Swords className="w-4 h-4 text-blue-500" />
                  {problem.title}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-dd-muted font-bold">
                  Duelo 1v1 em Tempo Real
                </p>
              </div>
            </div>

            {/* Ready / Start Action */}
            {duelPhase === 'waiting' && (
              <div className="flex items-center gap-2">
                {!isSelfReady ? (
                  <button
                    type="button"
                    onClick={sendReady}
                    className="dd-touch dd-focus-ring flex items-center gap-1.5 rounded-xl border-2 border-b-[3px] border-blue-600 border-b-blue-800 bg-blue-500 hover:bg-blue-400 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    <span>Estou Pronto!</span>
                    <Swords className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startCountdown}
                    className="dd-touch dd-focus-ring flex items-center gap-1.5 rounded-xl border-2 border-b-[3px] border-blue-600 border-b-blue-800 bg-blue-500 hover:bg-blue-400 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer animate-pulse"
                  >
                    <span>Iniciar Duelo!</span>
                    <Flame className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Countdown Overlay (3, 2, 1, DUELO!) */}
          {duelPhase === 'countdown' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
              <div className="text-center space-y-4 animate-bounce">
                <div className="text-7xl sm:text-9xl font-black text-blue-400 drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]">
                  {countdownNumber}
                </div>
                <p className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest">
                  Prepare-se para o Duelo!
                </p>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-6">
            {/* Live Versus Battle Header */}
            <DuelBattleHeader
              me={me}
              opponent={opponentDisplay}
              language={duel.language}
              difficulty={problem.difficulty}
              myTestsPassed={testResults.filter((r) => r.passed).length}
              myTotalTests={problem.testCases.length}
              opponentTestsPassed={opponentState.testsPassed}
              opponentTotalTests={opponentState.totalTests}
              opponentIsTyping={opponentState.isTyping}
              timeLeft={timeLeft}
              isDuelActive={duelPhase === 'battle'}
            />

            {/* Problem Description Card (Duolingo 3D) */}
            <div className="rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-surface/80 p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2 border-b border-dd-border/60 pb-2.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-dd-text">
                  Objetivo do Desafio
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-dd-muted leading-relaxed font-sans">
                {problem.description}
              </p>
            </div>

            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-dd-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Editor de Solução ({duel.language})
                </label>
                {opponentState.isTyping && (
                  <span className="text-[11px] font-bold text-blue-400 animate-pulse">
                    Oponente está programando...
                  </span>
                )}
              </div>

              <div className="rounded-2xl border-2 border-b-4 border-dd-border overflow-hidden shadow-xl">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  language={duel.language.toLowerCase()}
                  height="280px"
                />
              </div>
            </div>

            {/* Interactive Test Suite & Duolingo 3D Actions */}
            <DuelTestRunner
              testCases={problem.testCases}
              testResults={testResults}
              isRunning={isRunningTests}
              isSubmitting={isSubmitting}
              consoleOutput={consoleOutput}
              onRunTests={handleRunTests}
              onSubmitSolution={handleSubmitSolution}
              allPassed={allPassed}
            />
          </div>
        </main>
      </div>

      {/* Victory / Defeat Modal */}
      <DuelVictoryModal
        isOpen={showVictoryModal}
        isWinner={isWinner}
        winnerUsername={winnerUsername}
        xpAwarded={xpAwarded}
        streak={user.streak ?? 1}
        myCode={code}
        opponentCode={opponentCode}
        onRematch={() => {
          sendRematch();
        }}
        onClose={() => setShowVictoryModal(false)}
      />
    </div>
  );
}
