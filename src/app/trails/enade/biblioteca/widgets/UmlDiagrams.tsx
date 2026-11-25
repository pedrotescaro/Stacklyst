'use client';
import { useId, type ReactNode } from 'react';
import styles from './widgets.module.css';

/*
 * Hand-drawn UML 2.5 notation for the diagrams Mermaid cannot draw faithfully.
 * Strokes use currentColor so they follow the light/dark theme.
 */

const STROKE = 'var(--color-dd-text)';
const FILL = 'var(--color-dd-bg)';
const SOFT = 'color-mix(in srgb, var(--color-dd-accent) 9%, var(--color-dd-bg))';

function Markers({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={`${id}-open`}
        viewBox="0 0 12 12"
        refX="11"
        refY="6"
        markerWidth="10"
        markerHeight="10"
        orient="auto-start-reverse"
      >
        <path d="M1,1 L11,6 L1,11" fill="none" stroke={STROKE} strokeWidth="1.4" />
      </marker>
      <marker
        id={`${id}-filled`}
        viewBox="0 0 12 12"
        refX="11"
        refY="6"
        markerWidth="9"
        markerHeight="9"
        orient="auto-start-reverse"
      >
        <path d="M1,1 L11,6 L1,11 Z" fill={STROKE} />
      </marker>
      <marker
        id={`${id}-triangle`}
        viewBox="0 0 14 14"
        refX="13"
        refY="7"
        markerWidth="13"
        markerHeight="13"
        orient="auto-start-reverse"
      >
        <path d="M1,1 L13,7 L1,13 Z" fill={FILL} stroke={STROKE} strokeWidth="1.3" />
      </marker>
      <marker
        id={`${id}-hollow-diamond`}
        viewBox="0 0 20 12"
        refX="1"
        refY="6"
        markerWidth="18"
        markerHeight="11"
        orient="auto-start-reverse"
      >
        <path d="M1,6 L10,1 L19,6 L10,11 Z" fill={FILL} stroke={STROKE} strokeWidth="1.3" />
      </marker>
      <marker
        id={`${id}-diamond`}
        viewBox="0 0 20 12"
        refX="1"
        refY="6"
        markerWidth="18"
        markerHeight="11"
        orient="auto-start-reverse"
      >
        <path d="M1,6 L10,1 L19,6 L10,11 Z" fill={STROKE} />
      </marker>
    </defs>
  );
}

function Actor({ x, y, name }: { x: number; y: number; name: string }) {
  return (
    <g stroke={STROKE} strokeWidth={1.5} fill="none">
      <circle cx={x} cy={y} r={9} />
      <line x1={x} y1={y + 9} x2={x} y2={y + 34} />
      <line x1={x - 14} y1={y + 18} x2={x + 14} y2={y + 18} />
      <line x1={x} y1={y + 34} x2={x - 12} y2={y + 52} />
      <line x1={x} y1={y + 34} x2={x + 12} y2={y + 52} />
      <text
        x={x}
        y={y + 68}
        textAnchor="middle"
        stroke="none"
        fill={STROKE}
        style={{ fontSize: 12 }}
      >
        {name}
      </text>
    </g>
  );
}

function UseCase({ x, y, label, w = 130 }: { x: number; y: number; label: string; w?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={w / 2} ry={21} fill={SOFT} stroke={STROKE} strokeWidth={1.3} />
      <text x={x} y={y + 4} textAnchor="middle" style={{ fontSize: 11.5 }}>
        {label}
      </text>
    </g>
  );
}

function Box({
  x,
  y,
  w,
  h,
  children,
  tab,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  children?: ReactNode;
  tab?: string;
}) {
  return (
    <g>
      {tab && (
        <rect
          x={x}
          y={y - 16}
          width={Math.max(60, tab.length * 7)}
          height={16}
          fill={SOFT}
          stroke={STROKE}
          strokeWidth={1.2}
        />
      )}
      <rect x={x} y={y} width={w} height={h} fill={SOFT} stroke={STROKE} strokeWidth={1.3} />
      {children}
    </g>
  );
}

function Label({
  x,
  y,
  children,
  anchor = 'middle',
  size = 11.5,
  weight,
  italic,
  underline,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  weight?: number;
  italic?: boolean;
  underline?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      style={{
        fontSize: size,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : undefined,
        textDecoration: underline ? 'underline' : undefined,
      }}
    >
      {children}
    </text>
  );
}

