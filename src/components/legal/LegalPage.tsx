'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

type LegalPageKind = 'privacy' | 'terms';

const content = {
  privacy: {
    pt: {
      eyebrow: 'Privacidade',
      title: 'Política de Privacidade',
      intro:
        'Esta página explica, de forma simples, quais dados o Stacklyst usa para oferecer uma comunidade segura e útil para desenvolvedores.',
      sections: [
        [
          'Dados que usamos',
          'Usamos os dados da sua conta, como nome de usuário, e-mail, perfil e atividade na plataforma, para autenticar você, exibir seu progresso e manter a comunidade funcionando.',
        ],
        [
          'Como protegemos seus dados',
          'Aplicamos controles de acesso e boas práticas de segurança para proteger as informações armazenadas. Nunca vendemos seus dados pessoais.',
        ],
        [
          'Compartilhamento',
          'Só compartilhamos informações quando isso é necessário para operar o serviço, cumprir uma obrigação legal ou proteger a segurança da comunidade.',
        ],
        [
          'Seus direitos',
          'Você pode revisar e atualizar os dados do seu perfil pelas configurações da conta. Para solicitar suporte sobre privacidade, entre em contato com a equipe do Stacklyst.',
        ],
      ],
    },
    en: {
      eyebrow: 'Privacy',
      title: 'Privacy Policy',
      intro:
        'This page explains, in simple terms, which data Stacklyst uses to provide a useful and safe community for developers.',
      sections: [
        [
          'Data we use',
          'We use account data such as your username, email, profile, and activity to authenticate you, show your progress, and keep the community working.',
        ],
        [
          'How we protect your data',
          'We apply access controls and security practices to protect stored information. We never sell your personal data.',
        ],
        [
          'Sharing',
          'We only share information when needed to operate the service, comply with a legal obligation, or protect the community’s safety.',
        ],
        [
          'Your rights',
          'You can review and update your profile data in account settings. For privacy support, contact the Stacklyst team.',
        ],
      ],
    },
  },
  terms: {
    pt: {
      eyebrow: 'Termos de Uso',
      title: 'Termos de Uso',
      intro:
        'Estes termos definem as regras básicas para usar o Stacklyst e participar da comunidade com respeito e responsabilidade.',
      sections: [
        [
          'Uso da plataforma',
          'Use o Stacklyst para aprender, compartilhar projetos e participar de discussões técnicas. Você é responsável pelas informações e pelo código que publica.',
        ],
        [
          'Boa convivência',
          'Não publique conteúdo ilegal, abusivo, discriminatório, enganoso ou que viole direitos de outras pessoas. Podemos remover conteúdo que ameace a segurança da comunidade.',
        ],
        [
          'Conta e acesso',
          'Mantenha suas credenciais protegidas e não use a conta de outra pessoa. Podemos limitar ou suspender contas que violem estes termos.',
        ],
        [
          'Atualizações',
          'Podemos ajustar estes termos quando o produto evoluir. A versão mais recente estará sempre disponível nesta página.',
        ],
      ],
    },
    en: {
      eyebrow: 'Terms of Use',
      title: 'Terms of Use',
      intro:
        'These terms define the basic rules for using Stacklyst and participating in the community with respect and responsibility.',
      sections: [
        [
          'Using the platform',
          'Use Stacklyst to learn, share projects, and join technical discussions. You are responsible for the information and code you publish.',
        ],
        [
          'Community conduct',
          'Do not publish illegal, abusive, discriminatory, misleading, or rights-infringing content. We may remove content that puts the community at risk.',
        ],
        [
          'Account and access',
          'Keep your credentials safe and do not use someone else’s account. We may limit or suspend accounts that violate these terms.',
        ],
        [
          'Updates',
          'We may update these terms as the product evolves. The latest version will always be available on this page.',
        ],
      ],
    },
  },
} as const;

export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  const { isEnglish } = useLanguage();
  const language = isEnglish ? 'en' : 'pt';
  const page = content[kind][language];

  return (
    <main className="min-h-svh bg-black px-5 py-6 text-white sm:px-8 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
            aria-label={isEnglish ? 'Back to home' : 'Voltar para a página inicial'}
          >
            <Image src="/logo.svg" alt="Stacklyst" width={30} height={30} />
            <span className="text-lg font-bold tracking-tight">Stacklyst</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-white/65 transition-colors hover:border-white/25 hover:text-white sm:inline-flex"
            >
              <ArrowLeft size={14} />
              {isEnglish ? 'Home' : 'Início'}
            </Link>
            <LanguageToggle />
          </div>
        </header>

        <article className="mt-20 max-w-3xl pb-24 sm:mt-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0085FE]">
            {page.eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
            {page.title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            {page.intro}
          </p>

          <div className="mt-16 divide-y divide-white/10 border-y border-white/10">
            {page.sections.map(([heading, body]) => (
              <section key={heading} className="grid gap-3 py-8 sm:grid-cols-[190px_1fr] sm:gap-10">
                <h2 className="text-base font-semibold text-white">{heading}</h2>
                <p className="text-sm leading-7 text-white/60">{body}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
