'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { getCurrentUser, invalidateCurrentUser } from '@/lib/client/current-user';
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
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [institution, setInstitution] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [pronouns, setPronouns] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Layout states for Twitter-like UI
  const [activeTab, setActiveTab] = useState<'sua-conta' | 'aparencia' | 'sons' | 'acoes'>(
    'sua-conta'
  );
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

  useEffect(() => {
    setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
  }, []);

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('stacklyst-sound', String(newVal));
    window.dispatchEvent(new Event('stacklyst-sound-changed'));
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
        setBio(profileData.bio || '');
        setInstitution(profileData.institution || '');
        setGithubUsername(profileData.github_username || '');
        setDiscordUsername(profileData.discord_username || '');
        setBannerUrl(profileData.banner_url || '');
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
          bio,
          institution,
          github_username: githubUsername,
          discord_username: discordUsername,
          banner_url: bannerUrl,
          pronouns,
          birthday,
        }),
      });

      if (res.ok) {
        invalidateCurrentUser();
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao atualizar dados.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro interno no servidor.');
    } finally {
      setUpdating(false);
    }
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
      title: 'Sua conta',
      description: 'Veja informações sobre seu perfil público, biografia e redes sociais.',
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
      title: 'Aparência',
      description: 'Personalize a exibição visual da plataforma (Modo Claro vs Modo Escuro).',
      icon: Sun,
      keywords: ['aparencia', 'tema', 'claro', 'escuro', 'light', 'dark', 'visual'],
    },
    {
      id: 'sons',
      title: 'Efeitos sonoros',
      description: 'Ative ou desative os efeitos sonoros das interações da plataforma.',
      icon: Volume2,
      keywords: ['sons', 'efeito', 'sonoro', 'audio', 'sound', 'barulho', 'volume'],
    },
    {
      id: 'acoes',
      title: 'Ações da conta',
      description: 'Encerre sua sessão de desenvolvimento ativa ou faça logout.',
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
              <p className="text-xs text-dd-muted">Carregando configurações...</p>
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
            <h1 className="text-lg font-extrabold text-dd-text">Configurações</h1>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-dd-border/50">
            <div className="relative flex items-center bg-dd-surface/40 border border-dd-border rounded-full px-3 py-1.5 focus-within:border-blue-500/80 focus-within:bg-dd-bg transition-all">
              <Search className="w-4 h-4 text-dd-muted mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar configuração"
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
                Nenhuma configuração encontrada
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
                      setActiveTab(tab.id as any);
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
                    Informações Públicas
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    Atualize os dados públicos do seu perfil, como biografia, instituição de
                    ensino/trabalho e redes sociais.
                  </p>
                </div>

                {success && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Perfil atualizado com sucesso!</span>
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
                      Nome de Usuário (Não pode ser alterado)
                    </label>
                    <input
                      id="username"
                      type="text"
                      disabled
                      value={user?.username || ''}
                      className="w-full rounded-lg border border-dd-border bg-dd-bg/40 px-4 py-2 text-xs text-dd-muted cursor-not-allowed focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      htmlFor="institution"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-dd-muted" />
                      Instituição / Empresa
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
                      Nome de Usuário do GitHub
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
                      Nome de Usuário do Discord
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
                      Pronomes
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
                      Data de Nascimento
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
                      Imagem de Banner do Perfil
                    </label>
                    <div className="space-y-3">
                      {bannerUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-dd-border h-24 bg-dd-surface/20">
                          <Image
                            src={bannerUrl}
                            alt="Banner Preview"
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
                        <div className="h-24 border border-dashed border-dd-border rounded-xl flex flex-col items-center justify-center text-dd-muted bg-dd-bg/20">
                          <p className="text-[10px] font-semibold uppercase tracking-wider">
                            Nenhuma imagem de banner
                          </p>
                        </div>
                      )}
                      <div>
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
                          {uploadingBanner ? 'Enviando...' : 'Alterar Imagem de Banner'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold text-dd-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      htmlFor="bio"
                    >
                      <FileText className="w-3.5 h-3.5 text-dd-muted" />
                      Biografia / Sobre Mim
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full text-xs rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-dd-text placeholder-slate-600 focus:border-blue-500/60 focus:outline-none resize-none transition-colors"
                      placeholder="Fale um pouco sobre você, tecnologias favoritas..."
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-dd-border">
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors hover:bg-blue-600 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      {updating ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'aparencia' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dd-muted uppercase tracking-wider mb-1">
                    Aparência da Plataforma
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    Escolha a sua preferência de exibição visual para navegar na rede.
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
                      <p className="text-xs font-bold">Modo Escuro</p>
                      <p className="text-[10px] text-dd-muted mt-0.5 font-semibold leading-normal">
                        Foco no código e menor fadiga ocular.
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
                      <p className="text-xs font-bold">Modo Claro</p>
                      <p className="text-[10px] text-dd-muted mt-0.5 font-semibold leading-normal">
                        Estilo limpo e alto contraste de leitura.
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
                    Efeitos Sonoros
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    Ative ou desative os sons de interações (curtidas, notificações e recompensas).
                  </p>
                </div>

                <div className="flex justify-between items-center bg-dd-surface border border-dd-border rounded-xl p-4 text-sm backdrop-blur-sm shadow-sm select-none">
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
                    Efeitos Sonoros da Plataforma
                  </span>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className={`px-4 py-2 rounded-lg border text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                      soundEnabled
                        ? 'bg-blue-500 border-blue-600 text-white shadow-md shadow-blue-500/10 hover:bg-blue-600'
                        : 'bg-dd-surface border-dd-border text-dd-muted hover:text-dd-text hover:bg-dd-border/30'
                    }`}
                  >
                    {soundEnabled ? 'LIGADO' : 'DESLIGADO'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'acoes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
                    Ações da Conta
                  </h3>
                  <p className="text-xs text-dd-muted leading-relaxed">
                    Encerre sua sessão de desenvolvimento atual no dispositivo.
                  </p>
                </div>

                <div className="bg-dd-surface border border-dd-border rounded-xl p-6 space-y-4 backdrop-blur-sm shadow-sm">
                  <p className="text-dd-muted text-xs leading-relaxed">
                    Para trocar de conta ou sair do Stacklyst, utilize o botão abaixo.
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 text-xs font-bold px-5 py-2.5 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair da Conta (Logout)
                  </button>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-dd-border/40">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
