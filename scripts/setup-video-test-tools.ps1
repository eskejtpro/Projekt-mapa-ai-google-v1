$ErrorActionPreference = 'Stop'
# Build referenced by ffmpeg.org/download.html; checksum published by gyan.dev.
$videoToolsRoot = Join-Path $PSScriptRoot '../.test-tools/ffmpeg-9.0.2'
New-Item -ItemType Directory -Path $videoToolsRoot -Force | Out-Null
$videoArchive = Join-Path $videoToolsRoot 'ffmpeg-9.0.2.zip'
$videoChecksum = '60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba'
if (!(Test-Path -LiteralPath $videoArchive)) {
  Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/packages/ffmpeg-9.0.2-essentials_build.zip' -OutFile $videoArchive
}
if ((Get-FileHash -LiteralPath $videoArchive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $videoChecksum) {
  throw 'Suma SHA-256 FFmpeg jest niezgodna. Narzędzia nie zostaną uruchomione.'
}
Expand-Archive -LiteralPath $videoArchive -DestinationPath $videoToolsRoot -Force
$videoBin = (Resolve-Path -LiteralPath (Join-Path $videoToolsRoot 'ffmpeg-9.0.2-essentials_build/bin')).Path
if ($env:GITHUB_ENV) { "PREZENT_FFMPEG_DIR=$videoBin" | Out-File -LiteralPath $env:GITHUB_ENV -Encoding utf8 -Append }
Write-Output "PASS: FFmpeg 9.0.2 portable, SHA-256 verified. PREZENT_FFMPEG_DIR=$videoBin"
