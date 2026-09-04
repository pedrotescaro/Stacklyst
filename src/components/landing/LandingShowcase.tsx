'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bookmark,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Columns2,
  Crown,
  Flame,
  Flag,
  GitBranch,
  Heart,
  Home,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Plus,
  RotateCw,
  Search,
  Share2,
  ShieldCheck,
  Smile,
  Sparkles,
  Swords,
  Terminal,
  Trophy,
  User,
  Users2,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { animate, createScope, stagger } from 'animejs';
import NextImage from 'next/image';
import Aurora from '@/components/Aurora';
import { BentoGrid } from '@/components/ui/bento-grid';
import { BorderBeam } from '@/components/ui/border-beam';
import { ParticleCard, GlobalSpotlight, useMobileDetection } from '@/components/ui/MagicBento';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { RetweetIcon } from '@/components/motion/RepostMenu';
import { LevelBadge } from '@/components/LevelBadge';
import { LanguageTag } from '@/components/LanguageTag';

interface LandingShowcaseProps {
  initialUser: unknown;
  forceMotion?: boolean;
}

const cardClass =
  'relative overflow-hidden rounded-[26px] border-2 border-b-4 border-white/10 bg-[#0d0d0f] shadow-[0_24px_60px_-25px_rgba(0,0,0,0.85)] transition-all duration-200 hover:border-white/20';

function SectionHeading({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  nowrap = true,
}: {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: ReactNode;
  description: string;
  nowrap?: boolean;
}) {
  return (
    <div
      data-reveal
      className="mx-auto mb-12 flex max-w-5xl flex-col items-center text-center gap-5 px-1 sm:mb-16 sm:px-0 lg:mb-20"
    >
      {badge && (
        <div className="inline-flex items-center gap-2 rounded-xl border-2 border-b-[3px] border-blue-500/40 border-b-blue-600 bg-blue-500/15 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-blue-400 shadow-sm transition-transform hover:scale-105">
          {BadgeIcon && <BadgeIcon className="size-3.5 shrink-0" />}
          <span>{badge}</span>
        </div>
      )}
      <h2
        className={cn(
          'font-black text-2xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[54px] tracking-[-0.03em] leading-tight text-white',
          nowrap && 'md:whitespace-nowrap'
        )}
      >
        {title}
      </h2>
      <p className="max-w-2xl pt-1 text-base sm:text-lg leading-relaxed text-zinc-300 font-normal">
        {description}
      </p>
    </div>
  );
}

