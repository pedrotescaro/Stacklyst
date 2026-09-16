import { View } from 'react-native';
import { Result } from '../../lib/types';
import { Heading, Label, styles } from '../../components/ui';
import { CodeBlock } from '../../components/content';
export function ResultView({ result, submitted }: { result: Result; submitted: boolean }) {
  const passed = result.isCorrect ?? result.passed;
  return (
    <View accessibilityLiveRegion="polite" style={styles.panel}>
      <Heading>
        {passed
          ? submitted
            ? 'Resposta aceita'
            : 'Testes públicos concluídos'
          : 'Revise sua solução'}
      </Heading>
      <Label>
        {result.message ||
          result.details ||
          result.error ||
          result.submission?.status ||
          'Resultado recebido do servidor.'}
      </Label>
      {result.totalTests !== undefined && (
        <Label>
          {result.passedTests}/{result.totalTests} testes passaram
        </Label>
      )}
      {submitted && result.xpEarned !== undefined && <Label>{result.xpEarned} XP concedidos</Label>}
      {(result.output || result.consoleOutput) && (
        <CodeBlock code={result.output || result.consoleOutput || ''} />
      )}{' '}
      {result.tests?.map((t) => (
        <Label key={t.id}>
          {t.passed ? 'Passou' : 'Não passou'} · {t.label}
        </Label>
      ))}
    </View>
  );
}
