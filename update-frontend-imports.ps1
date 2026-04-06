# Script to update import paths in frontend files

$files = Get-ChildItem -Path "src/frontend" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Update @/frontend/ to @frontend/
    $content = $content -replace "from\s+['""]@/frontend/", "from '@frontend/"
    $content = $content -replace "import\s+([^'""]*)from\s+['""]@/frontend/", "import `$1from '@frontend/"
    
    # Update @/shared/ to @shared/
    $content = $content -replace "from\s+['""]@/shared/", "from '@shared/"
    $content = $content -replace "import\s+([^'""]*)from\s+['""]@/shared/", "import `$1from '@shared/"
    
    # Update @/components/ui/ to @frontend/components/ui/
    $content = $content -replace "from\s+['""]@/components/ui/", "from '@frontend/components/ui/"
    
    # Update @/components/shared/ to use the old path (these haven't been moved yet)
    # Keep as @/components/shared/ for now
    
    # Update @/components/base/ to @/components/base/ (these haven't been moved yet)
    # Keep as @/components/base/ for now
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Import update complete!"
