import { Arrow, Diagram, Text } from '../primitives';

export const directInverseVariation = {
  title: 'Proporção direta e proporção inversa',
  alt: 'Gráficos para x e y positivos com k maior que zero. Na proporção direta, y = kx e y dividido por x é constante: dobrar x dobra y. Na inversa, y = k sobre x e o produto xy é constante: dobrar x reduz y à metade.',
};

export function DirectInverseVariation() {
  return (
    <Diagram title={directInverseVariation.title} desc={directInverseVariation.alt} height={316}>
      <path d="M240 22V292" stroke="var(--enade-line)" />
      {[0, 240].map((dx, index) => (
        <g key={dx} transform={`translate(${dx} 0)`}>
          <Text x={120} y={24} weight={600}>
            {index ? 'Variação inversa' : 'Variação direta'}
          </Text>
          <Text x={120} y={52} muted>
            {index ? 'y = k / x' : 'y = kx'}
          </Text>
          <Arrow x1={42} y1={214} x2={42} y2={83} tone="neutral" />
          <Arrow x1={42} y1={214} x2={205} y2={214} tone="neutral" />
          <Text x={28} y={91} size={13} muted>
            y
          </Text>
          <Text x={204} y={228} size={13} muted>
            x
          </Text>
          <path
            d={index ? 'M60 89C70 159 111 184 196 196' : 'M42 214 191 100'}
            fill="none"
            stroke="var(--color-dd-accent)"
          />
          <Text x={120} y={254} weight={600}>
            {index ? 'x · y = k' : 'y / x = k'}
          </Text>
          <Text x={120} y={278} size={13} muted>
            {index ? 'Dobrar x reduz y à metade' : 'Dobrar x dobra y'}
          </Text>
        </g>
      ))}
      <Text x={240} y={303} muted size={13}>
        Exemplo com x, y e k positivos
      </Text>
    </Diagram>
  );
}
