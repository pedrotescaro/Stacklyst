import { Arrow, Diagram, Node, Swimlane, Text } from '../primitives';

export const description =
  'No monólito, Pedidos e Catálogo fazem parte da mesma implantação e usam o banco da aplicação. Em microsserviços, Pedidos e Catálogo são unidades de implantação independentes, cada uma com acesso aos próprios dados. Pedidos usa uma API para consultar Catálogo.';

export function DeploymentUnits() {
  return (
    <Diagram title="Unidades de implantação" desc={description} height={430}>
      <Swimlane x={12} y={12} w={456} h={155} label="Monólito">
        <rect
          x={30}
          y={57}
          width={260}
          height={91}
          rx={8}
          fill="var(--enade-softer)"
          stroke="var(--color-dd-accent)"
        />
        <Text x={160} y={79} weight={600}>
          Uma implantação
        </Text>
        <Text x={102} y={118}>
          Pedidos
        </Text>
        <path d="M160 101 V134" stroke="var(--enade-line)" />
        <Text x={223} y={118}>
          Catálogo
        </Text>
        <Arrow x1={290} y1={102} x2={315} y2={102} />
        <Node x={315} y={73} w={136} h={58} label={['Banco da', 'aplicação']} />
      </Swimlane>
      <Swimlane x={12} y={186} w={456} h={226} label="Microsserviços">
        <Node
          x={30}
          y={240}
          w={177}
          h={60}
          label="Pedidos"
          sub="Implantação própria"
          tone="accent"
        />
        <Node
          x={273}
          y={240}
          w={177}
          h={60}
          label="Catálogo"
          sub="Implantação própria"
          tone="accent"
        />
        <Arrow x1={207} y1={270} x2={273} y2={270} />
        <Text x={240} y={253} size={13}>
          API
        </Text>
        <Arrow x1={118.5} y1={300} x2={118.5} y2={337} />
        <Arrow x1={361.5} y1={300} x2={361.5} y2={337} />
        <Node x={30} y={337} w={177} h={49} label="Dados de pedidos" />
        <Node x={273} y={337} w={177} h={49} label="Dados de catálogo" />
      </Swimlane>
    </Diagram>
  );
}
