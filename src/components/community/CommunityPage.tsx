'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './CommunityPage.module.css';

type Kind = 'about' | 'guidelines';
type Section = { id: string; title: string; body: string; items?: string[] };
type PageContent = {
  title: string;
  intro: string;
  sections: Section[];
  close: string;
  action: string;
  href: string;
};

const content: Record<Kind, Record<'pt' | 'en', PageContent>> = {
  about: {
    pt: {
      title: 'Aprender é melhor em comunidade.',
      intro:
        'O Stacklyst é um espaço para quem programa — ou está começando. Aqui, compartilhar uma dúvida, praticar código e acompanhar sua evolução fazem parte da mesma jornada.',
      sections: [
        {
          id: 'proposito',
          title: 'Por que o Stacklyst existe',
          body: 'Aprender programação envolve tentativa, erro e troca. O Stacklyst reúne essas experiências para aproximar quem quer aprender de quem também tem algo a compartilhar. Você pode mostrar um projeto, pedir ajuda e construir conhecimento junto com outras pessoas.',
        },
        {
          id: 'comunidade',
          title: 'Uma comunidade que compartilha',
          body: 'No feed, dúvidas, descobertas e projetos viram conversas. Publique código, responda a outras pessoas e encontre novas perspectivas. Há espaço tanto para os primeiros passos quanto para discussões mais avançadas.',
        },
        {
          id: 'pratica',
          title: 'Prática que vira conhecimento',
          body: 'As trilhas conectam conhecimentos e exercícios de programação. Explore habilidades, escreva soluções e acompanhe o que já aprendeu. Conhecimentos compartilhados entre caminhos preservam seu progresso.',
        },
        {
          id: 'evolucao',
          title: 'Seu progresso fica visível',
          body: 'XP, níveis, ofensivas, conquistas e ranking ajudam a acompanhar a jornada. Duelos acrescentam desafios entre pessoas da comunidade. O nível aparece desde o primeiro passo: ele registra sua evolução na plataforma, sem definir seu valor ou resumir toda a sua experiência profissional.',
        },
        {
          id: 'convivencia',
          title: 'Espaço para diferentes trajetórias',
          body: 'Ninguém precisa saber tudo para participar. Uma boa comunidade respeita diferentes experiências, oferece críticas construtivas e dá crédito a quem contribui. As diretrizes explicam como cuidar desse espaço e usar as ferramentas de denúncia e bloqueio.',
        },
      ],
      close: 'Sua próxima descoberta pode começar com uma pergunta.',
      action: 'Explorar a comunidade',
      href: '/feed',
    },
    en: {
      title: 'Learning is better together.',
      intro:
        'Stacklyst is a place for people who code — and people just getting started. Sharing a question, practicing code and tracking your progress are part of the same journey.',
      sections: [
        {
          id: 'proposito',
          title: 'Why Stacklyst exists',
          body: 'Learning to code takes practice, mistakes and conversation. Stacklyst brings those experiences together, connecting people who want to learn with people who have something to share. Show a project, ask for help and build knowledge together.',
        },
        {
          id: 'comunidade',
          title: 'A community that shares',
          body: 'Questions, discoveries and projects become conversations in the feed. Publish code, answer other people and find new perspectives. There is room for first steps and advanced discussions alike.',
        },
        {
          id: 'pratica',
          title: 'Practice builds knowledge',
          body: 'Trails connect skills and programming exercises. Explore topics, write solutions and follow what you have learned. Knowledge shared across paths keeps your progress.',
        },
        {
          id: 'evolucao',
          title: 'Make your progress visible',
          body: 'XP, levels, streaks, achievements and rankings help you follow your journey. Duels add challenges between community members. Your level appears from the first step: it records progress on the platform, without defining your worth or representing all your professional experience.',
        },
        {
          id: 'convivencia',
          title: 'Room for different journeys',
          body: 'You do not need to know everything to participate. A good community respects different experiences, offers constructive criticism and credits contributors. The guidelines explain how to care for this space and use reporting and blocking tools.',
        },
      ],
      close: 'Your next discovery can start with a question.',
      action: 'Explore the community',
      href: '/feed',
    },
  },
  guidelines: {
    pt: {
      title: 'Diretrizes da comunidade',
      intro:
        'O Stacklyst cresce com a troca de conhecimento. Estas diretrizes ajudam a manter as conversas respeitosas, o aprendizado honesto e a comunidade acolhedora para quem está em qualquer nível.',
      sections: [
        {
          id: 'respeito',
          title: 'Respeite quem está do outro lado',
          body: 'Discuta ideias e código com respeito. Erros e perguntas fazem parte do aprendizado.',
          items: [
            'Não pratique assédio, ameaças, humilhação, discurso de ódio ou discriminação.',
            'Ofereça críticas construtivas. Explique o problema e, quando possível, indique um caminho para resolvê-lo.',
            'Não exponha uma pessoa por estar começando, por sua linguagem de preferência ou por seu nível na plataforma.',
          ],
        },
        {
          id: 'publicacoes',
          title: 'Publique para contribuir',
          body: 'Compartilhe dúvidas, projetos, descobertas e discussões relacionadas a tecnologia e desenvolvimento.',
          items: [
            'Dê contexto às perguntas e descreva o que tentou. Use blocos de código para facilitar a leitura.',
            'Evite spam, publicações repetidas, propaganda enganosa e links maliciosos.',
            'Sinalize conteúdo sensível e não publique material violento, abusivo ou de exploração.',
          ],
        },
        {
          id: 'privacidade',
          title: 'Proteja dados e acessos',
          body: 'Antes de publicar código, imagens ou arquivos, confira se não há informações privadas.',
          items: [
            'Não compartilhe senhas, tokens, chaves de API, documentos ou dados pessoais de outras pessoas.',
            'Não distribua malware nem use a comunidade para invadir sistemas, fraudar ou prejudicar terceiros.',
            'Se uma credencial for exposta, remova-a da publicação e revogue ou substitua o acesso no serviço de origem.',
          ],
        },
        {
          id: 'autoria',
          title: 'Dê crédito e seja transparente',
          body: 'Compartilhe referências e respeite as licenças do código e dos materiais que utilizar. Não apresente o trabalho de outra pessoa como seu. Quando uma solução usar ajuda externa ou ferramentas de IA, explique essa contribuição se ela for relevante para entender o que você fez.',
        },
        {
          id: 'aprendizado',
          title: 'Mantenha os desafios honestos',
          body: 'Trilhas, quizzes e duelos existem para praticar. Não manipule XP, votos ou resultados, não use contas combinadas para obter vantagem e não explore falhas para inflar o ranking. Encontrou um problema? Descreva-o sem expor dados ou instruções que prejudiquem outras pessoas.',
        },
        {
          id: 'seguranca',
          title: 'Use denúncia e bloqueio',
          body: 'Você pode escolher com quem interage e sinalizar conteúdo que viole estas diretrizes.',
          items: [
            'Para denunciar uma postagem, abra “Mais opções” e selecione “Denunciar”. Descreva o motivo com clareza.',
            'Para bloquear alguém, use a opção no perfil ou em “Mais opções” de uma postagem. O bloqueio oculta o conteúdo entre as duas contas, impede novas interações e remove os vínculos de seguir.',
            'Gerencie seus bloqueios em Configurações → Usuários bloqueados. Desbloquear não restaura os vínculos de seguir nem remove um bloqueio feito pela outra conta.',
            'Bloquear é uma escolha pessoal; denunciar sinaliza uma possível violação para análise. Uma ação não substitui a outra.',
          ],
        },
        {
          id: 'moderacao',
          title: 'Cuide deste espaço com a gente',
          body: 'Conteúdo e contas que violem as diretrizes podem estar sujeitos à moderação, incluindo remoção de publicações e restrições de acesso. As diretrizes podem ser atualizadas conforme a comunidade e as funcionalidades evoluem. Consulte também os Termos de Uso e a Política de Privacidade.',
        },
      ],
      close: 'Toda boa troca começa com respeito.',
      action: 'Conhecer o Stacklyst',
      href: '/about',
    },
    en: {
      title: 'Community guidelines',
      intro:
        'Stacklyst grows through shared knowledge. These guidelines help keep conversations respectful, learning honest and the community welcoming at every level.',
      sections: [
        {
          id: 'respeito',
          title: 'Respect the person behind the screen',
          body: 'Discuss ideas and code respectfully. Mistakes and questions are part of learning.',
          items: [
            'Do not harass, threaten, humiliate, discriminate or promote hate.',
            'Give constructive feedback. Explain the problem and, where possible, suggest a way forward.',
            'Do not shame anyone for being a beginner, their preferred language or their level on the platform.',
          ],
        },
        {
          id: 'publicacoes',
          title: 'Publish to contribute',
          body: 'Share questions, projects, discoveries and discussions about technology and development.',
          items: [
            'Provide context and describe what you have tried. Format code in code blocks.',
            'Avoid spam, repeated posts, misleading advertising and malicious links.',
            'Label sensitive content and do not publish violent, abusive or exploitative material.',
          ],
        },
        {
          id: 'privacidade',
          title: 'Protect data and credentials',
          body: 'Before publishing code, images or files, check for private information.',
          items: [
            'Do not share passwords, tokens, API keys, documents or other people’s personal data.',
            'Do not distribute malware or use the community to break into systems, commit fraud or harm others.',
            'If a credential is exposed, remove it from the post and revoke or replace it in the original service.',
          ],
        },
        {
          id: 'autoria',
          title: 'Credit others and be transparent',
          body: 'Share references and respect licenses for code and materials you use. Do not present someone else’s work as your own. If a solution uses outside help or AI tools, explain that contribution when it matters to understanding your work.',
        },
        {
          id: 'aprendizado',
          title: 'Keep challenges honest',
          body: 'Trails, quizzes and duels are for practice. Do not manipulate XP, votes or results, coordinate accounts for unfair advantages or exploit bugs to inflate rankings. If you find a problem, describe it without exposing data or instructions that harm others.',
        },
        {
          id: 'seguranca',
          title: 'Use reporting and blocking',
          body: 'You can choose who you interact with and flag content that violates these guidelines.',
          items: [
            'To report a post, open “More options” and choose “Report”. Clearly describe the reason.',
            'To block someone, use the option on their profile or in a post’s “More options”. Blocking hides content between both accounts, prevents new interactions and removes follows.',
            'Manage blocks in Settings → Blocked users. Unblocking does not restore follows or remove a block placed by the other account.',
            'Blocking is a personal choice; reporting flags a possible violation for review. One does not replace the other.',
          ],
        },
        {
          id: 'moderacao',
          title: 'Help care for this space',
          body: 'Content and accounts that violate these guidelines may be subject to moderation, including post removal and access restrictions. Guidelines may be updated as the community and features evolve. Also read the Terms of Use and Privacy Policy.',
        },
      ],
      close: 'Every good conversation starts with respect.',
      action: 'Get to know Stacklyst',
      href: '/about',
    },
  },
};

