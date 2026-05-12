# Merges a backup folder named `temp` at the repository root into this project, then deletes `temp`.
# Uses robocopy for directories (correct merge into existing folders). Do NOT use Copy-Item -Recurse
# from `temp\*` into the repo when `src` already exists — that nests `src\src`.
#
# Usage (from repo root):
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/merge-temp-folder.ps1
#
$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..")
$temp = Join-Path $repo "temp"

if (-not (Test-Path -LiteralPath $temp)) {
	Write-Error "Missing folder: $temp`nCopy your backup project into a directory named ``temp`` at the repo root, then run this script again."
}

function Invoke-RobocopyMerge {
	param([string]$SourceRel, [string]$DestRel)
	$src = Join-Path $temp $SourceRel
	$dst = Join-Path $repo $DestRel
	if (-not (Test-Path -LiteralPath $src)) { return }
	New-Item -ItemType Directory -Path $dst -Force | Out-Null
	robocopy $src $dst /E /IS /IT /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
	$code = $LASTEXITCODE
	if ($code -ge 8) {
		throw "robocopy failed ($code): $src -> $dst"
	}
}

Invoke-RobocopyMerge "src" "src"
Invoke-RobocopyMerge "public" "public"
Invoke-RobocopyMerge "scripts" "scripts"
if (Test-Path (Join-Path $temp ".github")) {
	Invoke-RobocopyMerge ".github" ".github"
}
if (Test-Path (Join-Path $temp ".vscode")) {
	Invoke-RobocopyMerge ".vscode" ".vscode"
}

$rootFiles = @(
	"package.json",
	"pnpm-lock.yaml",
	"astro.config.mjs",
	"eslint.config.js",
	"tailwind.config.cjs",
	"svelte.config.js",
	"tsconfig.json",
	"pagefind.yml",
	"vercel.json",
	"pnpm-workspace.yaml",
	".npmrc",
	"_frontmatter.json",
	".gitignore",
	".gitattributes",
	"performance-baseline.json",
	"lighthouserc.json"
)
foreach ($f in $rootFiles) {
	$p = Join-Path $temp $f
	if (Test-Path -LiteralPath $p) {
		Copy-Item -LiteralPath $p (Join-Path $repo $f) -Force
	}
}

Remove-Item -LiteralPath $temp -Recurse -Force
Write-Host "Done: merged ``temp`` into repo and removed ``temp``."
