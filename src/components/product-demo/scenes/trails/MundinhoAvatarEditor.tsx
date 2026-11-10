'use client';

import { ArrowLeft, Check, RotateCcw, RotateCw } from 'lucide-react';
import { ColorPalette, PROFILE_COLORS } from '@/components/ColorPalette';
import { HAIR, OUTFIT, OUTFIT_SPECS, PixelAvatar, SKIN } from '@/components/mundinho/PixelArt';
import { Portrait } from '@/components/mundinho/Portrait';
import { Coin } from '@/components/mundinho/PixelArt';
import { ITEMS, type Avatar } from '@/lib/mundinho/types';
import {
  avatarHairColor,
  LEGACY_HAIR_NAMES,
  NATURAL_HAIR_OPTIONS,
} from '@/lib/mundinho/hair-colors';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { Cascade, CascadeItem } from '../../demo-motion';
import '@/components/mundinho/mundinho.css';

const ASSET_BASE = '/assets/mundinho';
const noop = () => {};

export type AvatarCategory = Exclude<keyof Avatar, 'hairTint' | 'gender'>;

const hairColors = [
  ...new Set([...HAIR, ...NATURAL_HAIR_OPTIONS.map((item) => item.color), ...PROFILE_COLORS]),
];
const hairColorNames = hairColors.map(
  (color) =>
    LEGACY_HAIR_NAMES[HAIR.indexOf(color)] ??
    NATURAL_HAIR_OPTIONS.find((item) => item.color === color)?.name ??
    color
);

export interface MundinhoAvatarEditorProps {
  draft: Avatar;
  category: AvatarCategory;
  direction?: number;
  /** Items the player owns; locked tiles show their price, as in the hub. */
  inventory?: string[];
  saved?: boolean;
  savePressed?: boolean;
}

/**
 * Projection of `AdventureHub`'s avatar view: checkerboard preview, portrait
 * with silhouette choice, category tabs, hair palette and the option grid.
 */
