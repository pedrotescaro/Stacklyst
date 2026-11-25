import { Arrow, Diagram, Node, Note, Text } from '../primitives';

export const details = {
  title: 'Descoberta e análise de requisitos',
  alt: 'Entrevistas, observação e documentos alimentam a descoberta. As necessidades levantadas são organizadas, priorizadas e negociadas antes da especificação. Dúvidas e lacunas levam de volta à descoberta.',
};

const sources = [
  { x: 22, label: 'Entrevistas' },
  { x: 180, label: 'Observação' },
  { x: 338, label: 'Documentos' },
];

export function RequirementsElicitation() {
  return (
    <Diagram title={details.title} desc={details.alt} height={401}>
      <Text x={22} y={22} align="start" weight={600}>
        Fontes da descoberta
      </Text>
      {sources.map(({ x, label }) => (
        <Node key={label} x={x} y={43} w={120} h={39} label={label} />
      ))}
      <Arrow d="M82 82 V105 H240 V124" />
      <Arrow x1={240} y1={82} x2={240} y2={105} kind="none" />
      <Arrow d="M398 82 V105 H240" kind="none" />
      <Node
        x={112}
        y={124}
        w={256}
        h={47}
        label="Descobrir e registrar necessidades"
        tone="accent"
      />
      <Arrow x1={240} y1={171} x2={240} y2={196} />
      <Node x={112} y={196} w={256} h={47} label="Classificar e organizar" />
      <Arrow x1={240} y1={243} x2={240} y2={268} />
      <Node x={112} y={268} w={256} h={47} label="Priorizar e negociar" />
      <Arrow x1={240} y1={315} x2={240} y2={340} />
      <Note x={112} y={340} w={256} h={47} label="Especificar requisitos" />
      <Arrow d="M112 363 H23 V147 H112" tone="neutral" dashed />
      <Text x={34} y={222} align="start" muted>
        Dúvidas
      </Text>
      <Text x={34} y={241} align="start" muted>
        e lacunas
      </Text>
    </Diagram>
  );
}
