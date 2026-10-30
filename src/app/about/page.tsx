import type { Metadata } from 'next';
import { CommunityPage } from '@/components/community/CommunityPage';

export const metadata: Metadata = {
  title: 'Sobre o Stacklyst',
  description:
    'Conheça o Stacklyst: comunidade, prática de programação e evolução compartilhada com trilhas, níveis e desafios.',
};

export default function AboutPage() {
  return <CommunityPage kind="about" />;
}
