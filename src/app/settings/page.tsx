'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { getCurrentUser, invalidateCurrentUser } from '@/lib/client/current-user';
import { useLanguage } from '@/contexts/LanguageContext';
import { AVATAR_BACKGROUNDS, normalizeAvatarConfig } from '@/lib/avatar';
import { playSoundPreview } from '@/hooks/useSoundEffects';
import {
  User,
  GraduationCap,
  FileText,
  LogOut,
  Check,
  AlertCircle,
  Sun,
  Moon,
  Tag,
  Cake,
  X,
  ChevronRight,
  ArrowLeft,
  Search,
  Volume2,
  Languages,
} from 'lucide-react';

type SettingsTab = 'sua-conta' | 'aparencia' | 'sons' | 'idioma' | 'acoes';
type SoundFeedback = 'enabled' | 'disabled' | null;

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [institution, setInstitution] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [selectedBannerColor, setSelectedBannerColor] = useState(0);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [pronouns, setPronouns] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameConfirmOpen, setUsernameConfirmOpen] = useState(false);
  const [usernameChangeAvailableAt, setUsernameChangeAvailableAt] = useState<string | null>(null);

  // Layout states for Twitter-like UI
  const [activeTab, setActiveTab] = useState<SettingsTab>('sua-conta');
  const [mobileShowDetails, setMobileShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme preference state & handler
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark';
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const changeTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Sound preference state & handler
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundFeedback, setSoundFeedback] = useState<SoundFeedback>(null);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
  }, []);

  const toggleSound = () => {
    const newVal = !soundEnabled;
    // This preview is intentionally independent from the saved preference so
    // turning sounds off also gives immediate audible confirmation.
    playSoundPreview('notification');
    setSoundEnabled(newVal);
    localStorage.setItem('stacklyst-sound', String(newVal));
    window.dispatchEvent(new Event('stacklyst-sound-changed'));
    setSoundFeedback(newVal ? 'enabled' : 'disabled');
  };

  useEffect(() => {
    let active = true;

    const fetchUserData = async () => {
      try {
        const profileData = await getCurrentUser<any>();

        if (!profileData) {
          router.replace('/login');
          return;
        }

        if (!active) return;
        setUser(profileData);
        setUsername(profileData.username || '');
        const usernameAvailableAt = profileData.username_changed_at
          ? new Date(profileData.username_changed_at).getTime() + 7 * 24 * 60 * 60 * 1000
          : 0;
        setUsernameChangeAvailableAt(
          usernameAvailableAt > Date.now() ? new Date(usernameAvailableAt).toISOString() : null
        );
        setBio(profileData.bio || '');
        setInstitution(profileData.institution || '');
        setGithubUsername(profileData.github_username || '');
        setDiscordUsername(profileData.discord_username || '');
        setBannerUrl(profileData.banner_url || '');
        setSelectedBannerColor(
          normalizeAvatarConfig(profileData.avatar_config, profileData.username).background
        );
        setPronouns(profileData.pronouns || '');
        setBirthday(profileData.birthday ? profileData.birthday.split('T')[0] : '');
      } catch (err) {
        console.error('Error fetching settings user:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      active = false;
    };
  }, [router]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setBannerUrl(data.url);
      }
    } catch (err) {
      console.error('Banner upload failed:', err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const performUpdateProfile = async () => {
    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          bio,
          institution,
          github_username: githubUsername,
          discord_username: discordUsername,
          banner_url: bannerUrl,
          pronouns,
          birthday,
          avatar_config: { background: selectedBannerColor },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser((current: any) => ({
          ...current,
          ...data,
          username: data.username || username.trim().toLowerCase(),
        }));
        if (data.username_changed_at) {
          setUsernameChangeAvailableAt(
            new Date(
              new Date(data.username_changed_at).getTime() + 7 * 24 * 60 * 60 * 1000
            ).toISOString()
          );
        }
        invalidateCurrentUser();
        setSuccess(true);
      } else {
        const data = await res.json();
        if (res.status === 429)
          setUsernameChangeAvailableAt(data.usernameChangeAvailableAt || null);
        setError(data.error || t.settings.account.updateError);
      }
    } catch (err) {
      console.error(err);
      setError(t.settings.account.internalError);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUsername = user?.username?.toLowerCase() || '';
    const cleanUsername = username.trim().toLowerCase();
    const cooldownEndsAt = user?.username_changed_at
      ? new Date(user.username_changed_at).getTime() + 7 * 24 * 60 * 60 * 1000
      : 0;
    if (cleanUsername !== currentUsername && cooldownEndsAt > Date.now()) {
      setUsernameChangeAvailableAt(new Date(cooldownEndsAt).toISOString());
      setError(
        language === 'en'
          ? 'You can change your username again after 7 days.'
          : 'Você só poderá mudar o username novamente após 7 dias.'
      );
      return;
    }
    if (cleanUsername !== currentUsername) {
      setError(null);
      setUsernameConfirmOpen(true);
      return;
    }
    await performUpdateProfile();
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      invalidateCurrentUser();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const tabs = [
    {
      id: 'sua-conta',
      title: t.settings.tabs.account.title,
      description: t.settings.tabs.account.description,
      icon: User,
      keywords: [
        'sua conta',
        'perfil',
        'biografia',
        'bio',
        'instituicao',
        'github',
        'discord',
        'pronome',
        'aniversario',
        'data',
        'nascimento',
        'banner',
        'foto',
        'salvar',
      ],
    },
    {
      id: 'aparencia',
      title: t.settings.tabs.appearance.title,
      description: t.settings.tabs.appearance.description,
      icon: Sun,
      keywords: ['aparencia', 'tema', 'claro', 'escuro', 'light', 'dark', 'visual'],
    },
    {
      id: 'sons',
      title: t.settings.tabs.sounds.title,
      description: t.settings.tabs.sounds.description,
      icon: Volume2,
      keywords: ['sons', 'efeito', 'sonoro', 'audio', 'sound', 'barulho', 'volume'],
    },
    {
      id: 'idioma',
      title: t.settings.tabs.language.title,
      description: t.settings.tabs.language.description,
      icon: Languages,
      keywords: ['idioma', 'lingua', 'linguagem', 'language', 'english', 'portugues', 'inglês'],
    },
    {
      id: 'acoes',
      title: t.settings.tabs.actions.title,
      description: t.settings.tabs.actions.description,
      icon: LogOut,
      keywords: ['acoes', 'sair', 'logout', 'deslogar', 'encerrar', 'sessao'],
    },
  ];

  const filteredTabs = tabs.filter(
    (tab) =>
      tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.keywords.some((keyword) => keyword.includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="dd-platform-shell">
        <Sidebar user={user} />
        <div className="flex min-w-0 flex-grow xl:max-w-[950px]">
          <div className="flex min-h-screen w-full items-center justify-center border-r border-dd-border">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p className="text-xs text-dd-muted">{t.settings.loading}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="settings-shell" className="dd-platform-shell">
      <Sidebar user={user} />

      <div className="flex min-w-0 flex-grow xl:max-w-[950px]">
        {/* Central Settings List Column */}
        <div
          className={`w-full md:w-[350px] border-r border-dd-border flex-shrink-0 flex flex-col bg-dd-bg ${
            mobileShowDetails ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-dd-border">
            <h1 className="text-lg font-extrabold text-dd-text">{t.settings.title}</h1>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-dd-border/50">
            <div className="relative flex items-center bg-dd-surface/40 border border-dd-border rounded-full px-3 py-1.5 focus-within:border-blue-500/80 focus-within:bg-dd-bg transition-all">
              <Search className="w-4 h-4 text-dd-muted mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder={t.settings.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-dd-text focus:outline-none placeholder-dd-muted/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-dd-muted hover:text-dd-text cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-grow overflow-y-auto pb-24 md:pb-4 divide-y divide-dd-border/30">
            {filteredTabs.length === 0 ? (
              <div className="p-6 text-center text-xs text-dd-muted font-semibold">
                {t.settings.noResults}
              </div>
            ) : (
              filteredTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as SettingsTab);
                      setMobileShowDetails(true);
                    }}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors relative cursor-pointer ${
                      isSelected
                        ? 'bg-dd-surface/30 text-dd-text font-bold'
                        : 'text-dd-muted hover:bg-dd-surface/20 hover:text-dd-text'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon
                        className={`w-4.5 h-4.5 ${isSelected ? 'text-blue-500' : 'text-dd-muted'}`}
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold tracking-wide block">{tab.title}</span>
                        <span className="text-[10px] text-dd-muted/80 font-medium block md:hidden lg:block leading-tight">
                          {tab.description}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dd-muted/60" />

                    {isSelected && (
                      <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-blue-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right-hand Detail Panel Column */}
        <div
          className={`flex w-full max-w-[600px] min-w-0 flex-grow flex-col border-r border-dd-border bg-dd-bg ${
            !mobileShowDetails ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Panel Header */}
          <div className="p-4 border-b border-dd-border flex items-center gap-3 bg-dd-bg sticky top-0 z-10">
            <button
              type="button"
              onClick={() => setMobileShowDetails(false)}
              className="md:hidden p-1.5 hover:bg-dd-surface/60 rounded-full text-dd-muted hover:text-dd-text transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-extrabold text-dd-text">
              {tabs.find((t) => t.id === activeTab)?.title}
            </h2>
          </div>

          {/* Panel Scrollable Content */}
          <div className="flex-grow overflow-y-auto px-4 py-6 md:px-6 space-y-6 max-w-2xl w-full pb-24 md:pb-8">
            {activeTab === 'sua-conta' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dd-muted uppercase tracking-wider mb-1">
                    {t.settings.account.heading}
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    {t.settings.account.description}
                  </p>
                </div>

                {success && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{t.settings.account.saved}</span>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2"
                      htmlFor="username"
                    >
                      {t.settings.account.username}
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                      }
                      maxLength={30}
                      className="w-full rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-xs text-dd-text focus:border-blue-500/60 focus:outline-none transition-colors"
                    />
                    <p className="mt-2 text-[11px] text-dd-muted">
                      {language === 'en'
                        ? 'Username changes are allowed every 7 days.'
                        : 'O username pode ser alterado a cada 7 dias.'}
                      {usernameChangeAvailableAt &&
                        ` ${language === 'en' ? 'Available on' : 'Disponível em'} ${new Date(usernameChangeAvailableAt).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}.`}
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      htmlFor="institution"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-dd-muted" />
                      {t.settings.account.institution}
                    </label>
                    <input
                      id="institution"
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-xs text-dd-text focus:border-blue-500/60 focus:outline-none transition-colors"
                      placeholder="Ex: USP, Vercel, Freelancer"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      htmlFor="githubUsername"
                    >
                      <svg className="h-3.5 w-3.5 text-dd-muted fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      {t.settings.account.githubUsername}
                    </label>
                    <input
                      id="githubUsername"
                      type="text"
                      value={githubUsername}
                      onChange={(e) =>
                        setGithubUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))
                      }
                      className="w-full rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-xs text-dd-text focus:border-blue-500/60 focus:outline-none transition-colors"
                      placeholder="Ex: seu-usuario-github"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      htmlFor="discordUsername"
                    >
                      <svg
                        className="h-3.5 w-3.5 text-dd-muted fill-current"
                        viewBox="0 0 127.14 96.36"
                      >
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.95,54.65.62,77.53a107.4,107.4,0,0,0,32,16.29,80.1,80.1,0,0,0,6.72-11,68.6,68.6,0,0,1-10.64-5.12c.91-.67,1.81-1.37,2.65-2.1a77,77,0,0,0,74.5,0c.84.73,1.74,1.43,2.65,2.1a68.6,68.6,0,0,1-10.64,5.12,80.1,80.1,0,0,0,6.72,11,107.4,107.4,0,0,0,32-16.29C130.41,47.55,123.57,24.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.16-12.72,11.43-12.72S53.9,46,53.9,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53s5.16-12.72,11.45-12.72S96.14,46,96.14,53,91,65.69,84.69,65.69Z" />
                      </svg>
                      {t.settings.account.discordUsername}
                    </label>
                    <input
                      id="discordUsername"
                      type="text"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      className="w-full rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-xs text-dd-text focus:border-blue-500/60 focus:outline-none transition-colors"
                      placeholder="Ex: seu-usuario-discord"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      htmlFor="pronouns"
                    >
                      <Tag className="w-3.5 h-3.5 text-dd-muted" />
                      {t.settings.account.pronouns}
                    </label>
                    <input
                      id="pronouns"
                      type="text"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      className="w-full rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-xs text-dd-text focus:border-blue-500/60 focus:outline-none transition-colors"
                      placeholder="Ex: ele/dele, ela/dela, elu/delu"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      htmlFor="birthday"
                    >
                      <Cake className="w-3.5 h-3.5 text-dd-muted" />
                      {t.settings.account.birthday}
                    </label>
                    <input
                      id="birthday"
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-xs text-dd-text focus:border-blue-500/60 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2">
                      {t.settings.account.bannerImage}
                    </label>
                    <div className="space-y-3">
                      {bannerUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-dd-border h-24 bg-dd-surface/20">
                          <Image
                            src={bannerUrl}
                            alt={t.settings.account.bannerPreview}
                            width={800}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setBannerUrl('')}
                            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="h-24 border border-dd-border rounded-xl flex flex-col items-center justify-center text-white bg-dd-bg/20"
                          style={{ backgroundColor: AVATAR_BACKGROUNDS[selectedBannerColor] }}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wider">
                            {language === 'en' ? 'Color banner preview' : 'Prévia da cor do banner'}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUpload}
                          className="hidden"
                          id="settings-banner-upload"
                        />
                        <label
                          htmlFor="settings-banner-upload"
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-dd-border bg-dd-surface hover:bg-dd-border/60 text-dd-text rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
                        >
                          {uploadingBanner
                            ? t.settings.account.uploadingBanner
                            : t.settings.account.uploadBanner}
                        </label>
                        {bannerUrl && (
                          <button
                            type="button"
                            onClick={() => setBannerUrl('')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-dd-border bg-dd-bg hover:bg-dd-border/60 text-dd-muted hover:text-dd-text rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
                          >
                            {language === 'en'
                              ? 'Use a color instead'
                              : 'Usar uma cor em vez da imagem'}
                          </button>
                        )}
                      </div>
                      <div className="rounded-xl border border-dd-border/80 bg-dd-surface/50 p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-dd-muted">
                              {language === 'en' ? 'Banner color' : 'Cor do banner'}
                            </p>
                            <p className="mt-1 text-[11px] text-dd-muted">
                              {language === 'en'
                                ? 'Choose a color when you do not want to use an image.'
                                : 'Escolha uma cor quando não quiser usar uma imagem.'}
                            </p>
                          </div>
                          <div
                            aria-hidden="true"
                            className="h-8 w-8 shrink-0 rounded-full border-2 border-white/30 shadow-sm"
                            style={{ backgroundColor: AVATAR_BACKGROUNDS[selectedBannerColor] }}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2.5">
                          {AVATAR_BACKGROUNDS.map((color, index) => (
                            <button
                              key={color}
                              type="button"
                              aria-label={`${language === 'en' ? 'Banner color' : 'Cor do banner'} ${index + 1}`}
                              aria-pressed={selectedBannerColor === index}
                              onClick={() => {
                                setSelectedBannerColor(index);
                                setBannerUrl('');
                              }}
                              className={`relative h-8 w-8 rounded-full transition-all duration-150 cursor-pointer ${
                                selectedBannerColor === index
                                  ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-dd-bg'
                                  : 'opacity-75 hover:scale-105 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: color }}
                            >
                              {selectedBannerColor === index && (
                                <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow stroke-[3]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      htmlFor="bio"
                    >
                      <FileText className="w-3.5 h-3.5 text-dd-muted" />
                      {t.settings.account.bio}
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full text-xs rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-dd-text placeholder-slate-600 focus:border-blue-500/60 focus:outline-none resize-none transition-colors"
                      placeholder={t.settings.account.bioPlaceholder}
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-dd-border">
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors hover:bg-blue-600 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      {updating ? t.settings.account.saving : t.settings.account.saveChanges}
                    </button>
                  </div>
                </form>

                {usernameConfirmOpen && (
                  <div
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="settings-username-confirm-title"
                  >
                    <button
                      type="button"
                      aria-label={language === 'en' ? 'Close confirmation' : 'Fechar confirmação'}
                      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                      onClick={() => setUsernameConfirmOpen(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-2xl border border-dd-border bg-dd-bg p-5 shadow-2xl">
                      <h3
                        id="settings-username-confirm-title"
                        className="text-base font-extrabold text-dd-text"
                      >
                        {language === 'en' ? 'Change username?' : 'Alterar username?'}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-dd-muted">
                        {language === 'en'
                          ? `Do you want to change your username to @${username}? You can change it again after 7 days.`
                          : `Você deseja mudar seu username para @${username}? Essa alteração só poderá ser feita novamente após 7 dias.`}
                      </p>
                      <div className="mt-5 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setUsernameConfirmOpen(false)}
                          className="rounded-full border border-dd-border px-4 py-2 text-xs font-bold text-dd-muted hover:text-dd-text"
                        >
                          {language === 'en' ? 'Cancel' : 'Cancelar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUsernameConfirmOpen(false);
                            void performUpdateProfile();
                          }}
                          className="rounded-full bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600"
                        >
                          {language === 'en' ? 'Confirm change' : 'Confirmar alteração'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'aparencia' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dd-muted uppercase tracking-wider mb-1">
                    {t.settings.appearance.heading}
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    {t.settings.appearance.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dark Theme Card */}
                  <button
                    type="button"
                    onClick={() => changeTheme('dark')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-500/[0.03] text-dd-text shadow-[0_0_15px_rgba(0, 131, 254,0.05)]'
                        : 'border-dd-border bg-dd-bg/40 text-dd-muted hover:border-dd-border/80 hover:text-dd-text'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Moon
                        className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-dd-muted'}`}
                      />
                      {theme === 'dark' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-bold">{t.settings.appearance.darkTitle}</p>
                      <p className="text-[10px] text-dd-muted mt-0.5 font-semibold leading-normal">
                        {t.settings.appearance.darkDescription}
                      </p>
                    </div>
                  </button>

                  {/* Light Theme Card */}
                  <button
                    type="button"
                    onClick={() => changeTheme('light')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-500/[0.03] text-dd-text shadow-[0_0_15px_rgba(0, 131, 254,0.05)]'
                        : 'border-dd-border bg-dd-bg/40 text-dd-muted hover:border-dd-border/80 hover:text-dd-text'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Sun
                        className={`w-5 h-5 ${theme === 'light' ? 'text-amber-500' : 'text-dd-muted'}`}
                      />
                      {theme === 'light' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-bold">{t.settings.appearance.lightTitle}</p>
                      <p className="text-[10px] text-dd-muted mt-0.5 font-semibold leading-normal">
                        {t.settings.appearance.lightDescription}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'sons' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dd-muted uppercase tracking-wider mb-1">
                    {t.settings.sounds.heading}
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    {t.settings.sounds.description}
                  </p>
                </div>

                <div className="space-y-3 rounded-xl border border-dd-border bg-dd-surface p-4 text-sm shadow-sm select-none">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-dd-text font-bold tracking-wide flex items-center gap-2">
                      {soundEnabled ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-blue-500 animate-pulse animate-duration-1000"
                        >
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-dd-muted"
                        >
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                      )}
                      {t.settings.sounds.platformEffects}
                    </span>
                    <button
                      type="button"
                      onClick={toggleSound}
                      aria-pressed={soundEnabled}
                      className={`px-4 py-2 rounded-lg border text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                        soundEnabled
                          ? 'bg-blue-500 border-blue-600 text-white shadow-md shadow-blue-500/10 hover:bg-blue-600'
                          : 'bg-dd-surface border-dd-border text-dd-muted hover:text-dd-text hover:bg-dd-border/30'
                      }`}
                    >
                      {soundEnabled ? t.settings.sounds.on : t.settings.sounds.off}
                    </button>
                  </div>
                  {soundFeedback && (
                    <p
                      role="status"
                      aria-live="polite"
                      className="text-[11px] font-medium text-dd-muted"
                    >
                      {soundFeedback === 'enabled'
                        ? t.settings.sounds.enabledFeedback
                        : t.settings.sounds.disabledFeedback}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'idioma' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dd-muted uppercase tracking-wider mb-1">
                    {t.settings.language.heading}
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    {t.settings.language.description}
                  </p>
                </div>

                <div
                  className="space-y-3"
                  role="radiogroup"
                  aria-label={t.settings.language.heading}
                >
                  {[
                    {
                      code: 'pt' as const,
                      title: t.settings.language.portuguese,
                      description: t.settings.language.portugueseDescription,
                      flag: '/flags/flag-br.png',
                    },
                    {
                      code: 'en' as const,
                      title: t.settings.language.english,
                      description: t.settings.language.englishDescription,
                      flag: '/flags/flag-us.png',
                    },
                  ].map((option) => {
                    const isSelected = language === option.code;

                    return (
                      <button
                        key={option.code}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setLanguage(option.code)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/[0.04] text-dd-text'
                            : 'border-dd-border bg-dd-surface text-dd-muted hover:border-dd-border/80 hover:text-dd-text'
                        }`}
                      >
                        <Image
                          src={option.flag}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0 rounded-md object-cover"
                          unoptimized
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold">{option.title}</span>
                          <span className="mt-0.5 block text-[11px] font-medium leading-relaxed text-dd-muted">
                            {option.description}
                          </span>
                        </span>
                        {isSelected && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                            <Check className="h-3.5 w-3.5" />
                            {t.settings.language.selected}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'acoes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
                    {t.settings.actions.heading}
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    {t.settings.actions.description}
                  </p>
                </div>

                <div className="bg-dd-surface border border-dd-border rounded-xl p-6 space-y-4 backdrop-blur-sm shadow-sm">
                  <p className="text-dd-muted text-xs leading-relaxed">
                    {t.settings.actions.notice}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 text-xs font-bold px-5 py-2.5 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.settings.actions.signOut}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
