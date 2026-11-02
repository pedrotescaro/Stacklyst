import { useId } from 'react';
import {
  credentialBadgeIdPrefix,
  credentialBadgeTitle,
  renderCredentialBadgeContents,
} from '@/lib/credentials/badge-art';

export interface BadgeArtProps {
  language: string | null;
  kind: string;
  title?: string;
  size?: number;
  locked?: boolean;
}

export function BadgeArt({ language, kind, title, size = 112, locked = false }: BadgeArtProps) {
  const instanceId = useId();
  const options = { language, kind, title, locked, idPrefix: instanceId };
  const titleId = `${credentialBadgeIdPrefix(instanceId)}-title`;

  return (
    <svg
      viewBox="0 0 240 260"
      width={size}
      height={size * (260 / 240)}
      role="img"
      aria-labelledby={titleId}
      style={{ maxWidth: '100%', flexShrink: 0 }}
    >
      <title id={titleId}>{credentialBadgeTitle(options)}</title>
      <g dangerouslySetInnerHTML={{ __html: renderCredentialBadgeContents(options) }} />
    </svg>
  );
}
