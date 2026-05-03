$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopDirectory = Split-Path -Parent $scriptDirectory
$artifactsDirectory = Join-Path $desktopDirectory "artifacts"
$temporaryExtractionDirectory = Join-Path $artifactsDirectory ".tmp-win-extract"
$outputPath = Join-Path $artifactsDirectory "wallzapp-windows-x64-setup.exe"

if (-not (Test-Path -LiteralPath $artifactsDirectory -PathType Container)) {
  throw "Artifacts directory not found: $artifactsDirectory"
}

$setupArchives = @(Get-ChildItem -LiteralPath $artifactsDirectory -Filter "stable-win-x64-*-Setup.zip" -File)
if ($setupArchives.Count -eq 0) {
  throw "No Windows setup archive found in '$artifactsDirectory'. Run 'bun run build:win' on a Windows x64 machine first."
}

if ($setupArchives.Count -gt 1) {
  $archiveList = $setupArchives.Name -join ", "
  throw "Multiple Windows setup archives found in '$artifactsDirectory': $archiveList. Clean the artifacts directory and retry."
}

$setupArchive = $setupArchives[0]

if (Test-Path -LiteralPath $temporaryExtractionDirectory) {
  Remove-Item -LiteralPath $temporaryExtractionDirectory -Recurse -Force
}

New-Item -ItemType Directory -Path $temporaryExtractionDirectory | Out-Null

try {
  Expand-Archive -LiteralPath $setupArchive.FullName -DestinationPath $temporaryExtractionDirectory -Force

  $preferredExecutables = @(
    Get-ChildItem -LiteralPath $temporaryExtractionDirectory -Recurse -File |
      Where-Object { $_.Name -like "*Setup*.exe" }
  )

  if ($preferredExecutables.Count -eq 1) {
    $installerExecutable = $preferredExecutables[0]
  } else {
    $allExecutables = @(
      Get-ChildItem -LiteralPath $temporaryExtractionDirectory -Recurse -File |
        Where-Object { $_.Extension -eq ".exe" }
    )

    if ($allExecutables.Count -ne 1) {
      $executableNames = if ($allExecutables.Count -gt 0) { $allExecutables.Name -join ", " } else { "<none>" }
      throw "Expected exactly one installer executable after extracting '$($setupArchive.Name)', found $($allExecutables.Count): $executableNames"
    }

    $installerExecutable = $allExecutables[0]
  }

  Copy-Item -LiteralPath $installerExecutable.FullName -Destination $outputPath -Force
  Write-Host "Windows installer extracted to: $outputPath"
} finally {
  if (Test-Path -LiteralPath $temporaryExtractionDirectory) {
    Remove-Item -LiteralPath $temporaryExtractionDirectory -Recurse -Force
  }
}
