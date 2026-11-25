'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { isKlipyMediaUrl } from '@/lib/klipy';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Developer {
  id: string;
  username: string;
  avatar_url?: string | null;
  level: number;
  mainLanguage: string;
  totalXP: number;
}

interface ExploreGridProps {
  developers: Developer[];
  filter?: string | null;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f5a623',
  TypeScript: '#3178c6',
  Python: '#5ba3f5',
  Rust: '#0083fe',
  Go: '#22d48a',
  'C++': '#f59e0b',
  Java: '#ef4444',
  Kotlin: '#7f52ff',
  Swift: '#f05138',
};

export function ExploreGrid({ developers, filter }: ExploreGridProps) {
  const reduced = useReducedMotion();

  const filteredDevelopers = filter
    ? developers.filter((dev) => dev.mainLanguage === filter)
    : developers;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredDevelopers.map((dev, index) => (
        <motion.div
          key={dev.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          className={cn(
            'explore-card border border-dd-border rounded-xl p-4 cursor-pointer transition-all',
            !reduced && 'hover:scale-[1.02] hover:border-dd-accent'
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            {dev.avatar_url ? (
              <Image
                src={dev.avatar_url}
                alt={dev.username}
                width={48}
                height={48}
                unoptimized={isKlipyMediaUrl(dev.avatar_url)}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                {dev.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-dd-text">{dev.username}</h3>
              <p className="text-xs text-dd-muted">Nível {dev.level}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${LANGUAGE_COLORS[dev.mainLanguage] || '#0083fe'}20`,
                color: LANGUAGE_COLORS[dev.mainLanguage] || '#0083fe',
              }}
            >
              {dev.mainLanguage}
            </span>
          </div>

          <p className="text-xs text-dd-accent font-mono">{dev.totalXP.toLocaleString()} XP</p>
        </motion.div>
      ))}
    </div>
  );
}
