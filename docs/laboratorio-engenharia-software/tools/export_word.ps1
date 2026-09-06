param(
  [string]$OutputRoot = (Join-Path $PSScriptRoot '../qa/rendered-20260905'),
  [string]$DocumentName = '*.docx'
)
$ErrorActionPreference = 'Stop'
$outputPath = [IO.Path]::GetFullPath($OutputRoot)
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  foreach ($file in Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '../entregaveis') -Filter $DocumentName) {
    $document = $word.Documents.Open($file.FullName, $false, $false)
    try {
      $document.Fields.Update() | Out-Null
      foreach ($toc in $document.TablesOfContents) { $toc.Update() }
      $document.Repaginate()
      $document.Save()
      $destination = Join-Path $outputPath $file.BaseName
      New-Item -ItemType Directory -Force -Path $destination | Out-Null
      $document.ExportAsFixedFormat((Join-Path $destination ($file.BaseName + '.pdf')), 17)
      Write-Output "$($file.Name): $($document.ComputeStatistics(2)) pages"
    } finally { $document.Close(0) }
  }
} finally {
  $word.Quit()
  [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
