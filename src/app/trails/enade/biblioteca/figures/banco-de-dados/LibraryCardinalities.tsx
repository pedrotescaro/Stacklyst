import { Diagram, Text } from '../primitives';

function Relation({
  x,
  y,
  w,
  name,
  fields,
}: {
  x: number;
  y: number;
  w: number;
  name: string;
  fields: { column: string; key?: string }[];
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={40 + fields.length * 26}
        rx={8}
        fill="var(--enade-softer)"
        stroke="var(--enade-line)"
      />
      <Text x={x + 13} y={y + 17} align="start" weight={600}>
        {name}
      </Text>
      <path d={`M${x} ${y + 34} h${w}`} stroke="var(--enade-line)" />
      {fields.map(({ column, key }, index) => (
        <g key={column}>
          <Text x={x + 13} y={y + 51 + index * 26} align="start" size={13}>
            {column}
          </Text>
          {key && (
            <Text x={x + w - 13} y={y + 51 + index * 26} align="end" size={13} muted>
              {key}
            </Text>
          )}
        </g>
      ))}
    </g>
  );
}

function OneMark({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 6} ${y}h12m-12 6h12`} stroke="var(--color-dd-text)" />;
}

function OptionalMany({ x, y, direction = 1 }: { x: number; y: number; direction?: 1 | -1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${direction})`}>
      <circle cy={-22} r={4.5} fill="var(--enade-softer)" stroke="var(--color-dd-text)" />
      <path d="M0 -17.5 V0 M-8 0 L0 -12 L8 0" fill="none" stroke="var(--color-dd-text)" />
    </g>
  );
}

export const description =
  'Cada empréstimo pertence a exatamente um aluno e referencia exatamente um livro, com zero ou muitos empréstimos por aluno ou livro. LivroAutor transforma a relação de muitos livros para muitos autores em duas relações um para muitos. A chave de LivroAutor é composta por livro e autor, ambos também chaves estrangeiras.';

export function LibraryCardinalities() {
  return (
    <Diagram title="Cardinalidades do cadastro da biblioteca" desc={description} height={603}>
      <Relation
        x={13}
        y={14}
        w={194}
        name="Aluno"
        fields={[{ column: 'matrícula', key: 'PK' }, { column: 'nome' }]}
      />
      <Relation
        x={273}
        y={14}
        w={194}
        name="Livro"
        fields={[{ column: 'livro_id', key: 'PK' }, { column: 'título' }]}
      />
      <Relation
        x={13}
        y={216}
        w={194}
        name="Empréstimo"
        fields={[
          { column: 'empréstimo_id', key: 'PK' },
          { column: 'livro_id', key: 'FK' },
          { column: 'aluno_mat', key: 'FK' },
          { column: 'data_empréstimo' },
          { column: 'data_devolução' },
        ]}
      />
      <Relation
        x={273}
        y={216}
        w={194}
        name="LivroAutor"
        fields={[
          { column: 'livro_id', key: 'PK · FK' },
          { column: 'autor_id', key: 'PK · FK' },
        ]}
      />
      <Relation
        x={273}
        y={430}
        w={194}
        name="Autor"
        fields={[{ column: 'autor_id', key: 'PK' }, { column: 'nome' }]}
      />
      <path
        d="M56 106 V189 M312 106 V162 H160 V189"
        fill="none"
        stroke="var(--color-dd-muted)"
        strokeDasharray="5 4"
      />
      <path d="M406 106 V189 M370 430 V335" fill="none" stroke="var(--color-dd-muted)" />
      <OneMark x={56} y={115} />
      <OneMark x={312} y={115} />
      <OneMark x={406} y={115} />
      <OneMark x={370} y={413} />
      <OptionalMany x={56} y={216} />
      <OptionalMany x={160} y={216} />
      <OptionalMany x={406} y={216} />
      <OptionalMany x={370} y={308} direction={-1} />
      <path d="M13 544 H467" stroke="var(--enade-line)" />
      <Text x={13} y={563} align="start" size={13}>
        PK · chave primária
      </Text>
      <Text x={467} y={563} align="end" size={13}>
        FK · chave estrangeira
      </Text>
      <Text x={13} y={586} align="start" muted size={13}>
        Pé de galinha: um obrigatório e zero ou muitos
      </Text>
    </Diagram>
  );
}