function FlowPreview() {
  const { t } = useLanguage();
  const nodes = [
    {
      icon: MessageSquareText,
      label: t.showcase.howItWorks.flowCard.node1,
      value: t.showcase.howItWorks.flowCard.node1Val,
    },
    {
      icon: BookOpen,
      label: t.showcase.howItWorks.flowCard.node2,
      value: t.showcase.howItWorks.flowCard.node2Val,
    },
    {
      icon: Zap,
      label: t.showcase.howItWorks.flowCard.node3,
      value: t.showcase.howItWorks.flowCard.node3Val,
    },
  ];

  return (
    <div className="absolute inset-x-5 top-5 grid gap-3 sm:inset-x-8 sm:top-8">
      {nodes.map((node, index) => {
        const Icon = node.icon;
        return (
          <div
            key={node.label}
            className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition-colors hover:border-blue-400/40 hover:bg-blue-400/[0.07]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{node.label}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                {node.value}
              </p>
            </div>
            <span className="font-mono text-[10px] text-blue-400">0{index + 1}</span>
            {index < nodes.length - 1 && (
              <span className="absolute -bottom-4 left-9 h-4 w-px bg-gradient-to-b from-blue-400/60 to-transparent" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuizPreview() {
  const { t } = useLanguage();
  return (
    <div className="absolute inset-x-5 top-5 rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-violet-400/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-violet-300">
          {t.showcase.howItWorks.quizCard.sourceLabel}
        </span>
        <BookOpen size={18} className="text-violet-300" />
      </div>
      <p className="text-sm font-medium leading-6 text-slate-200">
        {t.showcase.howItWorks.quizCard.question}
      </p>
      <div className="mt-4 grid gap-2">
        {[
          t.showcase.howItWorks.quizCard.optionA,
          t.showcase.howItWorks.quizCard.optionB,
          t.showcase.howItWorks.quizCard.optionC,
        ].map((option, index) => (
          <div
            key={option}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs',
              index === 0
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'border-white/8 bg-white/[0.02] text-slate-500'
            )}
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-current/30 font-mono text-[9px]">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricsPreview() {
  const { t } = useLanguage();
  return (
    <div className="absolute inset-x-5 top-5 grid grid-cols-2 gap-3">
      {[
        [t.showcase.howItWorks.communityCard.contributions, '148'],
        [t.showcase.howItWorks.communityCard.accepted, '62'],
        [t.showcase.howItWorks.communityCard.badges, '18'],
        [t.showcase.howItWorks.communityCard.streak, '12d'],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function HistoryPreview() {
  const { t } = useLanguage();
  return (
    <div className="absolute inset-x-5 top-5 space-y-2.5">
      <div className="flex items-center justify-between rounded-xl border border-blue-400/20 bg-blue-500/10 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <BadgeCheck size={16} className="text-blue-400" />
          <span className="font-semibold text-white">
            {t.showcase.howItWorks.proofCard.duelWon}
          </span>
        </div>
        <span className="font-mono text-[9px] text-blue-300">+100 ELO</span>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="font-semibold text-white">
            {t.showcase.howItWorks.proofCard.trackCompleted}
          </span>
        </div>
        <span className="font-mono text-[9px] text-emerald-300">
          {t.showcase.howItWorks.proofCard.level19}
        </span>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-violet-400/20 bg-violet-500/10 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          <span className="font-semibold text-white">
            {t.showcase.howItWorks.proofCard.streak12}
          </span>
        </div>
        <span className="font-mono text-[9px] text-violet-300">+45 XP</span>
      </div>
    </div>
  );
}

function FeatureCard({
  className,
  icon: Icon,
  label,
  title,
  description,
  preview,
  beam,
}: {
  className?: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  preview: ReactNode;
  beam?: boolean;
}) {
  const isMobile = useMobileDetection();
  return (
    <ParticleCard
      data-reveal=""
      disableAnimations={isMobile}
      particleCount={14}
      glowColor="0, 131, 254"
      enableTilt={true}
      clickEffect={true}
      enableMagnetism={true}
      className={cn(
        cardClass,
        'magic-bento-card magic-bento-card--border-glow group min-h-[22rem]',
        className
      )}
      style={
        {
          backgroundColor: '#080808',
          '--glow-color': '0, 131, 254',
        } as React.CSSProperties
      }
    >
      <div className="h-full w-full">
        <div className="absolute inset-0 opacity-90">{preview}</div>
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#080808] via-[#080808]/95 to-transparent px-6 pb-6 pt-24 sm:px-7">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border-2 border-b-[2.5px] border-blue-500/30 border-b-blue-600 bg-blue-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-400">
            <Icon size={12} /> {label}
          </div>
          <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl">{title}</h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-300 font-normal">
            {description}
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_45%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
        {beam && (
          <BorderBeam
            duration={9}
            size={130}
            borderWidth={1.2}
            colorFrom="#0083fe"
            colorTo="#60a5fa"
          />
        )}
      </div>
    </ParticleCard>
  );
}

function PlatformMockup() {
  const [activeNav, setActiveNav] = useState('home');
  const [activeFeedTab, setActiveFeedTab] = useState<'foryou' | 'following'>('foryou');
  const [likesPost1, setLikesPost1] = useState(1);
  const [hasLikedPost1, setHasLikedPost1] = useState(true);
  const [likesPost2, setLikesPost2] = useState(0);
  const [hasLikedPost2, setHasLikedPost2] = useState(false);
  const [savedPost1, setSavedPost1] = useState(false);
  const [savedPost2, setSavedPost2] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [userPosts, setUserPosts] = useState<Array<{ id: number; text: string; time: string }>>([]);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarNavItems = [
    { id: 'home', label: 'Página Inicial', icon: Home, hasDot: true },
    { id: 'trails', label: 'Trilhas', icon: BookOpen },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'chat', label: 'Bate-papo', icon: MessageCircle },
    { id: 'bookmarks', label: 'Itens salvos', icon: Bookmark },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'more', label: 'Mais', icon: MoreHorizontal },
  ];

  const handlePost = () => {
    if (!composerText.trim()) return;
    setUserPosts((prev) => [
      { id: Date.now(), text: composerText, time: 'Postado agora' },
      ...prev,
    ]);
    setComposerText('');
  };

  const handleRunCode = () => {
    if (isRunningCode) return;
    setIsRunningCode(true);
    setCodeOutput(null);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeOutput('hello world');
    }, 500);
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border-2 border-b-4 border-white/10 bg-[#000000] font-sans text-xs text-white shadow-2xl shadow-black/80 md:rounded-[24px] md:h-[620px]">
      <div className="grid grid-cols-1 md:h-full md:grid-cols-[210px_1fr] lg:grid-cols-[230px_1fr_310px]">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="hidden border-r border-white/10 bg-[#000000] p-4 md:flex md:flex-col md:justify-between h-full">
          <div className="space-y-3">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex items-center justify-center size-8 rounded-xl bg-black border border-white/15 shadow-sm">
                <NextImage
                  src="/logo.svg"
                  alt="Stacklyst"
                  width={22}
                  height={22}
                  className="size-5 object-contain"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-white">Stacklyst</span>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-0.5">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={cn(
                      'flex items-center gap-4 w-full px-4 py-2.5 text-[14px] transition-all text-left rounded-2xl cursor-pointer',
                      isActive
                        ? 'bg-[#18181b] text-white font-bold shadow-sm'
                        : 'text-[#94a3b8] hover:text-white hover:bg-white/5 font-semibold'
                    )}
                  >
                    <div className="relative flex items-center justify-center size-5 shrink-0">
                      <Icon
                        size={20}
                        className={isActive ? 'text-white fill-white' : 'text-[#94a3b8]'}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.hasDot && (
                        <span className="absolute -top-1 -right-1 block size-2 rounded-full bg-[#1d9bf0]" />
                      )}
                    </div>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Large Blue Postar Button */}
            <button
              onClick={handlePost}
              className="w-full rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-black py-3 px-6 text-[15px] flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer mt-1"
            >
              Postar
            </button>
          </div>

          {/* User Profile Card (Bottom Left) */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between px-2 cursor-pointer hover:bg-white/5 rounded-2xl p-2 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-full bg-slate-900 border border-white/20 overflow-hidden flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                US
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-[14px] truncate leading-tight">User</p>
                <p className="text-xs font-semibold text-slate-500 truncate leading-none mt-0.5">
                  @user
                </p>
              </div>
            </div>
            <MoreHorizontal size={18} className="text-slate-500 shrink-0" />
          </div>
        </aside>

        {/* ================= CENTER FEED ================= */}
        <main className="flex min-w-0 h-full flex-col bg-[#000000] lg:border-r lg:border-white/10 relative overflow-hidden">
          {/* Mobile app header */}
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-4 md:hidden shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-xl bg-blue-500/15 border-2 border-b-[3px] border-blue-500/40">
                <NextImage
                  src="/logo.svg"
                  alt="Stacklyst"
                  width={18}
                  height={18}
                  className="size-4 object-contain"
                />
              </div>
              <span className="text-base font-black tracking-tight text-white">Stacklyst</span>
            </div>
            <div className="size-8 rounded-xl bg-slate-900 border-2 border-b-[3px] border-white/20 flex items-center justify-center text-xs font-black text-white">
              US
            </div>
          </div>

          {/* Feed Header Tabs */}
          <div className="relative flex items-center border-b border-white/10 h-13 bg-[#000000]/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
            <div className="grid grid-cols-2 w-full h-full pr-12">
              <button
                onClick={() => setActiveFeedTab('foryou')}
                className={cn(
                  'h-full flex items-center justify-center font-black text-xs relative transition-colors cursor-pointer',
                  activeFeedTab === 'foryou' ? 'text-white' : 'text-[#71767b] hover:text-slate-300'
                )}
              >
                <span>Para você</span>
                {activeFeedTab === 'foryou' && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] rounded-full bg-[#1d9bf0]" />
                )}
              </button>
              <button
                onClick={() => setActiveFeedTab('following')}
                className={cn(
                  'h-full flex items-center justify-center font-black text-xs relative transition-colors cursor-pointer',
                  activeFeedTab === 'following'
                    ? 'text-white'
                    : 'text-[#71767b] hover:text-slate-300'
                )}
              >
                <span>Seguindo</span>
                {activeFeedTab === 'following' && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] rounded-full bg-[#1d9bf0]" />
                )}
              </button>
            </div>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5 cursor-pointer">
              <RotateCw size={14} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-3 sm:p-5">
            {/* Post Composer Box */}
            <div className="border-b border-white/10 pb-4 space-y-3">
              <div className="flex gap-3">
                <div className="size-10 rounded-2xl bg-slate-900 border-2 border-b-[3px] border-white/20 flex items-center justify-center font-black text-xs text-white shrink-0">
                  US
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder="O que você está construindo hoje?"
                    className="w-full bg-transparent text-sm text-white placeholder:text-[#555a60] outline-none pt-1 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-blue-500 pl-13">
                  <ImageIcon
                    size={18}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <Smile size={18} className="cursor-pointer hover:opacity-80 transition-opacity" />
                  <Calendar
                    size={18}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <MapPin
                    size={18}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <Flag size={18} className="cursor-pointer hover:opacity-80 transition-opacity" />
                </div>
                <button
                  onClick={handlePost}
                  disabled={!composerText.trim()}
                  className={cn(
                    'px-5 py-2 rounded-xl font-black text-xs text-white transition-all border-2 border-b-4',
                    composerText.trim()
                      ? 'bg-blue-500 hover:bg-blue-400 border-blue-600 border-b-blue-800 shadow-md shadow-blue-500/20 active:translate-y-0.5 active:border-b-2 cursor-pointer'
                      : 'bg-blue-500/40 border-blue-600/40 border-b-blue-800/40 text-white/50 cursor-not-allowed'
                  )}
                >
                  Postar
                </button>
              </div>
            </div>

            {/* Dynamic User Posted Cards */}
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="border-b border-white/10 pb-4 space-y-3 animate-slide-down"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-2xl bg-slate-900 border-2 border-b-[3px] border-white/20 flex items-center justify-center font-bold text-xs text-white shrink-0">
                      US
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">User</span>
                        <span className="text-slate-500 text-[11px]">@user</span>
                        <LevelBadge totalXp={0} className="text-[9px]" />
                      </div>
                      <span className="text-slate-500 text-[10px] block">{post.time}</span>
                    </div>
                  </div>
                  <MoreHorizontal size={14} className="text-slate-500" />
                </div>
                <p className="text-xs text-slate-200">{post.text}</p>
              </div>
            ))}

            {/* Post 1: Python Code + Gamified Challenge (Duolingo Style) */}
            <div className="border-b border-white/10 pb-5 space-y-3.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-blue-500/20 border-2 border-b-[3px] border-blue-400/40 flex items-center justify-center font-black text-xs text-blue-400 shrink-0">
                    US
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-white text-sm">User</span>
                      <span className="text-xs text-slate-500 font-medium">@user</span>
                      <LevelBadge totalXp={0} className="text-[9px]" />
                    </div>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Postado 13d atrás
                    </span>
                  </div>
                </div>
                <LanguageTag language="PYTHON" size="sm" />
              </div>

              {/* Code Box */}
              <div className="rounded-2xl border-2 border-b-4 border-white/10 bg-[#080808] overflow-hidden shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-[#121212]">
                  <span className="font-mono text-[11px] font-black tracking-wider text-slate-400">
                    PYTHON
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunCode}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-500 hover:bg-blue-400 border-2 border-b-[3px] border-blue-600 border-b-blue-800 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer active:translate-y-0.5 active:border-b-2"
                    >
                      <Play size={12} className="fill-white" />
                      <span>{isRunningCode ? 'Executando...' : 'Executar'}</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer">
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 font-mono text-xs text-slate-200 bg-[#060606]">
                  <code>
                    <span className="text-blue-400">print</span>
                    <span className="text-slate-400">(</span>
                    <span className="text-emerald-400">&quot;hello world&quot;</span>
                    <span className="text-slate-400">)</span>
                  </code>
                </div>
                {codeOutput && (
                  <div className="border-t border-white/10 p-3 bg-black font-mono text-[11px] text-emerald-400 animate-slide-up">
                    <span className="text-slate-500 text-[10px]">{'// Saída do terminal:'}</span>
                    <p className="mt-0.5 text-white font-bold">{codeOutput}</p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between text-slate-500 text-xs pt-1 px-1">
                <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors cursor-pointer">
                  <MessageSquareText size={16} /> <span>0</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer">
                  <RetweetIcon className="size-4" /> <span>0</span>
                </button>
                <button
                  onClick={() => {
                    setHasLikedPost1(!hasLikedPost1);
                    setLikesPost1((prev) => (hasLikedPost1 ? prev - 1 : prev + 1));
                  }}
                  className={cn(
                    'flex items-center gap-1.5 transition-colors cursor-pointer',
                    hasLikedPost1 ? 'text-rose-500' : 'hover:text-rose-500'
                  )}
                >
                  <Heart size={16} className={hasLikedPost1 ? 'fill-rose-500 text-rose-500' : ''} />
                  <span className="font-bold">{likesPost1}</span>
                </button>
                <button
                  onClick={() => setSavedPost1(!savedPost1)}
                  className={cn(
                    'transition-colors hover:text-[#1d9bf0] cursor-pointer',
                    savedPost1 && 'text-[#1d9bf0]'
                  )}
                >
                  <Bookmark size={16} className={savedPost1 ? 'fill-[#1d9bf0]' : ''} />
                </button>
                <button className="hover:text-[#1d9bf0] transition-colors cursor-pointer">
                  <Share2 size={16} />
                </button>
                <button className="hover:text-slate-300 transition-colors cursor-pointer">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Post 2: Simple Discussion Post */}
            <div className="border-b border-white/10 pb-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-blue-500/20 border-2 border-b-[3px] border-blue-400/40 flex items-center justify-center font-black text-xs text-blue-400 shrink-0">
                    US
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-white text-sm">User</span>
                      <span className="text-xs text-slate-500 font-medium">@user</span>
                      <LevelBadge totalXp={0} className="text-[9px]" />
                    </div>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Postado 13d atrás
                    </span>
                  </div>
                </div>
                <MoreHorizontal size={16} className="text-slate-500" />
              </div>

              <p className="text-sm text-slate-200 font-medium pt-1">Oi sou novo na plataforma</p>

              {/* Action Bar */}
              <div className="flex items-center justify-between text-slate-500 text-xs pt-1 px-1">
                <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors cursor-pointer">
                  <MessageSquareText size={16} /> <span>0</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer">
                  <RetweetIcon className="size-4" /> <span>0</span>
                </button>
                <button
                  onClick={() => {
                    setHasLikedPost2(!hasLikedPost2);
                    setLikesPost2((prev) => (hasLikedPost2 ? prev - 1 : prev + 1));
                  }}
                  className={cn(
                    'flex items-center gap-1.5 transition-colors cursor-pointer',
                    hasLikedPost2 ? 'text-rose-500' : 'hover:text-rose-500'
                  )}
                >
                  <Heart size={16} className={hasLikedPost2 ? 'fill-rose-500 text-rose-500' : ''} />
                  <span className="font-bold">{likesPost2}</span>
                </button>
                <button
                  onClick={() => setSavedPost2(!savedPost2)}
                  className={cn(
                    'transition-colors hover:text-[#1d9bf0] cursor-pointer',
                    savedPost2 && 'text-[#1d9bf0]'
                  )}
                >
                  <Bookmark size={16} className={savedPost2 ? 'fill-[#1d9bf0]' : ''} />
                </button>
                <button className="hover:text-[#1d9bf0] transition-colors cursor-pointer">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Floating Action Button for Mobile */}
          <div className="md:hidden absolute bottom-16 right-4 z-20">
            <button
              onClick={() => {
                const el = document.querySelector(
                  'input[placeholder*="construindo"]'
                ) as HTMLInputElement;
                el?.focus();
              }}
              className="size-12 rounded-2xl border-2 border-b-4 border-blue-600 border-b-blue-800 bg-blue-500 text-white shadow-xl shadow-blue-500/40 flex items-center justify-center font-black text-2xl active:translate-y-0.5 active:border-b-2 transition-transform cursor-pointer"
            >
              <Plus size={24} className="stroke-[3]" />
            </button>
          </div>

          {/* Mobile app bottom navigation */}
          <nav
            aria-label="App navigation"
            className="grid grid-cols-5 border-t border-white/10 bg-[#050505]/95 px-2 py-2 backdrop-blur-md md:hidden"
          >
            {[
              { id: 'home', icon: Home, active: activeNav === 'home' },
              { id: 'trails', icon: BookOpen, active: activeNav === 'trails' },
              { id: 'duels', icon: Wand2, active: activeNav === 'duels' },
              { id: 'notifications', icon: Bell, active: activeNav === 'notifications' },
              { id: 'profile', icon: User, active: activeNav === 'profile' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  className="flex flex-col items-center justify-center py-1 relative text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Icon size={20} className={item.active ? 'text-white' : 'text-slate-400'} />
                  {item.active && <span className="size-1.5 rounded-full bg-blue-500 mt-1" />}
                </button>
              );
            })}
          </nav>
        </main>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="hidden lg:flex lg:flex-col h-full border-l border-white/10 p-4 space-y-3.5 bg-[#000000] overflow-hidden relative">
          {/* Search Box (3D Style) */}
          <div className="relative flex items-center rounded-2xl bg-[#0d0d0d] border-2 border-b-4 border-white/10 px-4 py-2 text-xs text-slate-400 focus-within:border-blue-500 focus-within:border-b-blue-700 transition-all shadow-md shrink-0">
            <Search size={15} className="mr-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar"
              className="w-full bg-transparent text-white placeholder:text-slate-500 outline-none text-xs font-medium"
            />
          </div>

          {/* CARD 1: RITMO STACKLYST (Duolingo 3D Style) */}
          <div className="rounded-[24px] border-2 border-b-4 border-white/10 bg-[#0d0d0d] p-4 space-y-3 shadow-xl shrink-0">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl border-2 border-b-[3px] border-blue-600 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                RITMO STACKLYST
              </span>
              <div className="size-10 rounded-2xl border-2 border-b-4 border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400 shadow-sm">
                <Flame size={20} className="text-orange-400 fill-orange-400/30" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black text-white tracking-tight">1 dia de ofensiva</h4>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                Faça uma atividade hoje pra aumentar a sua ofensiva!
              </p>
            </div>

            {/* Weekday indicator row (3D Bubbles) */}
            <div className="flex items-center justify-between pt-1">
              {[
                { day: 'D', checked: true, current: false },
                { day: 'S', checked: false, current: true },
                { day: 'T', checked: false, current: false },
                { day: 'Q', checked: false, current: false },
                { day: 'Q', checked: false, current: false },
                { day: 'S', checked: false, current: false },
                { day: 'S', checked: false, current: false },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-black text-slate-500">{item.day}</span>
                  <div
                    className={cn(
                      'size-8 rounded-xl flex items-center justify-center text-xs font-black transition-all border-2 border-b-4',
                      item.checked
                        ? 'bg-blue-500 border-blue-600 border-b-blue-800 text-white shadow-md shadow-blue-500/20'
                        : item.current
                          ? 'border-blue-500/60 border-b-blue-600/80 bg-blue-500/15 text-blue-400'
                          : 'bg-white/5 border-white/10 text-slate-600'
                    )}
                  >
                    {item.checked ? <Check size={14} className="stroke-[3.5]" /> : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: CONQUISTAS (Duolingo 3D Style - Compact) */}
          <div className="rounded-[24px] border-2 border-b-4 border-white/10 bg-[#0d0d0d] p-4 space-y-3 shadow-xl shrink-0">
            <div className="flex items-center justify-between">
              <span className="px-3 py-0.5 rounded-xl border-2 border-b-[3px] border-blue-600 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                STACKLYST
              </span>
              <span className="text-sky-400 hover:text-sky-300 font-black text-[11px] tracking-wider uppercase cursor-pointer transition-colors">
                VER TODAS
              </span>
            </div>

            <h4 className="text-lg font-black text-white tracking-tight">Conquistas</h4>

            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {/* Badge 1: 100-Day Code Streak (3D Card) */}
              <div className="h-[105px] rounded-[18px] border-2 border-b-4 border-rose-400/40 border-b-rose-700 bg-gradient-to-b from-rose-500 via-rose-600 to-amber-500 p-2 text-center flex flex-col items-center justify-between shadow-lg shadow-rose-500/15 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 transition-transform cursor-pointer">
                <Flame size={22} className="text-white drop-shadow-md mt-0.5 fill-white/20" />
                <div className="w-full">
                  <p className="text-[9px] font-black text-white leading-tight line-clamp-2">
                    100-Day Code Streak
                  </p>
                  <p className="text-[8px] font-black text-white uppercase tracking-wider mt-0.5 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/15">
                    NÍVEL 9
                  </p>
                </div>
              </div>

              {/* Badge 2: Mago do TypeScript (3D Card) */}
              <div className="h-[105px] rounded-[18px] border-2 border-b-4 border-blue-400/40 border-b-blue-900 bg-gradient-to-b from-blue-600 via-blue-700 to-sky-500 p-2 text-center flex flex-col items-center justify-between shadow-lg shadow-blue-500/15 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 transition-transform cursor-pointer">
                <Wand2 size={22} className="text-white drop-shadow-md mt-0.5" />
                <div className="w-full">
                  <p className="text-[9px] font-black text-white leading-tight line-clamp-2">
                    Mago do TypeScript
                  </p>
                  <p className="text-[8px] font-black text-white uppercase tracking-wider mt-0.5 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/15">
                    NÍVEL 10
                  </p>
                </div>
              </div>

              {/* Badge 3: Python Master (3D Card) */}
              <div className="h-[105px] rounded-[18px] border-2 border-b-4 border-amber-300/40 border-b-amber-800 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 p-2 text-center flex flex-col items-center justify-between shadow-lg shadow-amber-500/15 hover:-translate-y-0.5 active:translate-y-0 active:border-b-2 transition-transform cursor-pointer">
                <Crown size={22} className="text-white drop-shadow-md mt-0.5 fill-white/20" />
                <div className="w-full">
                  <p className="text-[9px] font-black text-white leading-tight line-clamp-2">
                    Python Master
                  </p>
                  <p className="text-[8px] font-black text-white uppercase tracking-wider mt-0.5 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/15">
                    NÍVEL 10
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: MINHAS TRILHAS (Duolingo 3D Style - Cut off at bottom) */}
          <div className="rounded-[24px] border-2 border-b-4 border-white/10 bg-[#0d0d0d] p-4 space-y-3 shadow-xl shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-white tracking-tight">Minhas Trilhas</h4>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  Seu progresso por linguagem
                </p>
              </div>
              <div className="size-9 rounded-xl border-2 border-b-[3px] border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-sm">
                <Sparkles size={18} className="text-blue-400" />
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* JavaScript */}
              <div className="group space-y-2 rounded-[18px] border-2 border-b-4 border-white/10 bg-[#141414] p-3 transition-all hover:border-amber-500/40">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border-b-[3px] border-amber-700 bg-amber-500 text-xs font-black text-white shadow-sm">
                    JS
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-black text-white">JavaScript</span>
                      <span className="shrink-0 rounded-lg border-b-[2px] border-amber-700 bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                        Lvl 1
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                      <span>380 XP</span>
                      <span>25%</span>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-amber-500 w-[25%]" />
                </div>
              </div>

              {/* Python */}
              <div className="group space-y-2 rounded-[18px] border-2 border-b-4 border-white/10 bg-[#141414] p-3 transition-all hover:border-emerald-500/40">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border-b-[3px] border-emerald-700 bg-emerald-500 text-xs font-black text-white shadow-sm">
                    PY
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-black text-white">Python</span>
                      <span className="shrink-0 rounded-lg border-b-[2px] border-emerald-700 bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                        Lvl 1
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                      <span>35 XP</span>
                      <span>2%</span>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-500 w-[2%]" />
                </div>
              </div>

              {/* TypeScript */}
              <div className="group space-y-2 rounded-[18px] border-2 border-b-4 border-white/10 bg-[#141414] p-3 transition-all hover:border-blue-500/40">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border-b-[3px] border-blue-700 bg-blue-500 text-xs font-black text-white shadow-sm">
                    TS
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-black text-white">TypeScript</span>
                      <span className="shrink-0 rounded-lg border-b-[2px] border-blue-700 bg-blue-500 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                        Lvl 1
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                      <span>0 XP</span>
                      <span>0%</span>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-blue-500 w-[0%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Fade gradient overlay at the bottom to create seamless half-cut effect */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </aside>
      </div>
      <div
        className="flex h-5 items-start justify-center bg-black pt-2 md:hidden"
        aria-hidden="true"
      >
        <span className="h-1 w-24 rounded-full bg-white/65" />
      </div>
    </div>
  );
}

const trails = [
  { language: 'TypeScript', level: 19, progress: 92, modules: '28 / 30', color: '#0083fe' },
  { language: 'Python', level: 12, progress: 68, modules: '19 / 28', color: '#f5c542' },
  { language: 'Rust', level: 8, progress: 44, modules: '11 / 25', color: '#e87945' },
];

const trailGlowMap: Record<string, string> = {
  TypeScript: '0, 131, 254',
  Python: '245, 197, 66',
  Rust: '232, 121, 69',
};

function TrailCard({ trail, index }: { trail: (typeof trails)[number]; index: number }) {
  const { t } = useLanguage();
  const isMobile = useMobileDetection();
  const glow = trailGlowMap[trail.language] || '0, 131, 254';

  return (
    <ParticleCard
      data-reveal=""
      disableAnimations={isMobile}
      particleCount={14}
      glowColor={glow}
      enableTilt={true}
      clickEffect={true}
      enableMagnetism={true}
      className={cn(
        cardClass,
        'magic-bento-card magic-bento-card--border-glow group p-6 sm:p-7 flex flex-col justify-between min-h-[20rem]'
      )}
      style={
        {
          backgroundColor: '#080808',
          '--glow-color': glow,
        } as React.CSSProperties
      }
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-b-[2.5px] border-white/10 border-b-white/20 bg-white/5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                {t.showcase.tracks.trackPrefix} {index + 1}
              </span>
              <h3 className="mt-3 text-2xl font-black text-white tracking-tight">
                {trail.language}
              </h3>
            </div>
            <span
              className="flex size-12 items-center justify-center rounded-2xl border-2 border-b-[3px] font-black text-xs shadow-md transition-transform group-hover:scale-105"
              style={{
                borderColor: `${trail.color}60`,
                borderBottomColor: trail.color,
                backgroundColor: `${trail.color}15`,
                color: trail.color,
              }}
            >
              L{trail.level}
            </span>
          </div>
          <div className="mt-10">
            <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>
                {trail.modules} {t.showcase.tracks.modules}
              </span>
              <span className="font-black text-sm" style={{ color: trail.color }}>
                {trail.progress}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-white/5 p-0.5">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${trail.progress}%`,
                  backgroundColor: trail.color,
                  boxShadow: `0 0 16px ${trail.color}80`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-bold text-zinc-400">
          <span>{t.showcase.tracks.nextTopic}</span>
          <ArrowRight size={16} style={{ color: trail.color }} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_45%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
      <BorderBeam
        duration={10 + index * 2}
        size={130}
        borderWidth={1.2}
        colorFrom={trail.color}
        colorTo={trail.color}
      />
    </ParticleCard>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div
      data-reveal
      className="rounded-2xl border-2 border-b-4 border-white/10 bg-[#0d0d0f] p-5 transition-all hover:-translate-y-0.5"
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
        <Icon size={18} />
      </div>
      <p className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
    </div>
  );
}

const duelCodeUserLines = [
  { n: 1, text: '// O(n) Hash Map — Solução Otimizada' },
  { n: 2, text: 'function twoSum(nums: number[], target: number): number[] {' },
  { n: 3, text: '  const map = new Map<number, number>();' },
  { n: 4, text: '  ' },
  { n: 5, text: '  for (let i = 0; i < nums.length; i++) {' },
  { n: 6, text: '    const diff = target - nums[i];' },
  { n: 7, text: '    if (map.has(diff)) {' },
  { n: 8, text: '      return [map.get(diff)!, i];' },
  { n: 9, text: '    }' },
  { n: 10, text: '    map.set(nums[i], i);' },
  { n: 11, text: '  }' },
  { n: 12, text: '  return [];' },
  { n: 13, text: '}' },
];

const duelCodeOpponentLines = [
  { n: 1, text: '// O(n²) Força Bruta — Oponente digitando...' },
  { n: 2, text: 'function twoSum(nums: number[], target: number): number[] {' },
  { n: 3, text: '  for (let i = 0; i < nums.length; i++) {' },
  { n: 4, text: '    for (let j = i + 1; j < nums.length; j++) {' },
  { n: 5, text: '      if (nums[i] + nums[j] === target) {' },
  { n: 6, text: '        return [i, j];' },
  { n: 7, text: '      }' },
  { n: 8, text: '    }' },
  { n: 9, text: '  }' },
  { n: 10, text: '  // Otimizando para evitar timeout... █' },
  { n: 11, text: '  return [];' },
  { n: 12, text: '}' },
];

function highlightDuelCodeLine(text: string) {
  if (text.trim().startsWith('//')) {
    const hasCursor = text.includes('█');
    const cleanText = text.replace('█', '');
    return (
      <span className="text-zinc-500 italic">
        {cleanText}
        {hasCursor && (
          <span className="inline-block h-3.5 w-1.5 bg-violet-400 animate-pulse ml-0.5 align-middle" />
        )}
      </span>
    );
  }

  const tokens = text.split(
    /(\bfunction\b|\bconst\b|\blet\b|\bfor\b|\bif\b|\breturn\b|\bnew\b|\bnumber\b|twoSum|Map|has|get|set|target|diff|nums|map|[0-9]+|[{}();,.<>!=+\-*\[\]])/g
  );

  return (
    <span>
      {tokens.map((token, i) => {
        if (!token) return null;
        if (['function', 'const', 'let', 'for', 'if', 'return', 'new'].includes(token)) {
          return (
            <span key={i} className="text-fuchsia-400 font-bold">
              {token}
            </span>
          );
        }
        if (['number'].includes(token)) {
          return (
            <span key={i} className="text-amber-300 font-semibold">
              {token}
            </span>
          );
        }
        if (['twoSum', 'Map', 'has', 'get', 'set'].includes(token)) {
          return (
            <span key={i} className="text-sky-300 font-bold">
              {token}
            </span>
          );
        }
        if (['target', 'diff', 'nums', 'map', 'i', 'j'].includes(token)) {
          return (
            <span key={i} className="text-blue-100 font-medium">
              {token}
            </span>
          );
        }
        if (/^[0-9]+$/.test(token)) {
          return (
            <span key={i} className="text-emerald-300 font-mono">
              {token}
            </span>
          );
        }
        if (
          [
            '(',
            ')',
            '{',
            '}',
            '[',
            ']',
            ';',
            ',',
            ':',
            '!',
            '+',
            '-',
            '=',
            '<',
            '>',
            '.',
            '===',
            '++',
          ].includes(token)
        ) {
          return (
            <span key={i} className="text-zinc-400 font-medium">
              {token}
            </span>
          );
        }
        return (
          <span key={i} className="text-zinc-300">
            {token}
          </span>
        );
      })}
    </span>
  );
}

function CodeEditorWindow({
  title,
  badgeText,
  badgeType,
  lines,
  footerText,
  footerStatus,
  accentColor = 'blue',
}: {
  title: string;
  badgeText: string;
  badgeType: 'success' | 'warning';
  lines: Array<{ n: number; text: string }>;
  footerText: string;
  footerStatus?: string;
  accentColor?: 'blue' | 'violet';
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-b-4 bg-[#08080a] shadow-lg transition-all',
        accentColor === 'blue'
          ? 'border-blue-500/30 border-b-blue-600/80 hover:border-blue-500/50'
          : 'border-violet-500/30 border-b-violet-600/80 hover:border-violet-500/50'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0d0d10] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-1 text-[11px] font-black text-white tracking-wide">{title}</span>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border-2 border-b-[2px] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
            badgeType === 'success'
              ? 'border-emerald-500/40 border-b-emerald-600 bg-emerald-500/15 text-emerald-400'
              : 'border-amber-500/40 border-b-amber-600 bg-amber-500/15 text-amber-300'
          )}
        >
          {badgeType === 'success' ? (
            <Check size={11} className="stroke-[3]" />
          ) : (
            <Clock size={11} />
          )}
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Code Body */}
      <div className="overflow-x-auto p-3 font-mono text-[11px] leading-[1.65] selection:bg-blue-500/30">
        {lines.map((line) => (
          <div
            key={line.n}
            className="flex items-start gap-3 hover:bg-white/[0.02] rounded px-1 -mx-1"
          >
            <span className="w-5 shrink-0 select-none text-right text-[10px] font-mono text-zinc-600">
              {line.n}
            </span>
            <div className="min-w-0 flex-1 whitespace-pre">{highlightDuelCodeLine(line.text)}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 bg-[#0b0b0e] px-3.5 py-2 text-[10px] font-mono">
        <span className="font-bold text-zinc-400">{footerText}</span>
        {footerStatus && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-black',
              badgeType === 'success' ? 'text-emerald-400' : 'text-amber-400'
            )}
          >
            {badgeType === 'success' ? (
              <Check size={10} className="stroke-[3]" />
            ) : (
              <Clock size={10} />
            )}
            <span>{footerStatus}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function DuelArenaMockup() {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<'both' | 'user' | 'opponent'>('both');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [victoryToast, setVictoryToast] = useState(false);

  const handleRunTests = () => {
    if (isRunningTests) return;
    setIsRunningTests(true);
    setTimeout(() => {
      setIsRunningTests(false);
    }, 600);
  };

  const handleSubmit = () => {
    setVictoryToast(true);
    setTimeout(() => {
      setVictoryToast(false);
    }, 3800);
  };

  return (
    <div
      data-reveal
      className={cn(cardClass, 'grid lg:grid-cols-[370px_1fr] relative overflow-hidden')}
    >
      {/* ================= LEFT COLUMN: MATCHUP & STAKES ================= */}
      <div className="flex flex-col justify-between border-b border-white/8 p-6 lg:border-b-0 lg:border-r sm:p-7 xl:p-8">
        <div>
          {/* Top header: Round + 3D Timer */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-b-[3px] border-rose-500/35 border-b-rose-600 bg-rose-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-300">
              <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
              {t.showcase.duels.finalRound}
            </span>
            <div className="flex items-center gap-1.5 rounded-xl border-2 border-b-[3px] border-blue-500/40 border-b-blue-600 bg-blue-500/15 px-3 py-1 font-mono text-xs font-black text-white">
              <Clock size={13} className="text-blue-400" />
              <span>02:14</span>
            </div>
          </div>

          {/* Versus Grid: Player 1 vs Player 2 with XP & Battery Bars */}
          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-start gap-3 text-center">
            {/* Player 1 (Você) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border-2 border-b-4 border-blue-600 border-b-blue-800 bg-blue-500 text-lg font-black text-white shadow-lg shadow-blue-500/25">
                  US
                </span>
                <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-black bg-blue-500 flex items-center justify-center text-[8px] font-black text-white">
                  ✓
                </span>
              </div>

              {/* XP BADGE (Onde estava user.dev) */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-b-[3px] border-emerald-500/40 border-b-emerald-600 bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 shadow-sm">
                <Zap size={13} className="fill-emerald-400" />
                <span>+150 XP</span>
              </div>
              <p className="mt-1 text-[11px] font-black text-blue-400 tracking-wide">1.420 ELO</p>

              {/* 3D Duolingo Battery Bar */}
              <div className="mt-3 w-full">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1">
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    <Check size={11} className="stroke-[3]" /> 4/4
                  </span>
                  <span className="font-black text-white">100%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-white/10 bg-white/5 p-0.5">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)] w-full transition-all duration-500" />
                </div>
              </div>
            </div>

            {/* Swords in center */}
            <div className="flex flex-col items-center justify-center pt-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border-2 border-b-4 border-blue-500/40 border-b-blue-600 bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/15">
                <Swords size={18} />
              </div>
              <span className="mt-2 font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500">
                VS
              </span>
            </div>

            {/* Player 2 (Oponente) */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border-2 border-b-4 border-violet-600 border-b-violet-800 bg-violet-500 text-lg font-black text-white shadow-lg shadow-violet-500/25">
                  MK
                </span>
                <span className="absolute -bottom-1 -left-1 size-3.5 rounded-full border-2 border-black bg-violet-400" />
              </div>

              {/* XP BADGE (Onde estava maya.kernel) */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-b-[3px] border-violet-500/40 border-b-violet-600 bg-violet-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-violet-300 shadow-sm">
                <Zap size={13} className="fill-violet-400" />
                <span>+150 XP</span>
              </div>
              <p className="mt-1 text-[11px] font-black text-violet-400 tracking-wide">1.398 ELO</p>

              {/* 3D Duolingo Battery Bar */}
              <div className="mt-3 w-full">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1">
                  <span className="text-violet-300 font-black flex items-center gap-1">
                    <Clock size={11} /> 2/4
                  </span>
                  <span className="font-black text-violet-400">50%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-white/10 bg-white/5 p-0.5">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] w-1/2 transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Goal box */}
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border-2 border-b-4 border-blue-500/30 border-b-blue-600 bg-blue-500/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Terminal size={12} /> {t.showcase.duels.challenge}
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                Two Sum • O(n)
              </span>
            </div>
            <p className="text-xs font-bold leading-relaxed text-zinc-200">
              {t.showcase.duels.challengeDesc}
            </p>
            <div className="mt-2.5 rounded-xl border border-white/10 bg-black/50 p-2 font-mono text-[10px] text-zinc-400 leading-snug">
              <span className="text-blue-400 font-bold">Input:</span> nums = [2, 7, 11, 15], target
              = 9<br />
              <span className="text-emerald-400 font-bold">Output:</span> [0, 1]
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border-2 border-b-[3px] border-emerald-500/30 border-b-emerald-600 bg-emerald-500/10 px-3.5 py-2">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-emerald-400" />
              <span className="text-xs font-black text-white">Você está liderando!</span>
            </div>
            <span className="text-[10px] font-mono font-black text-emerald-400">
              +150 XP em disputa
            </span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: TWO CODES & TEST RUNNER ================= */}
      <div className="flex min-w-0 flex-col justify-between bg-black p-4 sm:p-6 lg:p-7">
        <div>
          {/* Controls Bar: View mode switcher */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Arena de Código ao Vivo
              </span>
              <span className="rounded-lg border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-blue-400">
                TypeScript
              </span>
            </div>

            {/* Tabs (3D Buttons with Real Lucide Icons) */}
            <div className="inline-flex items-center rounded-xl border-2 border-b-[3px] border-white/10 bg-[#0d0d10] p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveView('both')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer',
                  activeView === 'both'
                    ? 'border-b-2 border-blue-700 bg-blue-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                <Columns2 size={12} className="stroke-[2.5]" />
                <span>Lado a Lado</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('user')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer',
                  activeView === 'user'
                    ? 'border-b-2 border-emerald-700 bg-emerald-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                <User size={12} className="stroke-[2.5]" />
                <span>Você (4/4)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('opponent')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer',
                  activeView === 'opponent'
                    ? 'border-b-2 border-violet-700 bg-violet-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                <Users2 size={12} className="stroke-[2.5]" />
                <span>Oponente (2/4)</span>
              </button>
            </div>
          </div>

          {/* Dual Code View Area */}
          <div
            className={cn(
              'grid gap-3.5',
              activeView === 'both' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
            )}
          >
            {/* CODE 1: PLAYER 1 (Você) */}
            {(activeView === 'both' || activeView === 'user') && (
              <CodeEditorWindow
                title="Seu Código (Você)"
                badgeText="4/4 Testes (100%)"
                badgeType="success"
                lines={duelCodeUserLines}
                footerText="TypeScript • Solução O(n)"
                footerStatus="38ms"
                accentColor="blue"
              />
            )}

            {/* CODE 2: PLAYER 2 (Oponente) */}
            {(activeView === 'both' || activeView === 'opponent') && (
              <CodeEditorWindow
                title="Oponente (maya.kernel)"
                badgeText="2/4 Testes (50%)"
                badgeType="warning"
                lines={duelCodeOpponentLines}
                footerText="TypeScript • Força Bruta O(n²)"
                footerStatus="142ms"
                accentColor="violet"
              />
            )}
          </div>
        </div>

        {/* Test Runner and Execution Bar (Duolingo 3D) */}
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border-2 border-b-4 border-white/10 bg-[#0c0c0f] p-3.5 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Bateria de Testes:
                </span>
                <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-black text-emerald-300">
                  {isRunningTests ? 'Executando...' : '4/4 Aprovados'}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                <span>
                  CPU: <strong className="text-emerald-400 font-bold">38ms</strong>
                </span>
                <span>•</span>
                <span>
                  Memória: <strong className="text-white font-bold">42.1MB</strong>
                </span>
              </div>
            </div>

            {/* Test Cards List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
              {[
                { id: 1, label: 'Caso 1', io: '[2,7,11,15], 9' },
                { id: 2, label: 'Caso 2', io: '[3,2,4], 6' },
                { id: 3, label: 'Caso 3', io: '[3,3], 6' },
                { id: 4, label: 'Carga 10k', io: '10.000 itens' },
              ].map((tc) => (
                <div
                  key={tc.id}
                  className="flex items-center gap-2 rounded-xl border-2 border-b-[2.5px] border-emerald-500/30 border-b-emerald-600 bg-emerald-500/[0.08] px-2.5 py-1.5 text-[10px]"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white font-black text-[9px]">
                    ✓
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-white truncate">{tc.label}</p>
                    <p className="text-[9px] font-mono text-emerald-300 truncate">{tc.io}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Action Buttons */}
            <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-3">
              <span className="text-[11px] font-bold text-zinc-400 text-center sm:text-left">
                Clique para simular a execução e envio do desafio ao vivo
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRunTests}
                  disabled={isRunningTests}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border-2 border-b-4 border-white/20 border-b-white/40 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/15 active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Play size={12} className={cn('fill-white', isRunningTests && 'animate-spin')} />
                  <span>{isRunningTests ? 'Executando...' : 'Executar Testes'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border-2 border-b-4 border-blue-600 border-b-blue-800 bg-blue-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 hover:bg-blue-400 active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Trophy size={13} className="fill-white/20" />
                  <span>Enviar Solução</span>
                </button>
              </div>
            </div>
          </div>

          {/* Victory Toast Notification */}
          {victoryToast && (
            <div className="flex items-center justify-between rounded-xl border-2 border-b-[3px] border-emerald-500/40 border-b-emerald-600 bg-gradient-to-r from-emerald-500/25 via-blue-500/20 to-emerald-500/25 px-4 py-3 text-xs font-black text-white shadow-xl animate-fade-in">
              <div className="flex items-center gap-2.5">
                <Trophy size={16} className="text-amber-400 shrink-0" />
                <span>Vitória Épica! Você resolveu o desafio em primeiro lugar!</span>
              </div>
              <span className="flex items-center gap-1 font-mono text-emerald-400 font-black">
                <Zap size={14} className="fill-current" /> +150 XP • +35 ELO
              </span>
            </div>
          )}
        </div>
      </div>
      <BorderBeam duration={8} size={150} colorFrom="#0083fe" colorTo="#60a5fa" />
    </div>
  );
}

export default function LandingShowcase({
  initialUser,
  forceMotion = false,
}: LandingShowcaseProps) {
  const { t } = useLanguage();
  const isMobile = useMobileDetection();
  const rootRef = useRef<HTMLDivElement>(null);
  const howGridRef = useRef<HTMLDivElement>(null);
  const trailsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || (!forceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      return;
    }

    const scope = createScope({ root });
    scope.add(() => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-anime-section]'));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const targets = entry.target.querySelectorAll<HTMLElement>('[data-reveal]');
            scope.execute(() => {
              animate(targets, {
                opacity: { from: 0 },
                y: { from: 32 },
                scale: { from: 0.985 },
                duration: 850,
                delay: stagger(75),
                ease: 'outExpo',
              });
            });
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      sections.forEach((section) => observer.observe(section));
      return () => observer.disconnect();
    });

    return () => scope.revert();
  }, [forceMotion]);

  return (
    <div ref={rootRef} className="relative overflow-hidden bg-black text-white">
      <section
        id="how"
        data-anime-section
        className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:py-36 bento-section"
      >
        <GlobalSpotlight gridRef={howGridRef} glowColor="0, 131, 254" spotlightRadius={300} />
        <SectionHeading
          badge={t.showcase.howItWorks.eyebrow}
          badgeIcon={GitBranch}
          title={
            <>
              {t.showcase.howItWorks.titlePart1}
              <span className="text-blue-400">{t.showcase.howItWorks.titleProof}</span>
            </>
          }
          description={t.showcase.howItWorks.description}
        />
        <div ref={howGridRef} className="bento-section">
          <BentoGrid className="auto-rows-[22rem] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            <FeatureCard
              className="md:col-span-2 lg:col-span-4"
              icon={GitBranch}
              label={t.showcase.howItWorks.flowCard.label}
              title={t.showcase.howItWorks.flowCard.title}
              description={t.showcase.howItWorks.flowCard.description}
              preview={<FlowPreview />}
              beam
            />
            <FeatureCard
              className="lg:col-span-2"
              icon={BookOpen}
              label={t.showcase.howItWorks.quizCard.label}
              title={t.showcase.howItWorks.quizCard.title}
              description={t.showcase.howItWorks.quizCard.description}
              preview={<QuizPreview />}
            />
            <FeatureCard
              className="lg:col-span-3"
              icon={Users2}
              label={t.showcase.howItWorks.communityCard.label}
              title={t.showcase.howItWorks.communityCard.title}
              description={t.showcase.howItWorks.communityCard.description}
              preview={<MetricsPreview />}
            />
            <FeatureCard
              className="lg:col-span-3"
              icon={ShieldCheck}
              label={t.showcase.howItWorks.proofCard.label}
              title={t.showcase.howItWorks.proofCard.title}
              description={t.showcase.howItWorks.proofCard.description}
              preview={<HistoryPreview />}
            />
          </BentoGrid>
        </div>
      </section>

      <section
        id="platform"
        data-anime-section
        className="relative border-y border-white/8 bg-black px-4 py-24 sm:px-6 sm:py-28 lg:py-36"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            badge={t.showcase.platform.eyebrow}
            badgeIcon={Sparkles}
            title={
              <>
                {t.showcase.platform.titlePart1}
                <span className="text-blue-400">{t.showcase.platform.titleOneFlow}</span>
              </>
            }
            description={t.showcase.platform.description}
          />
          <div data-reveal className="relative mx-auto w-full max-w-[380px] md:max-w-none">
            <span
              aria-hidden="true"
              className="absolute -left-1 top-28 h-11 w-1 rounded-l-full bg-[#303640] shadow-[inset_1px_0_rgba(255,255,255,0.18)] md:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute -left-1 top-44 h-16 w-1 rounded-l-full bg-[#303640] shadow-[inset_1px_0_rgba(255,255,255,0.18)] md:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute -right-1 top-36 h-20 w-1 rounded-r-full bg-[#303640] shadow-[inset_-1px_0_rgba(255,255,255,0.18)] md:hidden"
            />

            <div className="relative overflow-hidden rounded-[44px] border-[5px] border-[#242932] bg-[#030303] p-1.5 pt-8 shadow-[0_30px_80px_-24px_rgba(0,131,254,0.38),0_22px_65px_-30px_rgba(0,0,0,0.95)] md:rounded-[28px] md:border md:border-white/10 md:bg-[#080808] md:p-3 md:shadow-[0_28px_100px_-55px_rgba(0,0,0,0.9)]">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-2 z-30 flex h-5 w-24 -translate-x-1/2 items-center justify-end rounded-full border border-white/5 bg-black px-2 shadow-[0_1px_0_rgba(255,255,255,0.08)] md:hidden"
              >
                <span className="size-1.5 rounded-full bg-[#0b1d33] ring-1 ring-blue-400/20" />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[6px] z-20 rounded-[36px] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_22%)] md:hidden"
              />

              <PlatformMockup />
              <BorderBeam
                duration={12}
                size={180}
                borderWidth={1.2}
                colorFrom="#0083fe"
                colorTo="#60a5fa"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="trails"
        data-anime-section
        className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:py-36 bento-section"
      >
        <GlobalSpotlight gridRef={trailsGridRef} glowColor="0, 131, 254" spotlightRadius={300} />
        <SectionHeading
          badge={t.showcase.tracks.eyebrow}
          badgeIcon={BookOpen}
          title={
            <>
              {t.showcase.tracks.titlePart1}
              <span className="text-blue-400">{t.showcase.tracks.titleSee}</span>
            </>
          }
          description={t.showcase.tracks.description}
        />
        <div ref={trailsGridRef} className="bento-section space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {trails.map((trail, index) => (
              <TrailCard key={trail.language} trail={trail} index={index} />
            ))}
          </div>

          <ParticleCard
            data-reveal=""
            disableAnimations={isMobile}
            particleCount={14}
            glowColor="249, 115, 22"
            enableTilt={true}
            clickEffect={true}
            enableMagnetism={true}
            className={cn(
              cardClass,
              'magic-bento-card magic-bento-card--border-glow group grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:p-10'
            )}
            style={
              {
                backgroundColor: '#080808',
                '--glow-color': '249, 115, 22',
              } as React.CSSProperties
            }
          >
            <div className="relative z-10 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-xl border-2 border-b-[3px] border-orange-500/35 border-b-orange-600 bg-orange-500/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-orange-400">
                  <Flame size={14} className="fill-orange-400" /> {t.showcase.tracks.gamifyBadge}
                </div>
                <h3 className="mt-5 max-w-lg text-2xl sm:text-4xl font-black tracking-tight text-white">
                  {t.showcase.tracks.gamifyTitle}
                </h3>
                <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-zinc-300 font-normal">
                  {t.showcase.tracks.gamifyDesc}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider text-zinc-300">
                {[
                  t.showcase.tracks.streakBadge,
                  t.showcase.tracks.leagueBadge,
                  t.showcase.tracks.achievementsBadge,
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-xl border-2 border-b-[3px] border-white/10 border-b-white/20 bg-white/[0.04] px-4 py-2"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-3">
              <MetricCard icon={Flame} value="12" label={t.showcase.tracks.dayStreakMetric} />
              <MetricCard icon={Trophy} value="#24" label={t.showcase.tracks.globalRankingMetric} />
              <MetricCard
                icon={BadgeCheck}
                value="18"
                label={t.showcase.tracks.achievementsMetric}
              />
              <MetricCard icon={Zap} value="8.4k" label={t.showcase.tracks.totalXpMetric} />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_45%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
            <BorderBeam
              duration={11}
              size={160}
              borderWidth={1.2}
              colorFrom="#f97316"
              colorTo="#fbbf24"
            />
          </ParticleCard>
        </div>
      </section>

      <section
        id="duels"
        data-anime-section
        className="relative border-y border-white/8 bg-black px-4 py-24 sm:px-6 sm:py-28 lg:py-36"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            badge={t.showcase.duels.eyebrow}
            badgeIcon={Swords}
            title={
              <>
                {t.showcase.duels.titlePart1}
                <span className="text-blue-400">{t.showcase.duels.titleBetterCode}</span>
              </>
            }
            description={t.showcase.duels.description}
          />
          <DuelArenaMockup />
        </div>
      </section>

      <section
        id="start"
        data-anime-section
        className="relative border-t border-white/8 px-4 py-24 sm:px-6 lg:py-32"
      >
        <div
          data-reveal
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[34px] border-2 border-b-4 border-blue-500/30 border-b-blue-600 bg-black px-5 py-16 text-center sm:px-10 sm:py-20 lg:py-28"
        >
          <div className="absolute inset-0 opacity-30">
            <Aurora
              colorStops={['#00152e', '#0083fe', '#7c3aed']}
              amplitude={0.9}
              blend={0.65}
              speed={0.55}
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(0,0,0,0.45),rgba(0,0,0,0.94)_70%)]" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-xl border-2 border-b-[3px] border-blue-400/40 border-b-blue-500 bg-blue-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-blue-300 shadow-sm">
              <Terminal size={14} /> {t.showcase.cta.badge}
            </div>
            <h2 className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-white">
              {t.showcase.cta.titlePart1}
              <span className="text-blue-400">{t.showcase.cta.titleShowIt}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-300 font-normal">
              {t.showcase.cta.subtitle}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={initialUser ? '/feed' : '/register'}
                className="dd-touch inline-flex min-h-13 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-b-4 border-blue-600 border-b-blue-800 bg-blue-500 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-400 active:translate-y-0.5 active:border-b-2"
              >
                {initialUser ? t.showcase.cta.goToFeed : t.showcase.cta.createProfile}
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how"
                className="dd-touch inline-flex min-h-13 cursor-pointer items-center justify-center rounded-2xl border-2 border-b-4 border-white/10 border-b-white/20 bg-white/[0.05] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0.5 active:border-b-2"
              >
                {t.showcase.cta.reviewHowItWorks}
              </a>
            </div>
          </div>
          <BorderBeam
            duration={10}
            size={180}
            borderWidth={1.4}
            colorFrom="#0083fe"
            colorTo="#60a5fa"
          />
        </div>
      </section>
    </div>
  );
}
