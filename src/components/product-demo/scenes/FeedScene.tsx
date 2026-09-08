import { motion, useTransform, type MotionValue } from 'framer-motion';
import {
  Image,
  Smile,
  Calendar,
  MapPin,
  Flag,
  Play,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { LevelBadge } from '@/components/LevelBadge';
import { LanguageTag } from '@/components/LanguageTag';
import { smooth } from '../timeline';

// Read-only projection of FeedContent/PostCard and its executable code block.
// Fictional identities and local-only publishing feedback; no network actions.
export function FeedScene({ time }: { time: MotionValue<number> }) {
  const output = useTransform(time, (t) => smooth(4.8, 5.1, t) * (1 - smooth(6, 6.7, t)));
  const press = useTransform(
    time,
    (t) => 1 - 0.035 * (smooth(4.4, 4.55, t) - smooth(4.55, 4.75, t))
  );
  const message = 'Meu primeiro projeto em Python está pronto!';
  const typed = useTransform(time, (t) =>
    t < 2 || t >= 3.4
      ? 'O que você está construindo hoje?'
      : message.slice(0, Math.floor(message.length * smooth(2, 3.15, t)))
  );
  const published = useTransform(time, (t) => smooth(3.4, 3.75, t) * (1 - smooth(6, 6.7, t)));
  const feedY = useTransform(published, (p) => p * 130);
  const postScale = useTransform(
    time,
    (t) => 1 - 0.04 * (smooth(3.2, 3.35, t) - smooth(3.35, 3.5, t))
  );
  const postOpacity = useTransform(time, (t) => (t >= 2 && t < 3.4 ? 1 : 0.5));
  return (
    <div>
      <div className="demo-feed-tabs">
        <strong>Para você</strong>
        <span>Seguindo</span>
      </div>
      <div className="demo-compose">
        <div className="flex items-center gap-3">
          <AuthorAvatar username="user" />
          <motion.span className="text-dd-muted">{typed}</motion.span>
        </div>
        <div className="mt-5 flex items-center justify-between pl-12">
          <div className="flex gap-5 text-blue-500">
            {[Image, Smile, Calendar, MapPin, Flag].map((Icon) => (
              <Icon key={Icon.displayName} size={18} />
            ))}
          </div>
          <motion.span
            className="demo-post-button"
            style={{ scale: postScale, opacity: postOpacity }}
          >
            Postar
          </motion.span>
        </div>
      </div>
      <div className="relative">
        <motion.article
          className="demo-post absolute inset-x-0 top-0"
          style={{ opacity: published }}
        >
          <div className="flex items-center gap-2">
            <AuthorAvatar username="user" />
            <strong className="text-xs">user</strong>
            <LevelBadge totalXp={4250} />
            <span className="text-[10px] text-dd-muted">Agora</span>
          </div>
          <p className="my-4 text-sm">{message}</p>
          <div className="pb-4 text-[10px] text-blue-400">Publicado</div>
        </motion.article>
        <motion.div style={{ y: feedY }}>
          <article className="demo-post">
            <div className="flex items-center gap-2">
              <AuthorAvatar username="user" />
              <strong className="text-xs">user</strong>
              <span className="text-[10px] text-dd-muted">@user</span>
              <LevelBadge totalXp={20} />
              <div className="ml-auto">
                <LanguageTag language="PYTHON" size="sm" />
              </div>
            </div>
            <div className="demo-code mt-6">
              <div className="demo-code-header">
                <span>PYTHON</span>
                <div className="flex items-center gap-3">
                  <motion.span style={{ scale: press }} className="demo-run">
                    <Play size={12} fill="currentColor" /> Executar
                  </motion.span>
                  <span>Copiar</span>
                </div>
              </div>
              <pre>
                <span className="text-blue-400">print</span>(
                <span className="text-emerald-400">&quot;hello world&quot;</span>)
              </pre>
              <motion.div className="demo-output" style={{ opacity: output }}>
                › hello world <span>Processo concluído</span>
              </motion.div>
            </div>
            <PostActions likes={1} />
          </article>
          <article className="demo-post">
            <div className="flex items-center gap-2">
              <AuthorAvatar username="user" />
              <strong className="text-xs">user</strong>
              <LevelBadge totalXp={20} />
            </div>
            <p className="my-7 text-sm">Compartilhando meus primeiros passos com a comunidade.</p>
            <PostActions likes={0} />
          </article>
          <article className="demo-post">
            <div className="flex items-center gap-2">
              <AuthorAvatar username="user" />
              <strong className="text-xs">user</strong>
              <LevelBadge totalXp={4250} />
              <div className="ml-auto">
                <LanguageTag language="TS" size="sm" />
              </div>
            </div>
            <p className="mt-5 text-sm leading-6">
              Hoje pratiquei componentes e compartilhei uma nova solução em TypeScript.
            </p>
            <PostActions likes={1} />
          </article>
        </motion.div>
      </div>
    </div>
  );
}
function PostActions({ likes }: { likes: number }) {
  return (
    <div className="demo-post-actions">
      <MessageCircle size={17} />
      <Repeat2 size={17} />
      <span className={likes ? 'text-pink-500 flex gap-2' : 'flex gap-2'}>
        <Heart size={17} fill={likes ? 'currentColor' : 'none'} />
        {likes}
      </span>
      <Bookmark size={17} />
      <Share2 size={16} />
      <MoreHorizontal size={17} />
    </div>
  );
}
