import { Arrow, Diagram, Text } from '../primitives';

export const title = 'Entradas e saídas LIFO e FIFO';
export const alt =
  'Uma pilha com A, B e C recebe e remove itens pelo topo, ocupado por C. Uma fila com os mesmos itens recebe o próximo item pelo fim, junto a C, e retira primeiro o item na frente, A.';

export default function StackAndQueueOperations() {
  return (
    <Diagram title={title} desc={alt} height={286}>
      <Text x={18} y={24} align="start" weight={600} size={16}>
        Pilha · LIFO
      </Text>
      <Text x={262} y={24} align="start" weight={600} size={16}>
        Fila · FIFO
      </Text>
      <line x1={240} y1={17} x2={240} y2={267} stroke="var(--enade-line)" strokeWidth={1.5} />
      <Arrow x1={105} y1={58} x2={105} y2={99} />
      <Arrow x1={143} y1={99} x2={143} y2={58} tone="neutral" />
      <Text x={92} y={69} align="end" muted>
        Inserir
      </Text>
      <Text x={155} y={69} align="start" muted>
        Retirar
      </Text>
      <path
        d="M70 101V229Q70 240 81 240H182Q193 240 193 229V101"
        fill="none"
        stroke="var(--color-dd-muted)"
        strokeWidth={1.5}
      />
      <path d="M70 156H193M70 198H193" fill="none" stroke="var(--enade-line)" strokeWidth={1.5} />
      <Text x={131} y={134} weight={600}>
        C · topo
      </Text>
      <Text x={131} y={177}>
        B
      </Text>
      <Text x={131} y={219}>
        A · base
      </Text>
      <path
        d="M265 139H461M265 189H461M332 139V189M398 139V189"
        fill="none"
        stroke="var(--color-dd-muted)"
        strokeWidth={1.5}
      />
      <Text x={298} y={164} weight={600}>
        C
      </Text>
      <Text x={365} y={164}>
        B
      </Text>
      <Text x={430} y={164} weight={600}>
        A
      </Text>
      <Text x={298} y={119} muted>
        Fim
      </Text>
      <Text x={430} y={119} muted>
        Frente
      </Text>
      <Arrow x1={299} y1={224} x2={299} y2={195} />
      <Arrow x1={430} y1={195} x2={430} y2={224} tone="neutral" />
      <Text x={299} y={243} muted>
        Inserir
      </Text>
      <Text x={430} y={243} muted>
        Retirar
      </Text>
    </Diagram>
  );
}