export function CommunityPage({ kind }: { kind: Kind }) {
  const { isEnglish } = useLanguage();
  const page = content[kind][isEnglish ? 'en' : 'pt'];
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main-content">
        {isEnglish ? 'Skip to content' : 'Pular para o conteúdo'}
      </a>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" title={isEnglish ? 'Stacklyst home' : 'Início do Stacklyst'}>
            <BrandLogo size={28} />
          </Link>
          <div className={styles.headerActions}>
            <Link href="/feed" aria-label={isEnglish ? 'Feed' : 'Voltar ao feed'}>
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{isEnglish ? 'Feed' : 'Voltar ao feed'}</span>
            </Link>
            <LanguageToggle />
          </div>
        </header>
        <main id="main-content">
          <div className={styles.intro}>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
          </div>
          <div className={styles.reading}>
            <nav className={styles.index} aria-label={isEnglish ? 'On this page' : 'Nesta página'}>
              <p>{isEnglish ? 'On this page' : 'Nesta página'}</p>
              {page.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
            <article
              className={styles.article}
              aria-label={
                kind === 'about'
                  ? isEnglish
                    ? 'About Stacklyst'
                    : 'Sobre o Stacklyst'
                  : page.title
              }
            >
              {page.sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  {section.items && (
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
              <div className={styles.close}>
                <h2>{page.close}</h2>
                <Link href={page.href}>
                  {page.action}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                {kind === 'about' && (
                  <Link href="/guidelines">
                    {isEnglish
                      ? 'Read the community guidelines'
                      : 'Ler as diretrizes da comunidade'}
                  </Link>
                )}
              </div>
            </article>
          </div>
        </main>
        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} Stacklyst</span>
          <nav aria-label={isEnglish ? 'Useful links' : 'Links úteis'}>
            <Link href="/about" aria-current={kind === 'about' ? 'page' : undefined}>
              {isEnglish ? 'About' : 'Sobre'}
            </Link>
            <Link href="/guidelines" aria-current={kind === 'guidelines' ? 'page' : undefined}>
              {isEnglish ? 'Guidelines' : 'Diretrizes'}
            </Link>
            <Link href="/privacy">{isEnglish ? 'Privacy' : 'Privacidade'}</Link>
            <Link href="/terms">{isEnglish ? 'Terms' : 'Termos'}</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
