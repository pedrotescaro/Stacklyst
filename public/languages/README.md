# Logos de linguagens

Os vetores JavaScript, TypeScript, Python, Rust, Go e Java usados nas badges vêm dos SVGs originais do Devicon 2.17.0, já instalado no projeto. A licença MIT está em [LICENSE-devicon](./LICENSE-devicon).

`src/lib/credentials/language-logos.ts` guarda uma cópia estática dos desenhos para compartilhar a mesma arte entre a interface e o PDF, sem rede, fontes de ícones ou leitura de assets no navegador. O wordmark Go preserva os paths originais e recorta somente o espaço vazio do viewBox. As demais artes preservam o viewBox original. IDs de gradientes recebem um prefixo próprio em cada badge.

A badge sem linguagem usa o monograma existente de `public/brand/monogram.svg`. Os logos identificam o conteúdo da conquista; não indicam parceria ou endosso dos projetos representados.
