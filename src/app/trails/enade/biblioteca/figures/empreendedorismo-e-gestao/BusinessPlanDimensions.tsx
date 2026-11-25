import { Arrow, Diagram, Node } from '../primitives';

export const businessPlanDimensions = {
  title: 'Quatro dimensões do plano de negócios',
  alt: 'O plano de negócios cruza quatro fatores: pessoas e suas competências, oportunidade e mercado, contexto externo e seus condicionantes, e cenários de risco e retorno. Os quatro fatores informam a avaliação do mesmo empreendimento.',
};

export function BusinessPlanDimensions() {
  return (
    <Diagram title={businessPlanDimensions.title} desc={businessPlanDimensions.alt} height={288}>
      <Arrow
        d="M135 92V121H158 M355 92V121H322 M135 195V166H158 M355 195V166H322"
        kind="none"
        tone="neutral"
      />
      <Node
        x={24}
        y={18}
        w={222}
        h={74}
        label="Pessoas"
        sub={['Equipe, experiência', 'e rede de apoio']}
      />
      <Node
        x={254}
        y={18}
        w={202}
        h={74}
        label="Oportunidade"
        sub={['Clientes, mercado', 'e crescimento']}
      />
      <Node x={158} y={102} w={164} h={80} label={['Plano de', 'negócios']} tone="accent" />
      <Node
        x={24}
        y={195}
        w={222}
        h={74}
        label="Contexto"
        sub={['Condições externas', 'e suas mudanças']}
      />
      <Node
        x={254}
        y={195}
        w={202}
        h={74}
        label="Riscos e retornos"
        sub={['Cenários e respostas', 'da equipe']}
      />
    </Diagram>
  );
}
