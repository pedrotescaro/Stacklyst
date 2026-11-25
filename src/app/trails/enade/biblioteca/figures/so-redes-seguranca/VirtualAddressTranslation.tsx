import { Arrow, Diagram, Diamond, Node, Text } from '../primitives';

export const title = 'Da página virtual ao quadro';
export const alt =
  'A MMU busca a página na TLB. Se houver acerto, usa o número do quadro. Se não houver, consulta a tabela de páginas. Uma página presente permite atualizar a TLB. Uma página ausente provoca uma falta, tratada pelo sistema operacional, e a instrução é reiniciada. O quadro encontrado é combinado com o deslocamento original.';

export default function VirtualAddressTranslation() {
  return (
    <Diagram title={title} desc={alt} height={486}>
      <Arrow x1={150} y1={66} x2={150} y2={88} />
      <Arrow x1={150} y1={156} x2={150} y2={188} />
      <Arrow d="M242 122H474V316H378" kind="none" />
      <Arrow x1={150} y1={262} x2={150} y2={289} />
      <Arrow d="M244 225H378V245" />
      <Arrow x1={378} y1={293} x2={378} y2={340} />
      <Arrow x1={150} y1={332} x2={150} y2={368} tone="warning" />
      <Arrow d="M57 403H24V39H57" dashed tone="neutral" />
      <Arrow x1={378} y1={390} x2={378} y2={416} />
      <Text x={257} y={107} align="start" muted>
        Sim
      </Text>
      <Text x={161} y={172} align="start" muted>
        Não
      </Text>
      <Text x={257} y={209} align="start" muted>
        Sim
      </Text>
      <Text x={161} y={276} align="start" muted>
        Não
      </Text>
      <Text x={53} y={459} align="start" muted>
        O SO reinicia a instrução.
      </Text>
      <Node x={57} y={12} w={186} h={54} label="Endereço virtual" sub="Página + deslocamento" />
      <Diamond x={58} y={88} w={184} h={68} label="Entrada na TLB?" tone="accent" />
      <Diamond
        x={56}
        y={188}
        w={188}
        h={74}
        label={['Página presente', 'na tabela?']}
        tone="accent"
      />
      <Node x={288} y={245} w={180} h={48} label="Atualizar TLB" />
      <Node x={57} y={289} w={186} h={43} label="Falta de página" tone="warning" />
      <Node x={57} y={368} w={186} h={70} label={['SO carrega a página', 'e atualiza a tabela']} />
      <Node x={288} y={340} w={180} h={50} label="Número do quadro" />
      <Node
        x={288}
        y={416}
        w={180}
        h={58}
        label="Endereço físico"
        sub="Quadro + deslocamento"
        tone="accent"
      />
    </Diagram>
  );
}
