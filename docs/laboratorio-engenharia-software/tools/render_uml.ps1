param(
  [Parameter(Mandatory=$true)][string]$PlantUmlJar,
  [string]$Java = 'java'
)
$ErrorActionPreference = 'Stop'
$diagramRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../diagramas'))
$sourceRoot = Join-Path $diagramRoot 'fontes'
$imageRoot = Join-Path $diagramRoot 'imagens'
New-Item -ItemType Directory -Force -Path $imageRoot | Out-Null
$sources = Get-ChildItem -LiteralPath $sourceRoot -Filter '*.puml' -Recurse
foreach ($source in $sources) {
  & $Java -jar $PlantUmlJar -charset UTF-8 -failfast2 -checkonly $source.FullName
  if ($LASTEXITCODE -ne 0) { throw "UML inválida: $($source.Name)" }
  & $Java -jar $PlantUmlJar -charset UTF-8 -tpng -o $imageRoot $source.FullName
  if ($LASTEXITCODE -ne 0) { throw "Falha ao renderizar $($source.Name)" }
  & $Java -jar $PlantUmlJar -charset UTF-8 -tsvg -o $imageRoot $source.FullName
  if ($LASTEXITCODE -ne 0) { throw "Falha ao exportar SVG de $($source.Name)" }
}
Write-Output "$($sources.Count) diagramas validados e renderizados em PNG e SVG."
