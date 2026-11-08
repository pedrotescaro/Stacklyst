param([string]$RevisionRoot)
$ErrorActionPreference='Stop'
$revision=[IO.Path]::GetFullPath($RevisionRoot)
$out=Join-Path $revision 'validacao/slides'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$app=New-Object -ComObject PowerPoint.Application
try {
 $path=Join-Path $revision 'entregaveis/Stacklyst-seminario-atualizado-2026-11-03.pptx'
 $deck=$app.Presentations.Open($path,$true,$false,$false)
 try {$deck.Export($out,'PNG',1600,900);Write-Output "Slides rendered: $($deck.Slides.Count)"} finally {$deck.Close()}
 $original=Get-ChildItem -LiteralPath (Join-Path $revision 'fontes-originais') -Filter '*.pptx' | Select-Object -First 1
 $before=Join-Path $revision 'validacao/slides-atividades-originais'
 New-Item -ItemType Directory -Force -Path $before | Out-Null
 $deck=$app.Presentations.Open($original.FullName,$true,$false,$false)
 try {foreach($n in 4..10){$deck.Slides.Item($n).Export((Join-Path $before ("Slide$n.PNG")),'PNG',1600,900)}} finally {$deck.Close()}
} finally {$app.Quit();[Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null}
