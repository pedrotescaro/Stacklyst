import { Arrow, Diagram, Node, Swimlane, Text } from '../primitives';

export const enterpriseInformationFlow = {
  title: 'Da operação empresarial à análise de dados',
  alt: 'No exemplo, CRM troca dados de clientes e pedidos com o ERP, e SCM troca dados de suprimentos. O ERP registra operações na base transacional. O processo ETL prepara os dados para o data warehouse, que alimenta relatórios e painéis.',
};

export function EnterpriseInformationFlow() {
  return (
    <Diagram
      title={enterpriseInformationFlow.title}
      desc={enterpriseInformationFlow.alt}
      height={492}
    >
      <Swimlane x={16} y={14} w={448} h={224} label="Operação">
        <Node x={30} y={68} w={110} h={57} label="CRM" sub="Clientes" />
        <Node x={185} y={68} w={110} h={57} label="ERP" sub="Operações" tone="accent" />
        <Node x={340} y={68} w={110} h={57} label="SCM" sub="Suprimentos" />
        <Arrow x1={140} x2={185} y1={97} y2={97} start="solid" />
        <Arrow x1={295} x2={340} y1={97} y2={97} start="solid" />
        <Arrow x1={240} x2={240} y1={125} y2={170} start="solid" />
        <Text x={250} y={149} align="start" size={13} muted>
          Registros
        </Text>
        <Node x={128} y={170} w={224} h={44} label="Base transacional" />
      </Swimlane>
      <Arrow x1={240} x2={240} y1={214} y2={302} />
      <Swimlane x={16} y={255} w={448} h={222} label="Análise">
        <Node x={94} y={302} w={292} h={54} label="ETL" sub="Extrair, transformar e carregar" />
        <Arrow x1={240} x2={240} y1={356} y2={372} />
        <Node x={128} y={372} w={224} h={37} label="Data warehouse" tone="accent" />
        <Arrow x1={240} x2={240} y1={409} y2={425} />
        <Node x={128} y={425} w={224} h={37} label="Relatórios e painéis" />
      </Swimlane>
    </Diagram>
  );
}