const DIAGRAMS: Record<
  string,
  { title: string; height: number; render: (id: string) => ReactNode; caption: string }
> = {
  usecase: {
    title: 'Diagrama de casos de uso — sistema de biblioteca',
    height: 330,
    caption:
      'Atores ficam fora da fronteira do sistema. «include» aponta para o caso sempre executado; «extend» aponta para o caso base e só ocorre sob condição. Generalização de atores usa seta com triângulo vazado.',
    render: (id) => (
      <>
        <rect
          x={150}
          y={14}
          width={420}
          height={300}
          rx={4}
          fill="none"
          stroke={STROKE}
          strokeWidth={1.3}
        />
        <Label x={360} y={32} weight={650}>
          Sistema de Biblioteca
        </Label>
        <Actor x={60} y={60} name="Leitor" />
        <Actor x={60} y={210} name="Aluno" />
        <Actor x={650} y={120} name="Bibliotecário" />
        <line
          x1={60}
          y1={196}
          x2={60}
          y2={136}
          stroke={STROKE}
          strokeWidth={1.3}
          markerEnd={`url(#${id}-triangle)`}
        />
        <UseCase x={270} y={80} label="Realizar empréstimo" />
        <UseCase x={470} y={80} label="Autenticar usuário" />
        <UseCase x={270} y={190} label="Devolver livro" />
        <UseCase x={470} y={190} label="Pagar multa" />
        <UseCase x={360} y={275} label="Cadastrar livro" w={120} />
        <line x1={76} y1={82} x2={204} y2={80} stroke={STROKE} strokeWidth={1.3} />
        <line x1={76} y1={92} x2={210} y2={182} stroke={STROKE} strokeWidth={1.3} />
        <line x1={636} y1={142} x2={420} y2={268} stroke={STROKE} strokeWidth={1.3} />
        <line x1={636} y1={136} x2={536} y2={92} stroke={STROKE} strokeWidth={1.3} />
        <line
          x1={336}
          y1={80}
          x2={402}
          y2={80}
          stroke={STROKE}
          strokeWidth={1.2}
          strokeDasharray="6 4"
          markerEnd={`url(#${id}-open)`}
        />
        <Label x={369} y={72} size={10.5} italic>
          «include»
        </Label>
        <line
          x1={404}
          y1={190}
          x2={338}
          y2={190}
          stroke={STROKE}
          strokeWidth={1.2}
          strokeDasharray="6 4"
          markerEnd={`url(#${id}-open)`}
        />
        <Label x={371} y={182} size={10.5} italic>
          «extend»
        </Label>
        <Label x={470} y={224} size={10} anchor="middle">
          [se houver atraso]
        </Label>
      </>
    ),
  },
  relationships: {
    title: 'Relacionamentos entre classes — notação',
    height: 330,
    caption:
      'Associação (linha), associação navegável (seta aberta), agregação (losango vazado no todo), composição (losango cheio no todo), generalização/herança (triângulo vazado na superclasse), realização (tracejada + triângulo vazado na interface) e dependência (tracejada + seta aberta).',
    render: (id) => {
      const rows = [
        { label: 'Associação', a: 'Cliente', b: 'Pedido', line: {}, mult: ['1', '0..*'] },
        { label: 'Navegável', a: 'Pedido', b: 'Endereço', line: { end: 'open' } },
        {
          label: 'Agregação',
          a: 'Time',
          b: 'Jogador',
          line: { start: 'hollow-diamond' },
          mult: ['0..1', '*'],
        },
        {
          label: 'Composição',
          a: 'Pedido',
          b: 'ItemPedido',
          line: { start: 'diamond' },
          mult: ['1', '1..*'],
        },
        { label: 'Generalização', a: 'Aluno', b: 'Pessoa', line: { end: 'triangle' } },
        {
          label: 'Realização',
          a: 'PixPagamento',
          b: '«interface» Pagavel',
          line: { end: 'triangle', dashed: true },
        },
        {
          label: 'Dependência',
          a: 'Relatorio',
          b: 'Formatador',
          line: { end: 'open', dashed: true },
        },
      ] as const;
      return rows.map((row, i) => {
        const y = 22 + i * 44;
        const line = row.line as { start?: string; end?: string; dashed?: boolean };
        return (
          <g key={row.label}>
            <Label x={10} y={y + 18} anchor="start" weight={650}>
              {row.label}
            </Label>
            <Box x={130} y={y} w={120} h={28}>
              <Label x={190} y={y + 18}>
                {row.a}
              </Label>
            </Box>
            <Box x={470} y={y} w={150} h={28}>
              <Label x={545} y={y + 18}>
                {row.b}
              </Label>
            </Box>
            <line
              x1={line.start ? 250 : 250}
              y1={y + 14}
              x2={470}
              y2={y + 14}
              stroke={STROKE}
              strokeWidth={1.3}
              strokeDasharray={line.dashed ? '6 4' : undefined}
              markerStart={line.start ? `url(#${id}-${line.start})` : undefined}
              markerEnd={line.end ? `url(#${id}-${line.end})` : undefined}
            />
            {'mult' in row && row.mult && (
              <>
                <Label x={268} y={y + 9} size={10.5} anchor="start">
                  {row.mult[0]}
                </Label>
                <Label x={452} y={y + 9} size={10.5} anchor="end">
                  {row.mult[1]}
                </Label>
              </>
            )}
          </g>
        );
      });
    },
  },
  object: {
    title: 'Diagrama de objetos — um instante do sistema',
    height: 200,
    caption:
      'Objetos são instâncias: nome sublinhado no formato objeto : Classe e atributos com valores concretos. As linhas são vínculos (links), instâncias das associações.',
    render: () => (
      <>
        {[
          { x: 20, name: 'ana : Cliente', slots: ['nome = "Ana"', 'cpf = "123…"'] },
          { x: 250, name: 'p42 : Pedido', slots: ['numero = 42', 'status = PAGO'] },
          { x: 480, name: 'i1 : ItemPedido', slots: ['qtd = 2', 'preco = 19.90'] },
        ].map((o) => (
          <g key={o.name}>
            <Box x={o.x} y={40} w={180} h={100}>
              <line x1={o.x} y1={68} x2={o.x + 180} y2={68} stroke={STROKE} />
              <Label x={o.x + 90} y={59} underline weight={650}>
                {o.name}
              </Label>
              {o.slots.map((s, i) => (
                <Label key={s} x={o.x + 10} y={90 + i * 20} anchor="start">
                  {s}
                </Label>
              ))}
            </Box>
          </g>
        ))}
        <line x1={200} y1={90} x2={250} y2={90} stroke={STROKE} strokeWidth={1.3} />
        <line x1={430} y1={90} x2={480} y2={90} stroke={STROKE} strokeWidth={1.3} />
      </>
    ),
  },
  component: {
    title: 'Diagrama de componentes',
    height: 220,
    caption:
      'Componente: retângulo com «component» (ou o ícone). Interface fornecida = “pirulito” (círculo); interface requerida = “soquete” (meia-lua). O encaixe pirulito-soquete mostra a montagem (assembly).',
    render: () => {
      const component = (x: number, name: string) => (
        <Box x={x} y={60} w={170} h={80}>
          <Label x={x + 85} y={88} italic size={10.5}>
            «component»
          </Label>
          <Label x={x + 85} y={108} weight={650}>
            {name}
          </Label>
          <rect x={x + 142} y={70} width={18} height={14} fill="none" stroke={STROKE} />
          <rect x={x + 138} y={73} width={8} height={3} fill={FILL} stroke={STROKE} />
          <rect x={x + 138} y={79} width={8} height={3} fill={FILL} stroke={STROKE} />
        </Box>
      );
      return (
        <>
          {component(20, 'LojaWeb')}
          {component(420, 'ServicoPagamento')}
          <line x1={190} y1={100} x2={300} y2={100} stroke={STROKE} strokeWidth={1.3} />
          <path d="M310,86 A14,14 0 0,0 310,114" fill="none" stroke={STROKE} strokeWidth={1.5} />
          <line x1={318} y1={100} x2={420} y2={100} stroke={STROKE} strokeWidth={1.3} />
          <circle cx={318} cy={100} r={8} fill={FILL} stroke={STROKE} strokeWidth={1.5} />
          <Label x={318} y={76} size={11}>
            IPagamento
          </Label>
          <Label x={250} y={170} size={10.5}>
            requer (soquete)
          </Label>
          <Label x={380} y={170} size={10.5}>
            fornece (pirulito)
          </Label>
        </>
      );
    },
  },
  deployment: {
    title: 'Diagrama de implantação',
    height: 250,
    caption:
      'Nós (caixas 3D) são hardware ou ambientes de execução; artefatos («artifact») são os arquivos implantados neles. As linhas são caminhos de comunicação, com o protocolo como estereótipo.',
    render: () => {
      const node = (x: number, title: string, artifact: string) => (
        <g>
          <path
            d={`M${x},70 l16,-16 h170 v110 l-16,16`}
            fill={SOFT}
            stroke={STROKE}
            strokeWidth={1.3}
          />
          <line x1={x + 170} y1={70} x2={x + 186} y2={54} stroke={STROKE} strokeWidth={1.3} />
          <rect
            x={x}
            y={70}
            width={170}
            height={110}
            fill={SOFT}
            stroke={STROKE}
            strokeWidth={1.3}
          />
          <Label x={x + 85} y={88} italic size={10.5}>
            «device»
          </Label>
          <Label x={x + 85} y={104} weight={650}>
            {title}
          </Label>
          <rect x={x + 20} y={120} width={130} height={40} fill={FILL} stroke={STROKE} />
          <Label x={x + 85} y={136} italic size={10}>
            «artifact»
          </Label>
          <Label x={x + 85} y={152} size={11}>
            {artifact}
          </Label>
        </g>
      );
      return (
        <>
          {node(10, 'Navegador', 'app.js')}
          {node(240, 'Servidor de aplicação', 'api.jar')}
          {node(470, 'Servidor de BD', 'schema.sql')}
          <line x1={180} y1={125} x2={240} y2={125} stroke={STROKE} strokeWidth={1.3} />
          <Label x={210} y={116} size={10} italic>
            «HTTPS»
          </Label>
          <line x1={410} y1={125} x2={470} y2={125} stroke={STROKE} strokeWidth={1.3} />
          <Label x={440} y={116} size={10} italic>
            «TCP/IP»
          </Label>
        </>
      );
    },
  },
  package: {
    title: 'Diagrama de pacotes',
    height: 220,
    caption:
      'Pacotes agrupam elementos (pasta com aba). A dependência tracejada com «import» indica que um pacote usa elementos públicos do outro; dependências devem apontar das camadas de cima para as de baixo.',
    render: (id) => (
      <>
        <Box x={20} y={60} w={170} h={90} tab="apresentacao">
          <Label x={105} y={110}>
            Telas, Controllers
          </Label>
        </Box>
        <Box x={260} y={60} w={170} h={90} tab="negocio">
          <Label x={345} y={110}>
            Serviços, Regras
          </Label>
        </Box>
        <Box x={500} y={60} w={170} h={90} tab="dados">
          <Label x={585} y={110}>
            Repositórios, DAOs
          </Label>
        </Box>
        <line
          x1={190}
          y1={105}
          x2={258}
          y2={105}
          stroke={STROKE}
          strokeDasharray="6 4"
          markerEnd={`url(#${id}-open)`}
        />
        <Label x={224} y={96} size={10} italic>
          «import»
        </Label>
        <line
          x1={430}
          y1={105}
          x2={498}
          y2={105}
          stroke={STROKE}
          strokeDasharray="6 4"
          markerEnd={`url(#${id}-open)`}
        />
        <Label x={464} y={96} size={10} italic>
          «import»
        </Label>
      </>
    ),
  },
  composite: {
    title: 'Diagrama de estrutura composta',
    height: 230,
    caption:
      'Mostra a estrutura interna de uma classe: partes (instâncias que a compõem), portas (pequenos quadrados na borda) e conectores entre as partes.',
    render: () => (
      <>
        <rect
          x={60}
          y={20}
          width={560}
          height={190}
          fill="none"
          stroke={STROKE}
          strokeWidth={1.4}
        />
        <Label x={340} y={40} weight={650}>
          Carro
        </Label>
        <rect x={110} y={80} width={160} height={70} fill={SOFT} stroke={STROKE} />
        <Label x={190} y={120}>
          motor : Motor
        </Label>
        <rect x={410} y={80} width={160} height={70} fill={SOFT} stroke={STROKE} />
        <Label x={490} y={113}>
          rodas : Roda [4]
        </Label>
        <line x1={270} y1={115} x2={410} y2={115} stroke={STROKE} strokeWidth={1.3} />
        <Label x={340} y={106} size={10.5}>
          eixo
        </Label>
        <rect x={52} y={108} width={16} height={16} fill={FILL} stroke={STROKE} />
        <Label x={36} y={104} size={10.5}>
          ignição
        </Label>
        <line x1={68} y1={116} x2={110} y2={116} stroke={STROKE} />
      </>
    ),
  },
  profile: {
    title: 'Diagrama de perfil',
    height: 200,
    caption:
      'Perfis estendem a UML para um domínio: um estereótipo («stereotype») estende uma metaclasse da UML («metaclass») por uma seta com triângulo cheio. Ex.: «Entidade» para classes persistentes.',
    render: (id) => (
      <>
        <Box x={60} y={60} w={200} h={70}>
          <Label x={160} y={88} italic size={10.5}>
            «metaclass»
          </Label>
          <Label x={160} y={108} weight={650}>
            Class
          </Label>
        </Box>
        <Box x={420} y={60} w={200} h={70}>
          <Label x={520} y={88} italic size={10.5}>
            «stereotype»
          </Label>
          <Label x={520} y={108} weight={650}>
            Entidade
          </Label>
        </Box>
        <line
          x1={420}
          y1={95}
          x2={262}
          y2={95}
          stroke={STROKE}
          strokeWidth={1.3}
          markerEnd={`url(#${id}-filled)`}
        />
        <Label x={340} y={86} size={10.5}>
          extensão
        </Label>
        <Label x={520} y={160} size={10.5}>
          tabela: String
        </Label>
      </>
    ),
  },
  timing: {
    title: 'Diagrama de tempo (timing)',
    height: 210,
    caption:
      'Mostra como o estado de cada linha de vida muda ao longo de um eixo de tempo, com restrições de duração. Útil em sistemas de tempo real e embarcados.',
    render: () => {
      const x = (t: number) => 150 + t * 50;
      return (
        <>
          <rect x={10} y={20} width={660} height={170} fill="none" stroke={STROKE} />
          <line x1={140} y1={20} x2={140} y2={190} stroke={STROKE} />
          <line x1={10} y1={105} x2={670} y2={105} stroke={STROKE} />
          <Label x={75} y={66} weight={650}>
            :Semáforo
          </Label>
          <Label x={75} y={150} weight={650}>
            :Pedestre
          </Label>
          {['Vermelho', 'Amarelo', 'Verde'].map((s, i) => (
            <Label key={s} x={136} y={40 + i * 24} anchor="end" size={10}>
              {s}
            </Label>
          ))}
          <polyline
            points={`${x(0)},84 ${x(4)},84 ${x(4)},36 ${x(8)},36 ${x(8)},60 ${x(9)},60 ${x(9)},84 ${x(10)},84`}
            fill="none"
            stroke="var(--color-dd-accent)"
            strokeWidth={2}
          />
          {['Aguardando', 'Atravessando'].map((s, i) => (
            <Label key={s} x={136} y={130 + i * 30} anchor="end" size={10}>
              {s}
            </Label>
          ))}
          <polyline
            points={`${x(0)},156 ${x(0.5)},156 ${x(0.5)},126 ${x(4)},126 ${x(4)},156 ${x(10)},156`}
            fill="none"
            stroke="var(--color-dd-accent)"
            strokeWidth={2}
          />
          <Label x={x(6)} y={30} size={10}>
            {'{duração ≤ 4 s}'}
          </Label>
          {Array.from({ length: 11 }, (_, t) => (
            <Label key={t} x={x(t)} y={202} size={9.5}>
              {t}
            </Label>
          ))}
        </>
      );
    },
  },
  communication: {
    title: 'Diagrama de comunicação',
    height: 220,
    caption:
      'Mesmas mensagens de um diagrama de sequência, mas organizadas pelos vínculos entre objetos. A ordem é dada pela numeração (1, 1.1, 2…), não pela posição vertical.',
    render: (id) => (
      <>
        {[
          { x: 40, y: 90, name: ':TelaLogin' },
          { x: 290, y: 90, name: ':ControladorAcesso' },
          { x: 540, y: 30, name: ':RepositorioUsuario' },
          { x: 540, y: 160, name: ':Sessao' },
        ].map((o) => (
          <Box key={o.name} x={o.x} y={o.y} w={130} h={34}>
            <Label x={o.x + 65} y={o.y + 21} underline>
              {o.name}
            </Label>
          </Box>
        ))}
        <line x1={170} y1={107} x2={290} y2={107} stroke={STROKE} />
        <line x1={420} y1={100} x2={540} y2={50} stroke={STROKE} />
        <line x1={420} y1={115} x2={540} y2={172} stroke={STROKE} />
        <line x1={190} y1={95} x2={260} y2={95} stroke={STROKE} markerEnd={`url(#${id}-filled)`} />
        <Label x={225} y={88} size={10.5}>
          1: entrar(login, senha)
        </Label>
        <line x1={440} y1={78} x2={510} y2={50} stroke={STROKE} markerEnd={`url(#${id}-filled)`} />
        <Label x={455} y={52} size={10.5} anchor="end">
          1.1: buscar(login)
        </Label>
        <line
          x1={440}
          y1={138}
          x2={510}
          y2={168}
          stroke={STROKE}
          markerEnd={`url(#${id}-filled)`}
        />
        <Label x={460} y={175} size={10.5} anchor="end">
          1.2: criar()
        </Label>
      </>
    ),
  },
  overview: {
    title: 'Diagrama de visão geral de interação',
    height: 280,
    caption:
      'Combina o fluxo de um diagrama de atividades com quadros de interação: cada nó é um quadro “sd” ou uma referência “ref” a outro diagrama de sequência.',
    render: (id) => (
      <>
        <circle cx={340} cy={20} r={8} fill={STROKE} />
        <line x1={340} y1={28} x2={340} y2={48} stroke={STROKE} markerEnd={`url(#${id}-open)`} />
        <rect x={250} y={50} width={180} height={40} fill={SOFT} stroke={STROKE} />
        <path d="M250,50 h34 v10 l-6,6 h-28 z" fill={FILL} stroke={STROKE} />
        <Label x={262} y={62} size={10} weight={650}>
          ref
        </Label>
        <Label x={340} y={78}>
          Autenticar usuário
        </Label>
        <line x1={340} y1={90} x2={340} y2={112} stroke={STROKE} markerEnd={`url(#${id}-open)`} />
        <path d="M340,114 l16,16 l-16,16 l-16,-16 z" fill={FILL} stroke={STROKE} />
        <line x1={324} y1={130} x2={180} y2={130} stroke={STROKE} />
        <line x1={180} y1={130} x2={180} y2={172} stroke={STROKE} markerEnd={`url(#${id}-open)`} />
        <line x1={356} y1={130} x2={500} y2={130} stroke={STROKE} />
        <line x1={500} y1={130} x2={500} y2={172} stroke={STROKE} markerEnd={`url(#${id}-open)`} />
        <Label x={250} y={124} size={10}>
          [válido]
        </Label>
        <Label x={430} y={124} size={10}>
          [inválido]
        </Label>
        <rect x={90} y={174} width={180} height={40} fill={SOFT} stroke={STROKE} />
        <path d="M90,174 h26 v10 l-6,6 h-20 z" fill={FILL} stroke={STROKE} />
        <Label x={100} y={186} size={10} weight={650}>
          sd
        </Label>
        <Label x={180} y={202}>
          Exibir painel
        </Label>
        <rect x={410} y={174} width={180} height={40} fill={SOFT} stroke={STROKE} />
        <path d="M410,174 h34 v10 l-6,6 h-28 z" fill={FILL} stroke={STROKE} />
        <Label x={422} y={186} size={10} weight={650}>
          ref
        </Label>
        <Label x={500} y={202}>
          Registrar falha
        </Label>
        <circle cx={340} cy={256} r={10} fill="none" stroke={STROKE} />
        <circle cx={340} cy={256} r={6} fill={STROKE} />
        <line x1={180} y1={214} x2={332} y2={250} stroke={STROKE} markerEnd={`url(#${id}-open)`} />
        <line x1={500} y1={214} x2={348} y2={250} stroke={STROKE} markerEnd={`url(#${id}-open)`} />
      </>
    ),
  },
};

export function UmlDiagram({ props }: { props: Record<string, string> }) {
  const id = `uml${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const diagram = DIAGRAMS[props.diagram] ?? DIAGRAMS.usecase;
  return (
    <figure style={{ margin: 0 }}>
      <div className={styles.title}>
        <strong>{diagram.title}</strong>
        <span>Notação UML 2.5</span>
      </div>
      <div className={styles.scroll}>
        <svg
          viewBox={`0 0 690 ${diagram.height}`}
          className={styles.svg}
          style={{ minWidth: 560, color: STROKE }}
          role="img"
          aria-label={`${diagram.title}. ${diagram.caption}`}
        >
          <Markers id={id} />
          {diagram.render(id)}
        </svg>
      </div>
      <figcaption className={styles.hint} style={{ marginTop: 6 }}>
        {diagram.caption}
      </figcaption>
    </figure>
  );
}

export const UML_DIAGRAMS = Object.keys(DIAGRAMS);
