$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$renderRoot = Join-Path $taskRoot '.build/word'
New-Item -ItemType Directory -Force -Path $renderRoot | Out-Null
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
 foreach ($file in Get-ChildItem -LiteralPath (Join-Path $taskRoot 'documentos') -Filter '*.docx') {
  $doc = $word.Documents.Open($file.FullName, $false, $false)
  try {
   try {$doc.Fields.Update() | Out-Null} catch {Write-Output $_.Exception.Message}
   foreach ($toc in $doc.TablesOfContents) {$toc.Update()}
   $doc.Repaginate()
   $doc.Save()
   $doc.ExportAsFixedFormat((Join-Path $renderRoot ($file.BaseName + '.pdf')),17)
   Write-Output "$($file.Name): $($doc.ComputeStatistics(2)) pages"
  } catch {Write-Output "$($file.Name): $($_.Exception.Message)"} finally {try {$doc.Close(0)} catch {}}
 }
} finally {$word.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null}
