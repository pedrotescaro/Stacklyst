import { Arrow, Diagram, Node, Note, Text } from '../primitives';

export const details = {
  title: 'Espiral da engenharia de requisitos',
  alt: 'Quando é preciso avaliar a viabilidade, o estudo informa o início do processo. Os ciclos intercalam elicitação e análise, especificação e validação. A quantidade de voltas varia conforme o projeto, e o detalhamento avança dos requisitos de negócio para os de usuários e do sistema. Prototipação e revisão apoiam a validação. O documento de requisitos consolida os resultados.',
};

export function RequirementsSpiral() {
  return (
    <Diagram title={details.title} desc={details.alt} height={518}>
      <Node x={12} y={20} w={200} h={56} label="Elicitação e análise" sub="Entender e negociar" />
      <Node x={268} y={20} w={200} h={56} label="Especificação" sub="Registrar requisitos" />
      <Node x={12} y={331} w={210} h={55} label="Validação" sub="Prototipar e revisar" />
      <path
        d="M240 90 V202 L119 268 M240 202 L366 258"
        fill="none"
        stroke="var(--enade-line)"
        strokeDasharray="4 4"
      />
      <Arrow d="M237 202 C235 196 248 187 258 198 C275 216 254 236 229 229 C191 218 190 169 233 156 C277 142 319 176 313 217 C306 270 247 291 200 264 C147 233 141 168 184 128 C225 91 299 95 345 137 C383 172 381 231 353 264" />
      <circle cx={237} cy={202} r={3.8} fill="var(--color-dd-accent)" />
      <Text x={24} y={140} align="start" size={13} muted>
        Viabilidade, se necessário
      </Text>
      <Arrow d="M24 152 V202 H232" dashed tone="neutral" kind="open" />
      <Text x={355} y={294} muted>
        Detalhamento
      </Text>
      <Text x={355} y={312} muted>
        crescente
      </Text>
      <Arrow d="M353 324 V402" />
      <Note x={244} y={402} w={222} h={56} label={['Documento de', 'requisitos']} />
      <Text x={235} y={478} muted>
        Negócio, usuários e sistema são detalhados nas voltas.
      </Text>
      <Text x={235} y={499} size={13} muted>
        O número de voltas varia conforme o projeto.
      </Text>
    </Diagram>
  );
}
