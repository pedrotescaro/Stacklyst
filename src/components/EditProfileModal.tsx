'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Camera, Loader2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { AVATAR_BACKGROUNDS, normalizeAvatarConfig } from '@/lib/avatar';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profileUser: {
    id?: string;
    name?: string | null;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    bio?: string | null;
    institution?: string | null;
    github_username?: string | null;
    discord_username?: string | null;
    banner_url?: string | null;
    pronouns?: string | null;
    birthday?: string | null;
    username_changed_at?: string | null;
  };
  onSaved: (updatedFields: Record<string, any>) => void;
}

export function EditProfileModal({ open, onClose, profileUser, onSaved }: EditProfileModalProps) {
  const { language, text } = useLocalizedText();
  const initialName =
    profileUser.name ||
    (profileUser.avatar_config as any)?.name ||
    (profileUser.avatar_config as any)?.displayName ||
    profileUser.username ||
    '';

  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(profileUser.username || '');
  const [bio, setBio] = useState(profileUser.bio || '');
  const [institution, setInstitution] = useState(profileUser.institution || '');
  const [githubUsername, setGithubUsername] = useState(profileUser.github_username || '');
  const [discordUsername, setDiscordUsername] = useState(profileUser.discord_username || '');
  const [bannerUrl, setBannerUrl] = useState(profileUser.banner_url || '');
  const [pronouns, setPronouns] = useState(profileUser.pronouns || '');
  const [birthday, setBirthday] = useState(
    profileUser.birthday ? profileUser.birthday.split('T')[0] : ''
  );

  const [selectedBg, setSelectedBg] = useState<number>(() => {
    const avatar = normalizeAvatarConfig(profileUser.avatar_config, profileUser.username);
    return avatar.background;
  });

  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameConfirmOpen, setUsernameConfirmOpen] = useState(false);
  const [usernameChangeAvailableAt, setUsernameChangeAvailableAt] = useState<string | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Sync fields when modal opens
  useEffect(() => {
    if (open) {
      const currentName =
        profileUser.name ||
        (profileUser.avatar_config as any)?.name ||
        (profileUser.avatar_config as any)?.displayName ||
        profileUser.username ||
        '';
      setName(currentName);
      setUsername(profileUser.username || '');
      setBio(profileUser.bio || '');
      setInstitution(profileUser.institution || '');
      setGithubUsername(profileUser.github_username || '');
      setDiscordUsername(profileUser.discord_username || '');
      setBannerUrl(profileUser.banner_url || '');
      setPronouns(profileUser.pronouns || '');
      setBirthday(profileUser.birthday ? profileUser.birthday.split('T')[0] : '');
      const avatar = normalizeAvatarConfig(profileUser.avatar_config, profileUser.username);
      setSelectedBg(avatar.background);
      setError(null);
      setUsernameConfirmOpen(false);
      const availableAt = profileUser.username_changed_at
        ? new Date(profileUser.username_changed_at).getTime() + 7 * 24 * 60 * 60 * 1000
        : 0;
      setUsernameChangeAvailableAt(
        availableAt > Date.now() ? new Date(availableAt).toISOString() : null
      );
    }
  }, [open, profileUser]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
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

  const performSave = async () => {
    const cleanName = name.trim() || username.trim();
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setError('O nome de usuário não pode ficar vazio.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const currentConfig = normalizeAvatarConfig(profileUser.avatar_config, profileUser.username);
      const updatedConfig = {
        ...currentConfig,
        background: selectedBg,
        name: cleanName,
        displayName: cleanName,
      };

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          username: cleanUsername,
          bio,
          institution,
          github_username: githubUsername.trim(),
          discord_username: discordUsername.trim(),
          banner_url: bannerUrl,
          pronouns,
          birthday,
          avatar_config: updatedConfig,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setUsernameChangeAvailableAt(data.usernameChangeAvailableAt || null);
        }
        setError(data.error || 'Erro ao salvar perfil.');
        return;
      }

      onSaved({
        name: cleanName,
        username: data.username || cleanUsername,
        bio,
        institution,
        github_username: githubUsername.trim(),
        discord_username: discordUsername.trim(),
        banner_url: bannerUrl,
        pronouns,
        birthday: birthday || null,
        username_changed_at:
          data.username_changed_at ||
          (cleanUsername !== profileUser.username.toLowerCase()
            ? new Date().toISOString()
            : profileUser.username_changed_at || null),
        avatar_config: data.avatar_config || updatedConfig,
      });
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Erro de conexão ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const cleanUsername = username.trim().toLowerCase();
    const cooldownEndsAt = profileUser.username_changed_at
      ? new Date(profileUser.username_changed_at).getTime() + 7 * 24 * 60 * 60 * 1000
      : 0;
    if (cleanUsername !== profileUser.username.toLowerCase() && cooldownEndsAt > Date.now()) {
      setUsernameChangeAvailableAt(new Date(cooldownEndsAt).toISOString());
      setError(
        text(
          'Você só poderá mudar o username novamente após 7 dias.',
          'You can change your username again after 7 days.'
        )
      );
      return;
    }
    if (cleanUsername !== profileUser.username.toLowerCase()) {
      setError(null);
      setUsernameConfirmOpen(true);
      return;
    }
    await performSave();
  };

  const currentBgColor = AVATAR_BACKGROUNDS[selectedBg] || AVATAR_BACKGROUNDS[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-[600px] max-h-[90vh] bg-dd-bg rounded-2xl overflow-hidden mt-8 mx-4 flex flex-col shadow-2xl border border-dd-border/60"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dd-border/60 shrink-0">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-dd-surface/80 text-dd-text transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-base font-extrabold text-dd-text">Editar perfil</h2>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-1.5 bg-dd-text text-dd-bg rounded-full text-sm font-extrabold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-grow">
              {/* Banner Section with Live Background Color */}
              <div
                className="relative h-40 sm:h-48 transition-colors duration-200"
                style={{ backgroundColor: currentBgColor }}
              >
                {bannerUrl ? (
                  <Image src={bannerUrl} alt="Banner" fill sizes="100%" className="object-cover" />
                ) : null}

                {/* Banner overlay with camera buttons */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/25">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="p-2.5 bg-black/60 hover:bg-black/75 rounded-full text-white transition-colors cursor-pointer shadow-md hover:scale-105"
                    title="Alterar imagem de banner"
                  >
                    {uploadingBanner ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </button>
                  {bannerUrl && (
                    <button
                      type="button"
                      onClick={() => setBannerUrl('')}
                      className="p-2.5 bg-black/60 hover:bg-black/75 rounded-full text-white transition-colors cursor-pointer shadow-md hover:scale-105"
                      title="Remover imagem do banner"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </div>

              {/* Avatar (overlapping banner) */}
              <div className="px-4 -mt-12 relative z-10 mb-4 flex items-end justify-between">
                <div>
                  {profileUser.avatar_url ? (
                    <Image
                      src={profileUser.avatar_url}
                      alt={profileUser.username}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full border-4 border-dd-bg object-cover bg-dd-surface shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-dd-bg bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl font-black shadow-md">
                      {profileUser.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="px-4 pb-6 space-y-5">
                {/* Error Alert */}
                {error && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 flex items-center gap-2.5 text-xs text-rose-300 font-bold animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Background Color Palette Selection */}
                <div className="space-y-2 rounded-xl border border-dd-border/80 bg-dd-surface/50 p-3.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-dd-muted flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    Cor do Fundo do Perfil
                  </label>
                  <p className="text-[11px] text-dd-muted">
                    Escolha a cor de destaque do banner e avatar do seu perfil:
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {AVATAR_BACKGROUNDS.map((color, idx) => {
                      const isSelected = selectedBg === idx;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedBg(idx)}
                          style={{ backgroundColor: color }}
                          className={cn(
                            'w-8 h-8 rounded-full transition-all duration-150 relative flex items-center justify-center cursor-pointer shadow-sm',
                            isSelected
                              ? 'ring-2 ring-white scale-110 shadow-md ring-offset-2 ring-offset-dd-bg'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          )}
                          title={`Cor ${idx + 1}`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white drop-shadow stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Name */}
                <div className="relative group">
                  <label className="absolute top-2.5 left-3 text-[11px] font-bold text-dd-muted pointer-events-none z-10 uppercase tracking-wider">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    required
                    className="w-full pt-8 pb-2.5 px-3 border border-dd-border rounded-xl bg-transparent text-sm text-dd-text font-black focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                    placeholder="ex: Pedro Tescaro"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[10px] text-dd-muted font-mono">
                    {name.length}/50
                  </span>
                </div>

                {/* Username */}
                <div className="relative group">
                  <label className="absolute top-2.5 left-3 text-[11px] font-bold text-dd-muted pointer-events-none z-10 uppercase tracking-wider">
                    Nome de Usuário (@username)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                    }
                    maxLength={30}
                    required
                    className="w-full pt-8 pb-2.5 px-3 border border-dd-border rounded-xl bg-transparent text-sm text-dd-text font-black focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                    placeholder="ex: pedrotescaro"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[10px] text-dd-muted font-mono">
                    {username.length}/30
                  </span>
                  {usernameChangeAvailableAt && (
                    <p className="mt-2 text-[11px] text-amber-300">
                      {text('Username bloqueado até', 'Username locked until')}{' '}
                      {new Date(usernameChangeAvailableAt).toLocaleDateString(
                        language === 'en' ? 'en-US' : 'pt-BR'
                      )}
                      .
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="relative group">
                  <label className="absolute top-2.5 left-3 text-[11px] font-bold text-dd-muted pointer-events-none uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={160}
                    className="w-full pt-8 pb-2.5 px-3 border border-dd-border rounded-xl bg-transparent text-sm text-dd-text resize-none focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Fale sobre você..."
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] text-dd-muted font-mono">
                    {bio.length}/160
                  </span>
                </div>

                {/* Institution */}
                <div className="relative group">
                  <label className="absolute top-2.5 left-3 text-[11px] font-bold text-dd-muted pointer-events-none z-10 uppercase tracking-wider">
                    Instituição / Empresa
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full pt-8 pb-2.5 px-3 border border-dd-border rounded-xl bg-transparent text-sm text-dd-text focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Ex: Fatec Ferraz, Vercel, Freelancer"
                  />
                </div>

                {/* GitHub Username */}
                <div className="relative group">
                  <label className="absolute top-2.5 left-3 text-[11px] font-bold text-dd-muted pointer-events-none z-10 uppercase tracking-wider">
                    Usuário do GitHub
                  </label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) =>
                      setGithubUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))
                    }
                    className="w-full pt-8 pb-2.5 px-3 border border-dd-border rounded-xl bg-transparent text-sm text-dd-text focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                    placeholder="ex: pedrotescaro"
                  />
                </div>

                {/* Discord Username */}
                <div className="relative group">
                  <label className="absolute top-2.5 left-3 text-[11px] font-bold text-dd-muted pointer-events-none z-10 uppercase tracking-wider">
                    Discord
                  </label>
                  <input
                    type="text"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    className="w-full pt-8 pb-2.5 px-3 border border-dd-border rounded-xl bg-transparent text-sm text-dd-text focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                    placeholder="seu-usuario-discord"
                  />
                </div>

                {/* Pronouns */}
                <div className="relative group">
                  <label className="absolute top-2.5 left-3 text-[11px] font-bold text-dd-muted pointer-events-none z-10 uppercase tracking-wider">
                    Pronomes
                  </label>
                  <input
                    type="text"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="w-full pt-8 pb-2.5 px-3 border border-dd-border rounded-xl bg-transparent text-sm text-dd-text focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                    placeholder="ele/dele, ela/dela, elu/delu"
                  />
                </div>

                {/* Birthday */}
                <div className="relative group">
                  <label className="absolute top-2.5 left-3 text-[11px] font-bold text-dd-muted pointer-events-none z-10 uppercase tracking-wider">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full pt-8 pb-2.5 px-3 border border-dd-border rounded-xl bg-transparent text-sm text-dd-text focus:border-blue-500 focus:outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {usernameConfirmOpen && (
              <motion.div
                className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="username-confirm-title"
              >
                <button
                  type="button"
                  aria-label={text('Fechar confirmação', 'Close confirmation')}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => setUsernameConfirmOpen(false)}
                />
                <motion.div
                  className="relative w-full max-w-sm rounded-2xl border border-dd-border bg-dd-bg p-5 shadow-2xl"
                  initial={{ scale: 0.95, y: 12 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 12 }}
                >
                  <h3 id="username-confirm-title" className="text-base font-extrabold text-dd-text">
                    {text('Alterar username?', 'Change username?')}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dd-muted">
                    {text(
                      `Você deseja mudar seu username para @${username.trim().toLowerCase()}?`,
                      `Do you want to change your username to @${username.trim().toLowerCase()}?`
                    )}{' '}
                    {text(
                      'Essa alteração só poderá ser feita novamente após 7 dias.',
                      'You can change it again after 7 days.'
                    )}
                  </p>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setUsernameConfirmOpen(false)}
                      className="rounded-full border border-dd-border px-4 py-2 text-xs font-bold text-dd-muted hover:text-dd-text"
                    >
                      {text('Cancelar', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameConfirmOpen(false);
                        void performSave();
                      }}
                      className="rounded-full bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600"
                    >
                      {text('Confirmar alteração', 'Confirm change')}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
