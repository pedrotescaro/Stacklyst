$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$pptx=Join-Path $taskRoot 'apresentacao/Stacklyst-seminario-revisado-2026-10-20.pptx'
$pdf=Join-Path $taskRoot 'apresentacao/Stacklyst-seminario-revisado-2026-10-20.pdf'
$png=Join-Path $taskRoot '.build/slides-finais'
New-Item -ItemType Directory -Force -Path $png | Out-Null
$pp=New-Object -ComObject PowerPoint.Application
try {
 $deck=$pp.Presentations.Open($pptx,$true,$false,$false)
 try {
  $deck.Export($png,'PNG',1920,1080)
  $deck.SaveAs($pdf,32)
  Write-Output "Exportados $($deck.Slides.Count) slides e PDF."
 } finally {$deck.Close()}
} finally {$pp.Quit()}
