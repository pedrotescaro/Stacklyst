import { Arrow, Diagram, Node, Text } from '../primitives';

export const title = 'Geração e verificação da assinatura';
export const alt =
  'O signatário gera uma assinatura a partir da mensagem e da chave privada. Envia mensagem e assinatura ao destinatário. O destinatário verifica ambas com a chave pública validada do signatário e obtém um resultado válido ou inválido. A chave privada permanece com o signatário.';

export default function DigitalSignatureFlow() {
  return (
    <Diagram title={title} desc={alt} height={363}>
      <Text x={18} y={23} align="start" weight={600}>
        Signatário
      </Text>
      <Text x={18} y={204} align="start" weight={600}>
        Destinatário
      </Text>
      <line x1={18} y1={175} x2={462} y2={175} stroke="var(--enade-line)" strokeWidth={1.5} />
      <Arrow d="M88 90V108H123V120" />
      <Arrow d="M249 90V108H215V120" />
      <Arrow d="M169 164V233" />
      <Arrow x1={322} y1={255} x2={273} y2={255} />
      <Arrow d="M169 277V302H95V314" tone="success" />
      <Arrow d="M169 302H267V314" tone="danger" />
      <Node x={18} y={48} w={140} h={42} label="Mensagem" />
      <Node x={179} y={48} w={140} h={42} label="Chave privada" />
      <Node x={67} y={120} w={206} h={44} label="Gerar assinatura" tone="accent" />
      <Text x={182} y={198} align="start" muted>
        Mensagem original e assinatura
      </Text>
      <Node x={67} y={233} w={206} h={44} label="Verificar assinatura" tone="accent" />
      <Node x={322} y={222} w={140} h={66} label="Chave pública" sub="Validada" />
      <Node x={18} y={314} w={155} h={35} label="Válida" tone="success" />
      <Node x={190} y={314} w={155} h={35} label="Inválida" tone="danger" />
    </Diagram>
  );
}
