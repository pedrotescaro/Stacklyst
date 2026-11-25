import { Arrow, Diagram, Node, Phase, Text } from '../primitives';

export const comicsReadingLayers = {
  title: 'Como palavra e imagem constroem o sentido nos quadrinhos',
  alt: 'A linguagem verbal, os gestos e enquadramentos e a sequência dos quadros se combinam. As pistas integradas e o contexto permitem interpretar a cena e identificar seu humor, crítica ou efeito de sentido.',
};

export function ComicsReadingLayers() {
  return (
    <Diagram title={comicsReadingLayers.title} desc={comicsReadingLayers.alt} height={301}>
      <Text x={24} y={23} align="start" size={13} muted>
        Pistas da cena
      </Text>
      <Node x={24} y={39} w={136} h={63} label={['Falas e', 'balões']} />
      <Node x={172} y={39} w={136} h={63} label={['Gestos e', 'enquadramento']} />
      <Node x={320} y={39} w={136} h={63} label={['Sequência', 'dos quadros']} />
      <Arrow d="M92 102V121H240 M388 102V121H240" kind="none" />
      <Arrow x1={240} y1={102} x2={240} y2={141} />
      <Phase x={112} y={141} w={256} h={50} label="Integrar palavra e imagem" />
      <Arrow d="M240 191V226H289V241" />
      <Node x={24} y={240} w={113} h={43} label="Contexto" />
      <Arrow d="M137 262H166" tone="neutral" />
      <Node x={166} y={241} w={290} h={42} label="Interpretar humor, crítica ou efeito" />
    </Diagram>
  );
}
