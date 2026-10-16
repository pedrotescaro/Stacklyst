import { useState } from 'react';
import { useWindowDimensions, Text, View, Platform, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import RenderHTML from 'react-native-render-html';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme';
import { Button, Label, useUIStyles } from './ui';

export function RichText({ body, inset = 32 }: { body: string; inset?: number }) {
  const { width } = useWindowDimensions();
  const { colors: c } = useTheme();
  return /<\/?(?:p|div|h[1-6]|pre|ul|ol|blockquote)\b/i.test(body) ? (
    <RenderHTML
      contentWidth={Math.max(120, Math.min(width - inset, 728 - inset + 32))}
      source={{ html: body }}
      ignoredDomTags={['script', 'iframe', 'style', 'object', 'form']}
      baseStyle={{ color: c.text, fontSize: 16, lineHeight: 24 }}
      tagsStyles={{
        a: { color: c.primary },
        p: { marginTop: 4, marginBottom: 8 },
        pre: { backgroundColor: c.surface, padding: 12, borderRadius: 8 },
        code: { color: c.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
      }}
    />
  ) : (
    <Markdown
      style={{
        body: { color: c.text, fontSize: 16, lineHeight: 24 },
        paragraph: { marginTop: 4, marginBottom: 8 },
        code_inline: { color: c.text, backgroundColor: c.surface },
        fence: {
          color: c.text,
          backgroundColor: c.surface,
          borderColor: c.border,
          borderRadius: 8,
        },
        code_block: { color: c.text, backgroundColor: c.surface, borderColor: c.border },
        link: { color: c.primary },
        blockquote: { backgroundColor: c.surface, borderLeftColor: c.border, borderLeftWidth: 1 },
        hr: { backgroundColor: c.border },
      }}
    >
      {body}
    </Markdown>
  );
}

export function CodeBlock({ code }: { code: string }) {
  const { colors: c } = useTheme();
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const copy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return (
    <View
      style={{
        backgroundColor: c.surface,
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginVertical: 8,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{ paddingBottom: 4 }}
      >
        <Text
          selectable
          style={{
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 14,
            lineHeight: 22,
            color: c.text,
          }}
        >
          {code}
        </Text>
      </ScrollView>
      <Button secondary label={copied ? 'Código copiado' : 'Copiar código'} onPress={copy} />
      {failed && <Label>Não foi possível copiar. Selecione o código para copiá-lo.</Label>}
    </View>
  );
}

export function DraftConflict({
  draft,
  formatValue,
}: {
  draft: { conflict: { value: string } | null; acceptRemote: () => void; keepLocal: () => void };
  formatValue?: (value: string) => string;
}) {
  const styles = useUIStyles();
  return draft.conflict ? (
    <View style={styles.panel}>
      <Label>Versão salva na sua conta</Label>
      <CodeBlock code={formatValue ? formatValue(draft.conflict.value) : draft.conflict.value} />
      <Button label="Usar versão da conta" onPress={draft.acceptRemote} />
      <Button label="Manter meu texto" secondary onPress={draft.keepLocal} />
    </View>
  ) : null;
}
