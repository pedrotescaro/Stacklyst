'use client';

import { MessageCircle } from 'lucide-react';
import { AnswerCard } from '@/components/AnswerCard';
import type { AnswerNode } from '@/components/answer-types';

interface AnswerThreadProps {
  answers: AnswerNode[];
  isPostAuthor: boolean;
  currentUser?: { id?: string; username: string; avatar_url?: string | null };
  postId: string;
  onAccept?: (id: string) => void;
  /** Called when any answer (top-level or nested) is created. Receives the parent answer id (null for top-level) and the new answer node. */
  onAnswerAdded?: (parentAnswerId: string | null, newAnswer: AnswerNode) => void;
  /** Called after the signed-in author deletes one of their answers. */
  onAnswerDeleted?: (id: string) => void;
}

/**
 * Recursively counts every answer in a tree (top-level + all nested replies).
 * Used for the "Respostas (N)" header so the total reflects the whole thread.
 */
export function countAnswers(answers: AnswerNode[]): number {
  return answers.reduce((total, answer) => {
    const childCount = answer.replies ? countAnswers(answer.replies) : 0;
    return total + 1 + childCount;
  }, 0);
}

/**
 * Removes an answer from the tree the way the server does: its replies move up
 * to its parent, in its place, instead of disappearing with it.
 */
export function removeAnswerFromTree(answers: AnswerNode[], id: string): AnswerNode[] {
  return answers.flatMap((answer) => {
    if (answer.id === id)
      return (answer.replies ?? []).map((reply) => ({ ...reply, parent_id: answer.parent_id }));
    return answer.replies?.length
      ? [{ ...answer, replies: removeAnswerFromTree(answer.replies, id) }]
      : [answer];
  });
}

export function AnswerThread({
  answers,
  isPostAuthor,
  currentUser,
  postId,
  onAccept,
  onAnswerAdded,
  onAnswerDeleted,
}: AnswerThreadProps) {
  const totalAnswers = countAnswers(answers);

  return (
    <div className="flex flex-col bg-transparent">
      <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-dd-border/50">
        <MessageCircle className="w-4.5 h-4.5 text-blue-500/85" />
        <h2 className="text-sm font-extrabold text-dd-text">Respostas ({totalAnswers})</h2>
      </div>

      {answers.length === 0 ? (
        <div className="p-8 text-center text-dd-muted text-xs border-b border-dd-border/50">
          Nenhuma resposta publicada ainda. Seja o primeiro a ajudar o autor!
        </div>
      ) : (
        <div className="flex flex-col">
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              depth={0}
              isPostAuthor={isPostAuthor}
              onAccept={onAccept}
              currentUser={currentUser}
              postId={postId}
              onAnswerAdded={onAnswerAdded}
              onAnswerDeleted={onAnswerDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
