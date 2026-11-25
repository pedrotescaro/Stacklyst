import { Arrow, Diagram, Diamond, Node, Text } from '../primitives';

export const readingInference = {
  title: 'Pistas e inferências na construção do sentido',
  alt: 'A inferência combina marcas do texto, a situação de comunicação e saberes do leitor. Verifica-se se a hipótese de leitura tem apoio textual. Se tem, é sustentada. Se não, volta-se às pistas e revisa-se a hipótese.',
};

export function ReadingInference() {
  return (
    <Diagram title={readingInference.title} desc={readingInference.alt} height={373}>
      <Node x={17} y={21} w={134} h={58} label={['Pistas', 'do texto']} />
      <Node x={168} y={21} w={136} h={58} label={['Situação de', 'comunicação']} />
      <Node x={321} y={21} w={142} h={58} label={['Conhecimento', 'de mundo']} />
      <Arrow d="M84 79V104H392V79" kind="none" />
      <Arrow x1={236} y1={79} x2={236} y2={126} />
      <Node x={105} y={126} w={262} h={53} label="Inferência do leitor" tone="accent" />
      <Arrow x1={236} y1={179} x2={236} y2={198} />
      <Diamond x={161} y={198} w={150} h={82} label={['Há apoio', 'no texto?']} />
      <Arrow d="M161 239H133V316" tone="neutral" />
      <Arrow d="M311 239H351V316" tone="neutral" />
      <Text x={119} y={272} size={13} muted>
        Sim
      </Text>
      <Text x={368} y={272} size={13} muted>
        Não
      </Text>
      <Node x={44} y={316} w={178} h={40} label="Sustentar a leitura" />
      <Node x={262} y={316} w={178} h={40} label="Rever a leitura" />
      <Arrow d="M440 338H468V12H84V21" tone="neutral" dashed />
    </Diagram>
  );
}
