import { Arrow, Diagram, Node, Text } from '../primitives';

export const details = {
  title: 'Eventos, artefatos e compromissos do Scrum',
  alt: 'A Meta do Produto orienta o Product Backlog. Dentro de uma Sprint de até um mês, o planejamento cria o Sprint Backlog com sua Meta da Sprint. O trabalho e a Daily Scrum permitem adaptação diária. Cada Incremento atende à Definição de Pronto e pode ser entregue antes da Revisão. A Revisão inspeciona o resultado e adapta o Product Backlog. A Retrospectiva prepara melhorias para a próxima Sprint.',
};

export function ScrumCycle() {
  return (
    <Diagram title={details.title} desc={details.alt} height={646}>
      <Node
        x={113}
        y={12}
        w={254}
        h={59}
        label="Product Backlog"
        sub="Compromisso: Meta do Produto"
        tone="accent"
      />
      <rect
        x={12}
        y={91}
        width={456}
        height={502}
        rx={12}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
        strokeWidth={1.5}
      />
      <Text x={33} y={117} align="start" weight={600}>
        Sprint
      </Text>
      <Text x={447} y={117} align="end" muted>
        Até um mês
      </Text>
      <Arrow x1={240} y1={71} x2={240} y2={133} />
      <Node x={113} y={133} w={254} h={38} label="Planejamento da Sprint" />
      <Arrow x1={240} y1={171} x2={240} y2={188} />
      <Node
        x={113}
        y={188}
        w={254}
        h={57}
        label="Sprint Backlog"
        sub="Compromisso: Meta da Sprint"
        tone="accent"
      />
      <Arrow x1={240} y1={245} x2={240} y2={271} />
      <Node x={48} y={271} w={197} h={57} label="Trabalho da Sprint" />
      <Node x={288} y={271} w={137} h={57} label="Daily Scrum" sub="Adaptar o plano" />
      <Arrow x1={245} y1={289} x2={288} y2={289} />
      <Arrow x1={288} y1={309} x2={245} y2={309} dashed tone="neutral" />
      <Arrow d="M147 328 V342 H240 V354" />
      <Node
        x={110}
        y={354}
        w={260}
        h={55}
        label="Incremento"
        sub="Compromisso: Definição de Pronto"
        tone="accent"
      />
      <Arrow x1={240} y1={409} x2={240} y2={445} />
      <Text x={252} y={427} align="start" size={13} muted>
        Inspecionar os incrementos
      </Text>
      <Node x={113} y={445} w={254} h={36} label="Revisão da Sprint" />
      <Arrow d="M367 463 H448 V42 H367" dashed tone="neutral" />
      <Arrow x1={240} y1={481} x2={240} y2={500} />
      <Node x={113} y={500} w={254} h={36} label="Retrospectiva da Sprint" />
      <Text x={124} y={559} size={13} muted>
        Um incremento pronto pode
      </Text>
      <Text x={124} y={577} size={13} muted>
        ser entregue antes da Revisão.
      </Text>
      <Arrow x1={240} y1={536} x2={240} y2={617} />
      <Text x={240} y={634} weight={600}>
        Próxima Sprint
      </Text>
    </Diagram>
  );
}
