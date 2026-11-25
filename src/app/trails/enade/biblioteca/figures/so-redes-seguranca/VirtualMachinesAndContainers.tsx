import { Arrow, Diagram, Node, Text } from '../primitives';

export const title = 'Hipervisor e kernel compartilhado';
export const alt =
  'Duas máquinas virtuais executam sistemas operacionais convidados próprios sobre um hipervisor tipo 1, que opera sobre o hardware. Dois contêineres isolam aplicações e dependências, são gerenciados por um runtime e usam o mesmo kernel do hospedeiro sobre o hardware.';

export default function VirtualMachinesAndContainers() {
  return (
    <Diagram title={title} desc={alt} height={298}>
      <Text x={119} y={25} weight={600} size={16}>
        Máquinas virtuais
      </Text>
      <Text x={361} y={25} weight={600} size={16}>
        Contêineres
      </Text>
      <line x1={240} y1={42} x2={240} y2={284} stroke="var(--enade-line)" strokeWidth={1.5} />
      <Arrow d="M65 128V146H119V192" />
      <Arrow d="M173 128V146H119" kind="none" />
      <Arrow x1={119} y1={228} x2={119} y2={245} />
      <Arrow d="M307 128V135H361V144" />
      <Arrow d="M415 128V135H361" kind="none" />
      <Arrow x1={361} y1={180} x2={361} y2={192} />
      <Arrow x1={361} y1={228} x2={361} y2={245} />
      <Node x={14} y={49} w={102} h={79} label="Aplicação A" sub={['SO', 'convidado']} />
      <Node x={122} y={49} w={102} h={79} label="Aplicação B" sub={['SO', 'convidado']} />
      <Node x={256} y={49} w={102} h={79} label="Aplicação A" sub="Dependências" />
      <Node x={364} y={49} w={102} h={79} label="Aplicação B" sub="Dependências" />
      <Node x={20} y={192} w={198} h={36} label="Hipervisor tipo 1" tone="accent" />
      <Node x={262} y={144} w={198} h={36} label="Runtime de contêineres" />
      <Node x={262} y={192} w={198} h={36} label="Kernel do hospedeiro" tone="accent" />
      <Node x={20} y={245} w={198} h={37} label="Hardware" />
      <Node x={262} y={245} w={198} h={37} label="Hardware" />
    </Diagram>
  );
}
