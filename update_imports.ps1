
$files = @(
    "src\pages\About.jsx",
    "src\components\admin\AdminSubscriptions.jsx",
    "src\components\admin\AdminClients.jsx",
    "src\components\admin\AdminBilling.jsx",
    "src\components\admin\AdminDashboard.jsx",
    "src\components\admin\AdminProjects.jsx",
    "src\components\admin\AdminSettings.jsx",
    "src\components\admin\AdminProfile.jsx",
    "src\components\client\ClientProfile.jsx",
    "src\components\client\ClientBilling.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $newContent = $content -replace "mockData", "localData" -replace "mockService", "localDataService"
        Set-Content $file $newContent
        Write-Host "Updated $file"
    } else {
        Write-Host "File not found: $file"
    }
}
