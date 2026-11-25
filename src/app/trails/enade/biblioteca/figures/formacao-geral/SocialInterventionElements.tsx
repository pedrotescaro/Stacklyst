import { Arrow, Diagram, Node, Swimlane, Text } from '../primitives';

export const socialInterventionElements = {
  title: 'Elementos de uma proposta de intervenção social',
  alt: 'A proposta de intervenção parte do problema discutido e informa a ação, o agente responsável, o meio de execução, o efeito esperado e um detalhamento concreto. A proposta inteira precisa respeitar os direitos humanos.',
};

export function SocialInterventionElements() {
  return (
    <Diagram
      title={socialInterventionElements.title}
      desc={socialInterventionElements.alt}
      height={381}
    >
      <Node x={102} y={17} w={276} h={45} label="Problema discutido" />
      <Arrow x1={240} y1={62} x2={240} y2={124} />
      <Swimlane x={16} y={83} w={448} h={236} label="Proposta de intervenção">
        <Node
          x={32}
          y={124}
          w={416}
          h={54}
          label="Ação"
          sub="O que deve ser feito?"
          tone="accent"
        />
        <Node x={32} y={189} w={204} h={53} label="Agente" sub="Quem vai executar?" />
        <Node x={244} y={189} w={204} h={53} label="Meio" sub="Como executar?" />
        <Node x={32} y={252} w={204} h={53} label="Efeito" sub="Que resultado se busca?" />
        <Node
          x={244}
          y={252}
          w={204}
          h={53}
          label="Detalhamento"
          sub="Que dado torna a ação concreta?"
        />
      </Swimlane>
      <Text x={240} y={350} weight={600}>
        Toda a proposta respeita os direitos humanos
      </Text>
    </Diagram>
  );
}
