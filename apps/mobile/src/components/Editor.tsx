import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, TextInput, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { editorHtml } from '../editor/document.generated';
import { Button, Label, styles } from './ui';
import { colors } from '../theme';
export function Editor({
  value,
  onChange,
  language,
  editable = true,
}: {
  value: string;
  onChange: (s: string) => void;
  language: string;
  editable?: boolean;
}) {
  const ref = useRef<WebView>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const latest = useRef({ value, language, editable, onChange });
  latest.current = { value, language, editable, onChange };
  const send = (data: unknown) => ref.current?.postMessage(JSON.stringify(data));
  useEffect(() => {
    if (ready) send({ type: 'init', code: value, language, editable });
  }, [ready, value, language, editable]);
  // Browser previews use a text field; installed Android/iOS builds use CodeMirror.
  if (Platform.OS === 'web')
    return (
      <TextInput
        multiline
        accessibilityLabel="Código"
        editable={editable}
        value={value}
        maxLength={20000}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { height: 360, fontFamily: 'monospace' }]}
      />
    );
  return (
    <View
      style={{ height: 400, backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden' }}
    >
      <ScrollView horizontal contentContainerStyle={{ gap: 4, padding: 4 }} style={{ flexGrow: 0 }}>
        {['  ', '{', '}', '(', ')', '[', ']', ';', '='].map((text) => (
          <Button
            key={text}
            secondary
            disabled={!ready || !editable}
            label={text === '  ' ? 'Tab' : text}
            onPress={() => send({ type: 'insert', text })}
          />
        ))}
        <Button
          label="Desfazer"
          disabled={!ready || !editable}
          secondary
          onPress={() => send({ type: 'undo' })}
        />
        <Button
          label="Refazer"
          disabled={!ready || !editable}
          secondary
          onPress={() => send({ type: 'redo' })}
        />
      </ScrollView>
      {failed && (
        <>
          <Label>O editor foi interrompido. Seu rascunho foi preservado.</Label>
          <Button
            label="Reabrir editor"
            onPress={() => {
              setFailed(false);
              setReady(false);
              ref.current?.reload();
            }}
          />
        </>
      )}
      <WebView
        ref={ref}
        source={{ html: editorHtml, baseUrl: 'https://editor.stacklyst.invalid' }}
        originWhitelist={['https://editor.stacklyst.invalid', 'about:blank']}
        onShouldStartLoadWithRequest={(r) =>
          r.url === 'about:blank' || r.url.startsWith('https://editor.stacklyst.invalid/')
        }
        javaScriptEnabled
        domStorageEnabled={false}
        allowFileAccess={false}
        mixedContentMode="never"
        setSupportMultipleWindows={false}
        onLoadStart={() => setReady(false)}
        onError={() => {
          setReady(false);
          setFailed(true);
        }}
        onContentProcessDidTerminate={() => {
          setReady(false);
          setFailed(true);
        }}
        onRenderProcessGone={() => {
          setReady(false);
          setFailed(true);
        }}
        onMessage={(event) => {
          try {
            const m = JSON.parse(event.nativeEvent.data);
            if (!m || typeof m !== 'object') return;
            if (m.type === 'ready') {
              setReady(true);
              const props = latest.current;
              send({
                type: 'init',
                code: props.value,
                language: props.language,
                editable: props.editable,
              });
            }
            if (
              m.type === 'change' &&
              latest.current.editable &&
              typeof m.code === 'string' &&
              m.code.length <= 20000
            )
              latest.current.onChange(m.code);
          } catch {
            /* Ignore malformed bridge events. */
          }
        }}
        style={{ backgroundColor: colors.surface }}
      />
    </View>
  );
}
