'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactCodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => (
    <div className="bg-dd-card rounded-lg border border-dd-border flex items-center justify-center text-dd-muted text-sm min-h-[200px]">
      Carregando editor...
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  autocompletion?: boolean;
  ariaLabel?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'JS',
  height = '300px',
  readOnly = false,
  autocompletion = false,
  ariaLabel = 'Editor de código',
}: CodeEditorProps) {
  return (
    <CodeEditorInner
      value={value}
      onChange={onChange}
      language={language}
      height={height}
      readOnly={readOnly}
      autocompletion={autocompletion}
      ariaLabel={ariaLabel}
    />
  );
}

/** Inner component that handles dynamic language extension loading */
function CodeEditorInner({
  value,
  onChange,
  language = 'JS',
  height = '300px',
  readOnly = false,
  autocompletion = false,
  ariaLabel = 'Editor de código',
}: CodeEditorProps) {
  const [extensions, setExtensions] = useState<import('@codemirror/state').Extension[]>([]);
  const [darkTheme, setDarkTheme] = useState<import('@codemirror/state').Extension | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Track the application theme (dark class on documentElement)
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Dynamically load language extension and dark theme
  useEffect(() => {
    let cancelled = false;

    async function loadExtensions() {
      try {
        const [themeModule, langModule] = await Promise.all([
          import('@codemirror/theme-one-dark'),
          loadLanguageExtension(language),
        ]);

        if (!cancelled) {
          setDarkTheme(themeModule.oneDark);
          if (langModule) {
            setExtensions([langModule]);
          }
        }
      } catch {
        // Silently fail — editor works without extensions
      }
    }

    loadExtensions();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const activeTheme = isDarkMode ? (darkTheme ?? 'dark') : 'light';

  return (
    <ReactCodeMirror
      value={value}
      onChange={onChange}
      height={height}
      readOnly={readOnly}
      theme={activeTheme}
      extensions={extensions}
      placeholder="Escreva seu código aqui..."
      aria-label={ariaLabel}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: !readOnly,
        highlightSelectionMatches: true,
        autocompletion: autocompletion && !readOnly,
      }}
      className="rounded-lg overflow-hidden border border-dd-border"
      style={{
        fontSize: '13px',
      }}
    />
  );
}

async function loadLanguageExtension(
  language: string
): Promise<import('@codemirror/state').Extension | null> {
  const lang = language.toUpperCase();

  switch (lang) {
    case 'JS':
    case 'JAVASCRIPT': {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript({ jsx: true });
    }
    case 'TS':
    case 'TYPESCRIPT': {
      const { javascript } = await import('@codemirror/lang-javascript');
      return javascript({ typescript: true, jsx: true });
    }
    case 'PYTHON': {
      const { python } = await import('@codemirror/lang-python');
      return python();
    }
    case 'JAVA':
    case 'KOTLIN': {
      const { java } = await import('@codemirror/lang-java');
      return java();
    }
    case 'RUST': {
      const { rust } = await import('@codemirror/lang-rust');
      return rust();
    }
    case 'CPP':
    case 'C++': {
      const { cpp } = await import('@codemirror/lang-cpp');
      return cpp();
    }
    default:
      return null;
  }
}

// Imports cleaned up
