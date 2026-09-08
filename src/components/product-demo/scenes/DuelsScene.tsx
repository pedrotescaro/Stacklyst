import { Swords, Play, Zap } from 'lucide-react';
import { DuelBattleHeader } from '@/components/duels/DuelBattleHeader';
import { LanguageTag } from '@/components/LanguageTag';

export function DuelsScene({ phase }: { phase: number }) {
  return (
    <div>
      <div className="demo-scene-header">
        <strong className="flex items-center gap-2">
          <Swords size={20} className="text-blue-500" />
          Arena de Duelos 1v1
        </strong>
        <span className="demo-post-button">+ Criar Duelo</span>
      </div>
      <div className="p-6 space-y-6">
        <div className="rounded-[26px] border-2 border-b-4 border-blue-500/30 border-b-blue-600/80 bg-gradient-to-b from-blue-500/10 to-dd-surface p-6 space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 text-[10px] font-black uppercase text-blue-400">
            <Zap size={12} />
            Fila rápida 1v1
          </span>
          <h2 className="text-2xl font-black">Enfrente um Desenvolvedor Agora</h2>
          <p className="text-xs text-dd-muted">
            Resolva algoritmos sob pressão em tempo real, passe nos testes e conquiste +50 XP e
            posições no ranking!
          </p>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase text-dd-muted">
              Escolha a Linguagem do Duelo:
            </p>
            <div className="flex gap-2">
              {['TypeScript', 'Python', 'JavaScript'].map((l, i) => (
                <span
                  key={l}
                  className={`rounded-xl border-2 border-b-[3px] px-3 py-2 text-xs font-black ${i === 0 ? 'border-blue-500 border-b-blue-700 bg-blue-500' : 'border-dd-border text-dd-muted'}`}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-blue-600 border-b-blue-800 bg-blue-500 py-4 text-sm font-black">
            <Play size={18} fill="currentColor" />
            {phase === 1
              ? 'Buscando oponente na arena...'
              : phase === 2
                ? 'Oponente encontrado'
                : 'Entrar na fila rápida 1v1'}
          </div>
        </div>
        {phase === 2 ? (
          <div className="space-y-4">
            <DuelBattleHeader
              me={{ username: 'user' }}
              opponent={{ username: 'user_02' }}
              language="TS"
              myTestsPassed={0}
              myTotalTests={3}
              opponentTestsPassed={0}
              opponentTotalTests={3}
              timeLeft={300}
              isDuelActive
            />
            <div className="demo-code p-5">
              <strong>FizzBuzz</strong>
              <pre>
                {
                  'function fizzBuzz(): string[] {\n  const result: string[] = [];\n  // Sua solução aqui\n  return result;\n}'
                }
              </pre>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-black">Duelos Abertos da Comunidade</h3>
            <div className="rounded-[24px] border-2 border-b-4 border-dd-border bg-dd-surface p-5">
              <LanguageTag language="TS" size="sm" />
              <h4 className="mt-4 font-bold">FizzBuzz</h4>
              <p className="mt-2 text-xs text-dd-muted">
                Resolva o desafio e coloque suas habilidades à prova.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
