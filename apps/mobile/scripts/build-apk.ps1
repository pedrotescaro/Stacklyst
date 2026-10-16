$ErrorActionPreference = 'Stop'
$taskMobileRoot = Split-Path -Parent $PSScriptRoot
$taskOriginalLocation = Get-Location
$taskOriginalApi = $env:EXPO_PUBLIC_API_URL
$taskOriginalNodeEnv = $env:NODE_ENV

try {
    Set-Location -LiteralPath $taskMobileRoot
    $env:NODE_ENV = 'production'
    $env:EXPO_PUBLIC_API_URL = 'https://stacklyst.vercel.app'
    if (-not $env:JAVA_HOME) { $env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr' }
    if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }

    node scripts/check-release.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Release preflight failed. No APK was distributed.' }
    npm.cmd run build:editor
    if ($LASTEXITCODE -ne 0) { throw 'Editor build failed.' }
    npx.cmd expo prebuild --platform android --no-clean --no-install
    if ($LASTEXITCODE -ne 0) { throw 'Android prebuild failed.' }

    Set-Location -LiteralPath (Join-Path $taskMobileRoot 'android')
    # Rebundle even when only .env changed; Gradle does not track those values.
    .\gradlew.bat :app:createBundleReleaseJsAndAssets --rerun :app:assembleRelease --console=plain --no-daemon --max-workers=2 '-Dorg.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1536m' -PreactNativeArchitectures=arm64-v8a
    if ($LASTEXITCODE -ne 0) { throw 'Android compilation failed.' }

    $taskApk = Join-Path $taskMobileRoot 'android\app\build\outputs\apk\release\app-release.apk'
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $taskZip = [System.IO.Compression.ZipFile]::OpenRead($taskApk)
    try {
        $taskEntry = $taskZip.GetEntry('assets/index.android.bundle')
        if (-not $taskEntry) { throw 'APK has no JavaScript bundle.' }
        $taskReader = [System.IO.StreamReader]::new($taskEntry.Open(), [System.Text.Encoding]::GetEncoding(28591))
        try { $taskBundle = $taskReader.ReadToEnd() } finally { $taskReader.Dispose() }
        if (-not $taskBundle.Contains('https://stacklyst.vercel.app')) { throw 'APK is missing the published API URL.' }
        if ($taskBundle.Contains('http://10.0.2.2') -or $taskBundle.Contains('http://localhost:3000')) {
            throw 'APK contains a local development API URL.'
        }
    } finally { $taskZip.Dispose() }

    $taskArtifacts = Join-Path $taskMobileRoot 'artifacts'
    New-Item -ItemType Directory -Path $taskArtifacts -Force | Out-Null
    $taskDestination = Join-Path $taskArtifacts 'Stacklyst-0.1.1-arm64.apk'
    Copy-Item -LiteralPath $taskApk -Destination $taskDestination -Force
    Get-FileHash -LiteralPath $taskDestination -Algorithm SHA256
    Write-Host "APK verified: $taskDestination"
} finally {
    $env:EXPO_PUBLIC_API_URL = $taskOriginalApi
    $env:NODE_ENV = $taskOriginalNodeEnv
    Set-Location -LiteralPath $taskOriginalLocation
}
