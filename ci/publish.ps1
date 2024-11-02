[CmdletBinding()]param()
function main() {
  vite build --base=/weboose --emptyOutDir
  $ver = Get-Content .\package.json | ConvertFrom-Json | Select-Object -ExpandProperty version
  Push-Location ../cawoodm.github.io/weboose/
  try {
    git pull
    if ($LASTEXITCODE -ne 0) {throw "GIT PULL Failed!"}
    Remove-Item -Recurse -Force * -Verbose
    Copy-Item ../../weboose/dist/* -Recurse ./ -Verbose
    #Copy-Item ../../weboose/src/tiddlers/*.json -Recurse ./ -Verbose
    #Copy-Item ../../weboose/docs/favicon.ico ./ -Verbose
    #read-host "Push?"
    git add .
    git commit -a -m "weboose-$ver-$(Get-Date -f yyyyMMddhhmm)"
    git push
  } catch {
    throw $_
  } finally {
    Pop-Location
  }
}
$ErrorActionPreference = "Stop"
main