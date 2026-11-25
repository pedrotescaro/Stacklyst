import { Arrow, Diagram, Node, Text } from '../primitives';

export const description =
  'Em duas camadas físicas, o cliente roda apresentação e regras e acessa um servidor de dados. Em três, o cliente roda a apresentação, um servidor de aplicação recebe as regras e o servidor de dados guarda a persistência.';

export function PhysicalTiers() {
  return (
    <Diagram title="Duas e três camadas físicas" desc={description} height={350}>
      <Text x={117} y={22} weight={600}>
        Duas camadas físicas
      </Text>
      <Text x={363} y={22} weight={600}>
        Três camadas físicas
      </Text>
      <path d="M240 16 V335 M12 44 H222 M258 44 H468" stroke="var(--enade-line)" />
      <Node
        x={12}
        y={66}
        w={210}
        h={77}
        label="Cliente"
        sub={['Apresentação', 'Regras de negócio']}
        tone="accent"
      />
      <Node x={258} y={66} w={210} h={77} label="Cliente" sub="Apresentação" tone="accent" />
      <Node
        x={258}
        y={170}
        w={210}
        h={72}
        label="Servidor de aplicação"
        sub="Regras de negócio"
        tone="accent"
      />
      <Node x={12} y={271} w={210} h={58} label="Servidor de dados" sub="Persistência" />
      <Node x={258} y={271} w={210} h={58} label="Servidor de dados" sub="Persistência" />
      <Arrow d="M117 143 V271" />
      <Arrow d="M363 143 V170" />
      <Arrow d="M363 242 V271" />
      <Text x={130} y={212} align="start" muted size={13}>
        acessa dados
      </Text>
    </Diagram>
  );
}
