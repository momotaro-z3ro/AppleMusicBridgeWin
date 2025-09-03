# AppleMusicBridgeWin Installer
$ErrorActionPreference = 'Stop'

$Repo     = 'momotaro-z3ro/AppleMusicBridgeWin'
$BaseDir  = Join-Path $env:LOCALAPPDATA 'MoZ3ro.AppleMusicBridgeWin'
$DistDir  = Join-Path $BaseDir 'dist'
$ExePath  = Join-Path $BaseDir 'AppleMusicBridgeWin.exe'
$DistZip  = Join-Path $BaseDir 'vencord-dist.zip'

$UrlExe   = "https://github.com/$Repo/releases/latest/download/AppleMusicBridgeWin.exe"
$UrlZip   = "https://github.com/$Repo/releases/latest/download/vencord-dist.zip"

$Discord = Get-ChildItem "$env:LOCALAPPDATA\Discord" -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like 'app-*' } | Sort-Object Name -Descending | Select-Object -First 1
if (-not $Discord) { throw "Discord が見つかりません。" }

$Resources = Join-Path $Discord.FullName 'resources'
$AppDir    = Join-Path $Resources      'app'
$IndexJs   = Join-Path $AppDir         'index.js'

Get-Process discord -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $BaseDir | Out-Null

Write-Host "[1/5] Download bridge EXE..." -ForegroundColor Cyan
Invoke-WebRequest -UseBasicParsing -Uri $UrlExe -OutFile $ExePath

Write-Host "[2/5] Download Vencord dist..." -ForegroundColor Cyan
Invoke-WebRequest -UseBasicParsing -Uri $UrlZip -OutFile $DistZip

Write-Host "[3/5] Unzip dist..." -ForegroundColor Cyan
if (Test-Path $DistDir) { Remove-Item $DistDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $DistDir | Out-Null
Expand-Archive -Force -Path $DistZip -DestinationPath $DistDir

Write-Host "[4/5] Install loader..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
@"
require("$($DistDir)\patcher.js".replace(/\\/g,"\\\\")); 
require("../app.asar");
"@ | Set-Content -Encoding UTF8 $IndexJs

Write-Host "[4.5/5] Set VC_AMBRIDGE_EXE" -ForegroundColor Cyan
[Environment]::SetEnvironmentVariable('VC_AMBRIDGE_EXE', $ExePath, 'User')

Write-Host "[5/5] Launch Discord..." -ForegroundColor Cyan
& (Join-Path $Discord.FullName 'Discord.exe')

Write-Host "`n✅ 完了。Discord → Plugins で AppleMusicBridgeWin を有効化してください。" -ForegroundColor Green
