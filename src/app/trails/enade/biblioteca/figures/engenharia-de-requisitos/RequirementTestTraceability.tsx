import { Arrow, Diagram, Node, Note, Text } from '../primitives';

export const details = {
  title: 'Rastreabilidade da necessidade aos testes',
  alt: 'A necessidade origina uma história de usuário ou um caso de uso. Critérios de aceitação da história apontam para testes de aceitação. O fluxo principal e os fluxos alternativos e de exceção do caso de uso apontam para os respectivos testes. Os vínculos permitem rastrear o propósito dos testes.',
};

export function RequirementTestTraceability() {
  return (
    <Diagram title={details.title} desc={details.alt} height={365}>
      <Node x={126} y={12} w={228} h={48} label="Necessidade do usuário" tone="accent" />
      <Arrow d="M240 60 V77 H105 V104" />
      <Arrow d="M240 77 H338 V104" />
      <Node x={16} y={104} w={178} h={48} label="História de usuário" />
      <Node x={250} y={104} w={176} h={48} label="Caso de uso" />
      <Arrow x1={105} y1={152} x2={105} y2={194} />
      <Arrow d="M338 152 V171 H266 V194" />
      <Arrow d="M338 171 H407 V194" />
      <Node x={16} y={194} w={178} h={56} label={['Critérios de', 'aceitação']} />
      <Node x={202} y={194} w={128} h={56} label={['Fluxo', 'principal']} />
      <Node x={338} y={194} w={138} h={56} label={['Alternativas', 'e exceções']} />
      <Arrow x1={105} y1={250} x2={105} y2={280} />
      <Arrow x1={266} y1={250} x2={266} y2={280} />
      <Arrow x1={407} y1={250} x2={407} y2={280} />
      <Note x={16} y={280} w={178} h={54} label={['Testes de', 'aceitação']} />
      <Note x={202} y={280} w={128} h={54} label={['Teste do fluxo', 'principal']} />
      <Note x={338} y={280} w={138} h={54} label={['Testes das', 'variações']} />
      <Text x={240} y={351} muted>
        Os vínculos permitem conferir a cobertura dos cenários.
      </Text>
    </Diagram>
  );
}
