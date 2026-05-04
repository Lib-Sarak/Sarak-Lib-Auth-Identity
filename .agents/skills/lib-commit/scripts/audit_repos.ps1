# Sarak Matrix — Git Audit Script v2.0
# Este script verifica o status de todos os submódulos/repositórios Sarak.

$modules = Get-ChildItem -Directory -Filter "Sarak-*"
$results = @()

foreach ($module in $modules) {
    $hasGit = Test-Path "$($module.FullName)\.git"
    
    if ($hasGit) {
        $origPath = Get-Location
        Set-Location $module.FullName
        
        try {
            # Fetch latest from remote main branch
            $fetchOutput = @(git fetch origin main --quiet 2>&1)
            
            # Current branch
            $currentBranch = (git branch --show-current).Trim()
            
            # Ahead/Behind count relative to origin/main
            $aheadBehind = @(git rev-list --left-right --count main...origin/main 2>$null)
            if ($LASTEXITCODE -ne 0 -or $aheadBehind.Count -eq 0) {
                $ahead = "?"
                $behind = "?"
            } else {
                $parts = $aheadBehind[0] -split "\s+"
                $ahead = $parts[0]
                $behind = $parts[1]
            }
            
            # Local changes counts
            $porcelain = @(git status --porcelain)
            $modified = ($porcelain | Where-Object { $_ -match '^ M' -or $_ -match '^M ' }).Count
            $untracked = ($porcelain | Where-Object { $_ -match '^\?\?' }).Count
            $staged = ($porcelain | Where-Object { $_ -match '^[A-Z]' -and $_ -notmatch '^\?\?' }).Count
            
            # Remote URL
            $remoteUrl = (git remote get-url origin 2>$null)
            $isGitHub = if ($remoteUrl -match "github.com") { "Yes" } else { "No" }
            
            $results += [PSCustomObject]@{
                Module       = $module.Name
                Branch       = $currentBranch
                Ahead        = $ahead
                Behind       = $behind
                Mod          = $modified
                Untrk        = $untracked
                Staged       = $staged
                GitHub       = $isGitHub
                Status       = "Git OK"
            }
        } catch {
            $results += [PSCustomObject]@{
                Module       = $module.Name
                Status       = "Error"
                Branch       = "N/A"
            }
        } finally {
            Set-Location $origPath
        }
    } else {
        $results += [PSCustomObject]@{
            Module       = $module.Name
            Status       = "NO GIT"
            Branch       = "N/A"
            Ahead        = "-"
            Behind       = "-"
            Mod          = "-"
            Untrk        = "-"
            Staged       = "-"
            GitHub       = "No"
        }
    }
}

# Display results
if ($results.Count -gt 0) {
    $results | Sort-Object Module | Format-Table -AutoSize
} else {
    Write-Host "Nenhum repositório Sarak encontrado." -ForegroundColor Yellow
}
