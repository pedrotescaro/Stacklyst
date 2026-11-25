import { Arrow, Diagram, Node, Note, Text } from '../primitives';

export const details = {
  title: 'Requisitos funcionais e não funcionais',
  alt: 'Requisitos funcionais descrevem serviços e comportamentos. Requisitos não funcionais tratam de atributos e restrições do produto, da organização ou externos. Regras de domínio podem originar requisitos nas duas classes.',
};

export function RequirementKinds() {
  return (
    <Diagram title={details.title} desc={details.alt} height={360}>
      <Node x={116} y={12} w={248} h={43} label="Requisitos do sistema" tone="accent" />
      <Arrow d="M240 55 V76 H105 V104" />
      <Arrow d="M240 76 H349 V104" />
      <Node
        x={12}
        y={104}
        w={186}
        h={61}
        label="Funcionais"
        sub={['Serviços e', 'comportamentos']}
      />
      <Node
        x={230}
        y={104}
        w={238}
        h={61}
        label="Não funcionais"
        sub={['Atributos de qualidade', 'e restrições']}
      />
      <Arrow d="M349 165 V180 H208 V286" tone="neutral" kind="none" />
      {[
        ['Produto', 'Tempo de resposta'],
        ['Organização', 'Processo obrigatório'],
        ['Externos', 'Norma legal'],
      ].map(([label, sub], index) => {
        const y = 190 + index * 53;
        return (
          <g key={label}>
            <Arrow x1={208} y1={y + 20} x2={230} y2={y + 20} />
            <Node x={230} y={y} w={238} h={43} label={label} sub={sub} />
          </g>
        );
      })}
      <Note x={12} y={263} w={186} h={57} label="Regras de domínio" />
      <Arrow x1={105} y1={263} x2={105} y2={165} tone="neutral" dashed />
      <Arrow d="M187 263 V177 H258 V165" tone="neutral" dashed />
      <Text x={240} y={346} muted>
        Regras do domínio podem levar aos dois tipos de requisito.
      </Text>
    </Diagram>
  );
}
