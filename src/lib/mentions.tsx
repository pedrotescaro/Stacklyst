import { mentionPattern } from './mention-text';
import Link from 'next/link';
import React from 'react';

export function parseMentions(text: string) {
  if (!text) return '';

  const parts = text.split(mentionPattern);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const username = part;
      return (
        <Link
          key={index}
          href={`/profile/${username}`}
          className="text-blue-500 hover:underline font-semibold"
          onClick={(e) => e.stopPropagation()}
        >
          {'@' + username}
        </Link>
      );
    }
    return part;
  });
}