export function MundinhoAvatarEditor({
  draft,
  category,
  direction = 0,
  inventory = [],
  saved = false,
  savePressed = false,
}: MundinhoAvatarEditorProps) {
  const { text } = useLocalizedText();
  const tabs: Array<{ id: AvatarCategory; label: string }> = [
    { id: 'skin', label: text('Corpo', 'Body') },
    { id: 'eyes', label: text('Olhos', 'Eyes') },
    { id: 'outfit', label: text('Roupas', 'Outfits') },
    { id: 'hair', label: text('Cabelo', 'Hair') },
    { id: 'accessory', label: text('Acessórios', 'Accessories') },
  ];
  const counts: Record<AvatarCategory, number> = {
    skin: SKIN.length,
    eyes: 5,
    hair: 6,
    hairColor: HAIR.length,
    outfit: OUTFIT.length,
    accessory: 6,
  };
  const tileLabel = (index: number) =>
    category === 'outfit'
      ? OUTFIT_SPECS[index].name
      : `${
          category === 'hair'
            ? text('Cabelo', 'Hair')
            : category === 'skin'
              ? text('Corpo', 'Body')
              : category === 'eyes'
                ? text('Olhos', 'Eyes')
                : text('Acessório', 'Accessory')
        } ${index + 1}`;

  return (
    <Cascade className="adventure adventure-avatar">
      <CascadeItem as="header" className="ad-page-heading">
        <span
          className="ad-back-button"
          aria-label={text('Voltar para a tela inicial', 'Back to the home screen')}
        >
          <ArrowLeft size={22} />
        </span>
        <div className="ad-heading-text">
          <h1>Avatar</h1>
        </div>
        <button type="button" className="ad-save-pill" data-pressed={savePressed} tabIndex={-1}>
          {text('Salvar', 'Save')}
        </button>
      </CascadeItem>

      {saved && (
        <div className="ad-notice" role="status">
          <Check size={18} />
          <span>
            {text(
              'Avatar salvo! Visual atualizado no mundo e nas batalhas.',
              'Avatar saved! Your look is updated in the world and in battles.'
            )}
          </span>
        </div>
      )}

      <div className="ad-avatar-editor-view">
        <CascadeItem className="ad-checkerboard-preview">
          <span className="ad-rotate-btn" aria-label={text('Girar à esquerda', 'Rotate left')}>
            <RotateCcw size={22} />
          </span>
          <div className="ad-avatar-preview-box">
            <PixelAvatar avatar={draft} direction={['down', 'right', 'up', 'left'][direction]} />
          </div>
          <span className="ad-rotate-btn" aria-label={text('Girar à direita', 'Rotate right')}>
            <RotateCw size={22} />
          </span>
        </CascadeItem>

        <CascadeItem
          as="section"
          className="ad-portrait-editor"
          aria-label={text('Retrato de diálogo', 'Dialogue portrait')}
        >
          <Portrait
            avatar={draft}
            name={text('Seu personagem', 'Your character')}
            assetBase={ASSET_BASE}
          />
          <div>
            <h2>{text('Seu retrato nas conversas', 'Your portrait in conversations')}</h2>
            <p>
              {text(
                'Pele, olhos, cabelo, roupas e acessórios acompanham suas escolhas.',
                'Skin, eyes, hair, outfits and accessories follow your choices.'
              )}
            </p>
            <fieldset className="ad-gender-picker">
              <legend>{text('Gênero do personagem', 'Character gender')}</legend>
              {(
                [
                  { value: 'masculine', label: text('Masculino', 'Masculine') },
                  { value: 'feminine', label: text('Feminino', 'Feminine') },
                ] as const
              ).map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="demo-portrait-gender"
                    value={option.value}
                    checked={(draft.gender ?? 'masculine') === option.value}
                    onChange={noop}
                    tabIndex={-1}
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
            <p className="ad-portrait-note">
              {text(
                'Define as feições do personagem e do retrato. Todas as peças podem ser usadas nas duas opções.',
                'Sets the features of the character and the portrait. Every piece works with both options.'
              )}
            </p>
          </div>
        </CascadeItem>

        <CascadeItem className="ad-category-tabs-row" role="tablist">
          {tabs.map((tab) => (
            <span
              key={tab.id}
              role="tab"
              aria-selected={category === tab.id}
              className={`ad-category-tab ${category === tab.id ? 'is-selected' : ''}`}
            >
              {tab.label}
            </span>
          ))}
        </CascadeItem>

        {category === 'hair' && (
          <section className="ad-hair-colors" aria-label={text('Cor do cabelo', 'Hair color')}>
            <h2>{text('Cor do cabelo', 'Hair color')}</h2>
            <ColorPalette
              aria-label={text('Cor do cabelo', 'Hair color')}
              colors={hairColors}
              names={hairColorNames}
              value={avatarHairColor(draft)}
              onChange={noop}
              disabled
            />
          </section>
        )}

        <CascadeItem className="ad-options-grid-three">
          {Array.from({ length: counts[category] || 4 }, (_, index) => {
            const isSelected = draft[category] === index;
            const item = ITEMS.find(
              (entry) => entry.category === category && entry.value === index
            );
            const locked = Boolean(item && !inventory.includes(item.id));
            return (
              <button
                key={index}
                type="button"
                className={`ad-option-tile ${isSelected ? 'is-selected' : ''}`}
                aria-label={tileLabel(index)}
                aria-pressed={isSelected}
                title={category === 'outfit' ? OUTFIT_SPECS[index].name : undefined}
                tabIndex={-1}
              >
                {isSelected && (
                  <div className="ad-option-checkmark">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
                <div className="ad-option-avatar-inner">
                  <PixelAvatar
                    avatar={
                      category === 'skin'
                        ? { ...draft, skin: index, hair: -1, outfit: -1, accessory: 0 }
                        : { ...draft, [category]: index }
                    }
                  />
                </div>
                {locked && (
                  <div className="ad-option-locked-badge">
                    <Coin className="h-3.5 w-3.5" />
                    <span>{item?.price}</span>
                  </div>
                )}
              </button>
            );
          })}
        </CascadeItem>
      </div>
    </Cascade>
  );
}
