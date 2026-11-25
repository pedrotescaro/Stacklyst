import { Arrow, Diagram, Node, Phase, Text } from '../primitives';

export const description =
  'Uma ficha com turmas repetidas vira uma matrícula por linha em 1FN. A 2FN separa as dependências parciais aluno para nome e turma para professor em relações próprias, preservando a matrícula com chave composta. A 3FN move professor para sua própria tabela para remover a dependência transitiva. Na BCNF, cada determinante de uma dependência não trivial deve ser superchave.';

export function FunctionalDependencyNormalization() {
  return (
    <Diagram title="Normalização por dependências funcionais" desc={description} height={528}>
      <Node x={58} y={10} w={364} h={45} label="Ficha com turmas repetidas" />
      <Arrow x1={240} y1={55} x2={240} y2={87} />
      <Text x={251} y={69} align="start" muted size={13}>
        uma turma por linha
      </Text>
      <Phase
        x={19}
        y={87}
        w={442}
        h={73}
        label="1FN · Matrícula"
        sub={['Chave (aluno, turma)', 'Nomes e códigos na mesma linha']}
      />
      <Arrow d="M240 160 V181 H82 V230" />
      <Arrow d="M240 181 V230" />
      <Arrow d="M240 181 H398 V230" />
      <Text x={98} y={204} align="start" size={13}>
        aluno → nome
      </Text>
      <Text x={230} y={219} align="end" size={13}>
        turma → professor
      </Text>
      <Text x={389} y={204} align="end" size={13}>
        chave composta
      </Text>
      <Node x={9} y={230} w={146} h={73} label="2FN · Aluno" sub="(aluno, nome)" />
      <Node
        x={167}
        y={230}
        w={146}
        h={73}
        label="2FN · Turma"
        sub={['(turma, professor,', 'nomeProf)']}
      />
      <Node x={325} y={230} w={146} h={73} label="2FN · Matrícula" sub="(aluno, turma)" />
      <Arrow d="M240 303 V331 H182 V373" />
      <Arrow d="M240 331 H364 V373" />
      <Text x={174} y={351} align="end" muted size={13}>
        preserva FK
      </Text>
      <Text x={319} y={351} size={13}>
        professor → nomeProf
      </Text>
      <Node x={100} y={373} w={163} h={55} label="3FN · Turma" sub="(turma, professor)" />
      <Node x={283} y={373} w={163} h={55} label="3FN · Professor" sub="(professor, nome)" />
      <path d="M14 454 H466" stroke="var(--enade-line)" />
      <Text x={240} y={476} weight={600}>
        Teste de Boyce–Codd nas relações resultantes
      </Text>
      <Text x={240} y={503} size={13} muted>
        Todo determinante não trivial é superchave?
      </Text>
    </Diagram>
  );
}
