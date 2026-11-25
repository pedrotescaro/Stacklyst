import { Arrow, Diagram, Diamond, Node, Note, Text } from '../primitives';

export const details = {
  title: 'Controle de mudança de uma linha de base',
  alt: 'Uma solicitação é registrada e avaliada. Se aprovada, uma ordem autoriza alterar a versão controlada. Revisões e testes podem devolver a mudança à implementação. A auditoria aprova a nova linha de base. Resultados e decisões alimentam o registro de situação.',
};

export function BaselineChange() {
  return (
    <Diagram title={details.title} desc={details.alt} height={640}>
      <Arrow x1={148} y1={49} x2={148} y2={71} />
      <Arrow x1={148} y1={119} x2={148} y2={143} />
      <Arrow d="M228 173 H259 V161 H293" tone="neutral" />
      <Text x={261} y={185} muted>
        Não
      </Text>
      <Arrow x1={148} y1={203} x2={148} y2={245} />
      <Text x={165} y={224} align="start" muted>
        Sim
      </Text>
      <Arrow x1={148} y1={287} x2={148} y2={310} />
      <Arrow x1={148} y1={352} x2={148} y2={375} />
      <Arrow d="M243 409 H280 V331 H258" tone="neutral" />
      <Text x={258} y={430} muted>
        Não
      </Text>
      <Arrow x1={148} y1={443} x2={148} y2={480} />
      <Text x={166} y={457} align="start" muted>
        Sim
      </Text>
      <Arrow x1={148} y1={522} x2={148} y2={550} />
      <Arrow d="M259 30 H374 V136" tone="neutral" dashed />
      <Arrow d="M374 187 V546" tone="neutral" dashed />
      <Arrow x1={258} y1={575} x2={293} y2={575} tone="neutral" dashed />
      <Node x={38} y={8} w={220} h={41} label="Registrar solicitação" />
      <Node
        x={38}
        y={71}
        w={220}
        h={48}
        label="Avaliar impacto"
        sub="Custo, escopo e itens afetados"
      />
      <Diamond x={68} y={143} w={160} h={60} label="CCB aprova?" tone="accent" />
      <Node x={293} y={136} w={163} h={51} label={['Comunicar a', 'decisão']} />
      <Node x={38} y={245} w={220} h={42} label="Autorizar a mudança" />
      <Node x={38} y={310} w={220} h={42} label="Alterar versão controlada" />
      <Diamond
        x={53}
        y={375}
        w={190}
        h={68}
        label={['Revisão e testes', 'aprovados?']}
        tone="accent"
      />
      <Node x={38} y={480} w={220} h={42} label="Auditar a configuração" />
      <Node x={38} y={550} w={220} h={50} label="Nova linha de base" tone="accent" />
      <Note x={293} y={546} w={163} h={58} label={['Registro de', 'situação']} />
      <Text x={38} y={624} align="start" muted>
        CCB: comitê de controle de mudanças
      </Text>
    </Diagram>
  );
}
