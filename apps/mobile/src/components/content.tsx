import { useWindowDimensions, Text, View, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import RenderHTML from 'react-native-render-html';
import * as Clipboard from 'expo-clipboard';
import { colors as c } from '../theme';
import { Button, Label, styles } from './ui';
export function RichText({ body }: { body: string }) {
  const { width } = useWindowDimensions();
  return /<\/?(?:p|div|h[1-6]|pre|ul|ol|blockquote)\b/i.test(body) ? (
    <RenderHTML
      contentWidth={Math.min(width - 32, 728)}
      source={{ html: body }}
      ignoredDomTags={['script', 'iframe', 'style', 'object', 'form']}
      baseStyle={{ color: c.text, fontSize: 16, lineHeight: 24 }}
      tagsStyles={{ a: { color: c.primary }, pre: { backgroundColor: c.surface, padding: 12 } }}
    />
  ) : (
    <Markdown
      style={{
        body: styles.text,
        code_inline: { color: c.text, backgroundColor: c.surface },
        fence: { color: c.text, backgroundColor: c.surface, borderColor: c.border },
        link: { color: c.primary },
      }}
    >
      {body}
    </Markdown>
  );
}
export function CodeBlock({ code }: { code: string }) {
  return (
    <View style={styles.panel}>
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
      <Button secondary label="Copiar código" onPress={() => Clipboard.setStringAsync(code)} />
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
  return draft.conflict ? (
    <View style={styles.panel}>
      <Label>Versão salva na sua conta</Label>
      <CodeBlock code={formatValue ? formatValue(draft.conflict.value) : draft.conflict.value} />
      <Button label="Usar versão da conta" onPress={draft.acceptRemote} />
      <Button label="Manter meu texto" secondary onPress={draft.keepLocal} />
    </View>
  ) : null;
}
