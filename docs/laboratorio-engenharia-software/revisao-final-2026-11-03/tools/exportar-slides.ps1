param([string]$RevisionRoot)
$ErrorActionPreference='Stop'
$revision=[IO.Path]::GetFullPath($RevisionRoot)
$out=Join-Path $revision 'validacao/slides'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$app=New-Object -ComObject PowerPoint.Application
try {
 $path=Join-Path $revision 'entregaveis/Stacklyst-seminario-atualizado-2026-11-03.pptx'
 $deck=$app.Presentations.Open($path,$true,$false,$false)
 try {
  $deck.Export($out,'PNG',1600,900)
  $deck.SaveAs((Join-Path $revision 'entregaveis/Stacklyst-seminario-atualizado-2026-11-03.pdf'),32)
  Write-Output "Slides: $($deck.Slides.Count)"
 } finally {$deck.Close()}
} finally {$app.Quit();[Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null}
