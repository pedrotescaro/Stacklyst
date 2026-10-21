import { useState } from 'react';
import { useWindowDimensions, Text, View, Platform, Pressable, ScrollView } from 'react-native';
import Markdown, { type RenderRules } from 'react-native-markdown-display';
import RenderHTML, {
  isDomElement,
  isDomText,
  type CustomBlockRenderer,
  type Node,
} from 'react-native-render-html';
import * as Clipboard from 'expo-clipboard';
import { IconCheck, IconCopy } from './icons';
import { hasHtmlContent, htmlWithCodeFences } from '../lib/code-snippets';
import { useTheme } from '../theme';
import { Button, Label, useUIStyles } from './ui';

// These are the bundled exercise editor's @codemirror/theme-one-dark colors.
export const snippetColors = {
  background: '#282c34',
  header: '#21252b',
  text: '#abb2bf',
  gutter: '#9da7b8',
  border: '#353a42',
  accent: '#61afef',
};
export const codeFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

function htmlCodeText(node: Node): string {
  if (isDomText(node)) return node.data;
  if (isDomElement(node)) {
    if (node.name === 'br') return '\n';
    return node.children.map(htmlCodeText).join('');
  }
  return '';
}

const PreRenderer: CustomBlockRenderer = ({ tnode }) => {
  const codeNode = tnode.domNode.children.find(
    (child) => isDomElement(child) && child.name === 'code'
  );
  const language =
    tnode.attributes['data-language'] ||
    (codeNode && isDomElement(codeNode)
      ? codeNode.attribs.class?.match(/(?:language|lang)-([^\s]+)/)?.[1]
      : undefined);
  return <CodeBlock code={htmlCodeText(tnode.domNode)} language={language} />;
};
const htmlRenderers = { pre: PreRenderer };
const codeRules: RenderRules = {
  fence: (node) => (
    <CodeBlock
      key={node.key}
      code={node.content.replace(/\n$/, '')}
      language={
        'sourceInfo' in node && typeof node.sourceInfo === 'string'
          ? node.sourceInfo.split(/\s+/)[0]
          : undefined
      }
    />
  ),
  code_block: (node) => <CodeBlock key={node.key} code={node.content.replace(/\n$/, '')} />,
};

export function RichText({ body, inset = 32 }: { body: string; inset?: number }) {
  const { width } = useWindowDimensions();
  const { colors: c } = useTheme();
  return hasHtmlContent(body) ? (
    <RenderHTML
      contentWidth={Math.max(120, Math.min(width - inset, 728 - inset + 32))}
      source={{ html: htmlWithCodeFences(body) }}
      renderers={htmlRenderers}
      ignoredDomTags={['script', 'iframe', 'style', 'object', 'form']}
      baseStyle={{ color: c.text, fontSize: 16, lineHeight: 24 }}
      tagsStyles={{
        a: { color: c.primary },
        p: { marginTop: 4, marginBottom: 8 },
        pre: { whiteSpace: 'pre' },
        code: { color: c.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
      }}
    />
  ) : (
    <Markdown
      rules={codeRules}
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

export function CodeBlock({ code, language }: { code: string; language?: string }) {
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
        backgroundColor: snippetColors.background,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: snippetColors.border,
        marginVertical: 8,
        width: '100%',
        minWidth: 0,
      }}
    >
      <View
        style={{
          backgroundColor: snippetColors.header,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 12,
          minHeight: 40,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ color: snippetColors.text, fontFamily: codeFont, fontSize: 12, flex: 1 }}
        >
          {language || 'Código'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Código copiado' : 'Copiar código'}
          onPress={() => void copy()}
          style={({ pressed }) => ({
            minWidth: 44,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          {copied ? (
            <IconCheck size={17} color={snippetColors.accent} />
          ) : (
            <IconCopy size={17} color={snippetColors.text} />
          )}
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', paddingVertical: 12, minWidth: 0 }}>
        <Text
          accessible={false}
          importantForAccessibility="no"
          style={{
            fontFamily: codeFont,
            fontSize: 13,
            lineHeight: 22,
            color: snippetColors.gutter,
            textAlign: 'right',
            paddingLeft: 12,
            paddingRight: 12,
            minWidth: 38,
            borderRightWidth: 1,
            borderRightColor: snippetColors.border,
          }}
        >
          {code
            .split('\n')
            .map((_, index) => index + 1)
            .join('\n')}
        </Text>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          style={{ flex: 1, minWidth: 0 }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}
        >
          <Text
            selectable
            style={{
              fontFamily: codeFont,
              fontSize: 13,
              lineHeight: 22,
              color: snippetColors.text,
            }}
          >
            {code || ' '}
          </Text>
        </ScrollView>
      </View>
      {failed && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: snippetColors.text, fontSize: 12, padding: 12 }}
        >
          Não foi possível copiar. Selecione o código para copiá-lo.
        </Text>
      )}
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
