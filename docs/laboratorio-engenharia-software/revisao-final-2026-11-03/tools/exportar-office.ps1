param([string]$RevisionRoot,[string]$DocumentFilter='*.docx',[string[]]$Prefixes=@())
$ErrorActionPreference='Stop'
$revision=[IO.Path]::GetFullPath($RevisionRoot)
$qa=Join-Path $revision 'validacao/rendered'
New-Item -ItemType Directory -Force -Path $qa | Out-Null
$word=New-Object -ComObject Word.Application
$word.Visible=$false
$word.DisplayAlerts=0
try {
 foreach($file in Get-ChildItem -LiteralPath (Join-Path $revision 'entregaveis') -Filter $DocumentFilter) {
  if($Prefixes.Count -gt 0 -and $file.Name.Substring(0,2) -notin $Prefixes){continue}
  Write-Output "Word: $($file.Name)"
  $doc=$word.Documents.Open($file.FullName,$false,$false)
  try {
   $doc.Fields.Update() | Out-Null
   foreach($toc in $doc.TablesOfContents){$toc.Update()}
   $doc.Repaginate()
   $doc.Save()
   $dir=Join-Path $qa $file.BaseName
   New-Item -ItemType Directory -Force -Path $dir | Out-Null
   $doc.ExportAsFixedFormat((Join-Path $dir ($file.BaseName+'.pdf')),17)
   Write-Output "Pages: $($doc.ComputeStatistics(2))"
  } finally {$doc.Close(0)}
 }
} finally {$word.Quit();[Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null}
