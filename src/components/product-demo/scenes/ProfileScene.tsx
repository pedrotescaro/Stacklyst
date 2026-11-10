'use client';

import { motion, type MotionValue } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  ChartNoAxesCombined,
  ChevronDown,
  Heart,
  MessageCircle,
  Newspaper,
  Search,
  Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ProfileStatistics } from '@/app/profile/[username]/ProfileStatistics';
import { CredentialCollection } from '@/components/credentials/CredentialCollection';
import {
  SocialProfileOverview,
  type SocialProfile,
} from '@/components/profile-inline/SocialProfileOverview';
import { DEFAULT_PROFILE_PREFERENCES, parseProfilePreferences } from '@/lib/profile-customization';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import inline from '@/components/profile-inline/InlineProfile.module.css';
import profileStyles from '@/components/profile/ProfilePublic.module.css';
import headerStyles from '@/app/profile/[username]/ProfileHeader.module.css';
import { DemoShell } from '../DemoShell';
import { DemoRightRail } from '../DemoRightRail';
import { DemoPost } from '../DemoPost';
import { Cascade, CascadeItem } from '../demo-motion';
import { DEMO_USER, DEMO_WEEKLY_ACTIVITY, demoCopy, demoCredentials } from '../demo-data';
import { usePhase } from '../timeline';
import { RANKING_END_XP } from './RankingScene';

/** Beats: posts tab, statistics tab, certificates tab. */
export const PROFILE_MARKS = [2.2, 5.6] as const;

const noop = () => {};
const noopAsync = async () => {};

export function ProfileScene({ clock, mobile }: { clock: MotionValue<number>; mobile: boolean }) {
  const { text } = useLocalizedText();
  const copy = demoCopy(text);
  const phase = usePhase(clock, PROFILE_MARKS);
  const activeTab = phase === 0 ? 'posts' : phase === 1 ? 'stats' : 'certificates';
  const totalXp = RANKING_END_XP;

  const profile: SocialProfile = {
    id: DEMO_USER.id,
    username: DEMO_USER.username,
    name: DEMO_USER.name,
    bio: copy.user.bio,
    institution: copy.user.institution,
    created_at: DEMO_USER.created_at,
    total_xp: totalXp,
    avatar_url: DEMO_USER.avatar_url,
    customization: {
      preferences: parseProfilePreferences({
        ...DEFAULT_PROFILE_PREFERENCES,
        tags: copy.user.tags,
        studies: copy.user.studies,
      }),
      achievements: [],
    },
  };

  const tabs: Array<{ id: string; label: string; icon: LucideIcon }> = [
    { id: 'posts', label: text('Publicações', 'Posts'), icon: Newspaper },
    { id: 'media', label: text('Mídias', 'Media'), icon: Video },
    { id: 'likes', label: text('Curtidas', 'Likes'), icon: Heart },
    { id: 'replies', label: text('Respostas', 'Replies'), icon: MessageCircle },
    { id: 'stats', label: text('Estatísticas', 'Statistics'), icon: ChartNoAxesCombined },
    { id: 'certificates', label: text('Certificados', 'Certificates'), icon: BadgeCheck },
  ];
  const mobileTabs = [tabs[0], tabs[2], tabs[3], tabs[4], tabs[5], tabs[1]];

  return (
    <DemoShell
      route="profile"
      mobile={mobile}
      mobileHeader={false}
      rail={<DemoRightRail trailXp={totalXp} />}
      bodyClassName={`dd-platform-body min-w-0 flex-grow bg-dd-bg ${inline.pageLayout} ${profileStyles.scope}`}
      mainClassName={`dd-platform-main ${inline.pageMain}`}
    >
      <Cascade className={inline.content} data-testid="profile-layout">
        <CascadeItem className={headerStyles.sticky}>
          <header className={headerStyles.header}>
            <span className={headerStyles.iconButton} aria-label={text('Voltar', 'Back')}>
              <ArrowLeft size={20} aria-hidden="true" />
            </span>
            <div className={headerStyles.identity}>
              <h1>{DEMO_USER.name}</h1>
              <p>3 {text('publicações', 'posts')}</p>
            </div>
            <span
              className={headerStyles.iconButton}
              aria-label={text('Buscar no perfil', 'Search profile')}
            >
              <Search size={20} aria-hidden="true" />
            </span>
          </header>
        </CascadeItem>

        <CascadeItem>
          <SocialProfileOverview
            profile={profile}
            currentUserId={DEMO_USER.id}
            following={false}
            followers={128}
            followingCount={42}
            onFollowToggle={noopAsync}
            onShowFollowers={noop}
            onShowFollowing={noop}
            onSaved={noop}
          />
        </CascadeItem>

        <CascadeItem className={headerStyles.desktopNavigation}>
          <div
            className={`${inline.tabs} ${headerStyles.tabs} ${headerStyles.desktopTabs}`}
            role="tablist"
            aria-label={text('Conteúdo do perfil', 'Profile content')}
            data-testid="profile-desktop-tabs"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <span
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                className={inline.tab}
                data-demo-tab={id}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
                {id === 'media' && <ChevronDown size={14} aria-hidden="true" />}
              </span>
            ))}
          </div>
        </CascadeItem>

        <CascadeItem
          className={headerStyles.mobileTabsBar}
          role="tablist"
          aria-label={text('Conteúdo do perfil', 'Profile content')}
        >
          {mobileTabs.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <span
                key={id}
                role="tab"
                aria-selected={selected}
                aria-label={label}
                className={`${headerStyles.mobileTab} ${selected ? headerStyles.mobileTabActive : ''}`}
              >
                <span className={headerStyles.mobileTabInner}>
                  <Icon size={selected ? 17 : 19} aria-hidden="true" className="shrink-0" />
                  {selected ? (
                    <span className={headerStyles.mobileTabLabel}>{label}</span>
                  ) : (
                    <span className="sr-only">{label}</span>
                  )}
                </span>
                {selected && <span className={headerStyles.mobileIndicator} aria-hidden="true" />}
              </span>
            );
          })}
        </CascadeItem>

        <CascadeItem role="tabpanel" data-demo-panel={activeTab}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {activeTab === 'posts' && (
              <div className="border-b border-dd-border">
                <DemoPost
                  author={{ ...DEMO_USER, total_xp: totalXp }}
                  body={copy.feed.draft}
                  createdLabel={text('Postado há pouco', 'Posted just now')}
                  likes={2}
                  answers={1}
                />
              </div>
            )}
            {activeTab === 'stats' && (
              <ProfileStatistics
                stats={{
                  posts_count: 3,
                  answers_count: 7,
                  likes_received: 19,
                  accuracy: 92,
                  accepted_count: 4,
                }}
                totalXp={totalXp}
                streakDays={DEMO_USER.streak}
                weeklyActivity={DEMO_WEEKLY_ACTIVITY}
                trails={[{ language: 'JS', xp: totalXp, level: 5 }]}
              />
            )}
            {activeTab === 'certificates' && (
              <section aria-label={text('Certificados do perfil', 'Profile certificates')}>
                <h2 className={headerStyles.certificatesHeading}>
                  {text('Badges e certificados', 'Badges and certificates')}
                </h2>
                <CredentialCollection collection={demoCredentials(text)} isOwner />
              </section>
            )}
          </motion.div>
        </CascadeItem>
      </Cascade>
    </DemoShell>
  );
}
