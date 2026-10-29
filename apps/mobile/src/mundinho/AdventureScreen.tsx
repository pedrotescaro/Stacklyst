import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, errorMessage } from '~/lib/api';
import { useLearning } from '~/features/learning/hooks';
import { useMe } from '~/lib/session';
import { mundinhoHtml } from './document.generated';

export function AdventureScreen({ onCourse }: { onCourse: (language?: string) => void }) {
  const ref = useRef<WebView>(null);
  const learning = useLearning(),
    me = useMe(),
    insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const account = useRef(me.data?.id);
  account.current = me.data?.id;
  const receive = (message: unknown) =>
    ref.current?.injectJavaScript(`window.mundinhoReceive(${JSON.stringify(message)});true;`);
  useEffect(() => {
    if (!ready) return;
    const courses = ['PYTHON', 'JS', 'TS', 'RUST', 'GO', 'JAVA']
      .map((language) => {
        const nodes = learning.data?.nodes.filter((n) => n.language === language) ?? [];
        return {
          language,
          total: nodes.length,
          completed: nodes.filter((n) => ['COMPLETED', 'MASTERED'].includes(n.status)).length,
        };
      })
      .filter((c) => c.total > 0);
    receive({ courses });
  }, [ready, learning.data]);
  const message = async (event: WebViewMessageEvent) => {
    let input: { type?: string; id?: string; language?: string; action?: unknown };
    try {
      input = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (input.type === 'ready') {
      setReady(true);
      return;
    }
    if (input.type === 'course') {
      onCourse(input.language);
      return;
    }
    if (input.type !== 'api' || typeof input.id !== 'string' || input.id.length > 100) return;
    const userId = account.current;
    try {
      const data = await api(
        '/api/mundinho',
        input.action ? { method: 'POST', body: JSON.stringify(input.action) } : {}
      );
      if (account.current === userId) receive({ id: input.id, data });
    } catch (error) {
      if (account.current === userId) receive({ id: input.id, error: errorMessage(error) });
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#070a0e', paddingTop: insets.top }}>
      <WebView
        key={me.data?.id ?? 'loading'}
        ref={ref}
        source={{ html: mundinhoHtml }}
        originWhitelist={['about:blank']}
        onShouldStartLoadWithRequest={(request) => request.url === 'about:blank'}
        onMessage={(event) => void message(event)}
        onLoadStart={() => setReady(false)}
        javaScriptEnabled
        domStorageEnabled={false}
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
        mixedContentMode="never"
        style={{ backgroundColor: '#070a0e' }}
        setSupportMultipleWindows={false}
      />
    </View>
  );
}
