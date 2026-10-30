import type { Metadata } from 'next';
import { CommunityPage } from '@/components/community/CommunityPage';

export const metadata: Metadata = {
  title: 'Diretrizes da comunidade | Stacklyst',
  description:
    'Diretrizes para compartilhar conhecimento com respeito no Stacklyst. Saiba como publicar, denunciar e bloquear usuários.',
};

export default function GuidelinesPage() {
  return <CommunityPage kind="guidelines" />;
}
