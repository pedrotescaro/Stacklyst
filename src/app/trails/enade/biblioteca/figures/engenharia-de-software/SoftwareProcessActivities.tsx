import { Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Quatro atividades fundamentais do processo de software',
  alt: 'Especificação define serviços e restrições, desenvolvimento reúne projeto e implementação, validação verifica necessidades e evolução acompanha mudanças. Atividades podem se sobrepor.',
};

const activities = [
  { x: 12, y: 70, label: 'Especificação', sub: ['Definir serviços', 'e restrições'] },
  { x: 252, y: 70, label: 'Desenvolvimento', sub: ['Projetar e implementar', 'a solução'] },
  { x: 12, y: 170, label: 'Validação', sub: ['Avaliar se o produto', 'atende às necessidades'] },
  { x: 252, y: 170, label: 'Evolução', sub: ['Mudar o produto', 'quando o contexto muda'] },
];

export function SoftwareProcessActivities() {
  return (
    <Diagram title={details.title} desc={details.alt} height={296}>
      <Text x={240} y={27} weight={600}>
        Processo de software
      </Text>
      <path
        d="M49 47 H431 M120 47 V70 M360 47 V70 M240 47 V213 M228 213 H252"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
        fill="none"
      />
      {activities.map((activity) => (
        <Node key={activity.label} {...activity} w={216} h={86} tone="accent" />
      ))}
      <Text x={240} y={283} muted>
        As atividades podem se sobrepor.
      </Text>
    </Diagram>
  );
}
