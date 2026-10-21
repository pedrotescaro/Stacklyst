import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { codeFont, snippetColors } from './content';
import { IconX } from './icons';

const languages = [
  ['', 'Texto'],
  ['JS', 'JavaScript'],
  ['TS', 'TypeScript'],
  ['PYTHON', 'Python'],
  ['JAVA', 'Java'],
  ['RUST', 'Rust'],
  ['GO', 'Go'],
  ['KOTLIN', 'Kotlin'],
  ['SWIFT', 'Swift'],
  ['CPP', 'C++'],
];

export function SnippetComposer({
  value,
  onChange,
  language,
  onLanguageChange,
  editable = true,
  maxLength = 10000,
  onRemove,
}: {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  editable?: boolean;
  maxLength?: number;
  onRemove?: () => void;
}) {
  const [width, setWidth] = useState(280);
  const normalizedLanguage =
    ({ JAVASCRIPT: 'JS', TYPESCRIPT: 'TS', 'C++': 'CPP' } as Record<string, string>)[
      language.toUpperCase()
    ] || language.toUpperCase();
  const lines = useMemo(() => value.split('\n'), [value]);
  const gutterWidth = Math.max(38, String(lines.length).length * 8 + 24);
  const longest = Math.max(0, ...lines.map((line) => line.replace(/\t/g, '    ').length));
  const editorWidth = Math.max(width - gutterWidth - 2, longest * 8.5 + 32);
  const editorHeight = Math.max(132, lines.length * 22 + 24);
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{
        width: '100%',
        minWidth: 0,
        borderWidth: 1,
        borderColor: snippetColors.border,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: snippetColors.background,
      }}
    >
      <View style={{ flexDirection: 'row', backgroundColor: snippetColors.header }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1, minWidth: 0 }}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {languages.map(([key, label]) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`Linguagem ${label}`}
              accessibilityState={{ selected: normalizedLanguage === key, disabled: !editable }}
              disabled={!editable}
              onPress={() => onLanguageChange(key)}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                minHeight: 44,
                justifyContent: 'center',
                borderBottomWidth: 2,
                borderBottomColor:
                  normalizedLanguage === key ? snippetColors.accent : 'transparent',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: normalizedLanguage === key ? '700' : '400',
                  color: normalizedLanguage === key ? snippetColors.accent : snippetColors.text,
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {onRemove && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remover bloco de código"
            disabled={!editable}
            onPress={onRemove}
            style={({ pressed }) => ({
              width: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <IconX size={18} color={snippetColors.text} />
          </Pressable>
        )}
      </View>
      <ScrollView
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        style={{ maxHeight: 264 }}
      >
        <View style={{ flexDirection: 'row', minHeight: editorHeight }}>
          <Text
            accessible={false}
            importantForAccessibility="no"
            style={{
              width: gutterWidth,
              flexShrink: 0,
              paddingTop: 12,
              paddingHorizontal: 12,
              fontFamily: codeFont,
              color: snippetColors.gutter,
              fontSize: 14,
              lineHeight: 22,
              textAlign: 'right',
              borderRightWidth: 1,
              borderRightColor: snippetColors.border,
            }}
          >
            {lines.map((_, index) => index + 1).join('\n')}
          </Text>
          <ScrollView
            horizontal
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1, minWidth: 0 }}
          >
            <TextInput
              accessibilityLabel="Editor de código com numeração de linhas"
              placeholder="Cole ou escreva seu código"
              placeholderTextColor={snippetColors.gutter}
              selectionColor={snippetColors.accent}
              value={value}
              onChangeText={onChange}
              editable={editable}
              maxLength={maxLength}
              multiline
              scrollEnabled={false}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
              style={{
                width: editorWidth,
                minHeight: editorHeight,
                padding: 12,
                fontFamily: codeFont,
                color: snippetColors.text,
                fontSize: 14,
                lineHeight: 22,
                borderWidth: 0,
              }}
            />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
