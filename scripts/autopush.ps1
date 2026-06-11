# Stage, commit and push. Wrapper for Windows.
# Usage:
#   .\scripts\autopush.ps1
#   .\scripts\autopush.ps1 "feat: mensaje del commit"

param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$MessageParts
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$message = ($MessageParts -join " ").Trim()
$args = @("scripts/autopush.mjs")
if ($message) {
  $args += $message
}

node @args
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
