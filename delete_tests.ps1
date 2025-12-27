
$files = @(
    "src\components\client\ClientLayout.test.jsx",
    "src\components\client\ClientBilling.test.jsx",
    "src\components\admin\AdminSupport.test.jsx",
    "src\components\admin\AdminSubscriptions.test.jsx",
    "src\components\admin\AdminMessages.test.jsx",
    "src\components\admin\AdminLayout.test.jsx",
    "src\components\admin\AdminClients.test.jsx",
    "src\components\admin\AdminBilling.test.jsx",
    "AkaTech_Components\ui\AuthModal.test.jsx",
    "AkaTech_Components\sections\Contact.test.jsx",
    "src\components\client\SignupWizard.test.jsx",
    "src\components\client\ClientProjects.test.jsx",
    "src\components\client\ProjectEmptyState.test.jsx",
    "src\components\client\ClientSupport.test.jsx",
    "src\lib\Actions.test.ts",
    "src\pages\About.test.jsx",
    "AkaTech_Components\layout\Navbar.test.jsx",
    "AkaTech_Components\ui\SearchButton.test.jsx",
    "AkaTech_Components\sections\Hero.test.jsx",
    "src\components\admin\AdminProjects.test.jsx",
    "AkaTech_Components\ui\FloatingAssistant.test.jsx",
    "AkaTech_Components\sections\Recommendations.test.jsx",
    "AkaTech_Components\sections\Services.test.jsx",
    "src\App.test.jsx",
    "AkaTech_Components\sections\Pricing.test.jsx",
    "src\components\admin\AdminSettings.test.jsx",
    "AkaTech_Components\layout\Footer.test.jsx",
    "AkaTech_Components\ui\CookieConsent.test.jsx",
    "src\tests\cookieUtils.test.js",
    "AkaTech_Components\ui\AdinkraBackground.test.jsx",
    "src\pages\Dashboard.test.jsx",
    "src\lib\mockData.test.js",
    "src\hooks\useTheme.test.js",
    "AkaTech_Components\ui\Logo.test.jsx",
    "vitest.setup.js",
    "server\test-api.cjs",
    "server\test-db-connection.cjs",
    "server\test-deps.cjs",
    "test-subscriptions.js",
    "test-syntax.cjs"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted $file"
    } else {
        Write-Host "File not found: $file"
    }
}

# Try to remove src/tests if empty
if (Test-Path "src\tests") {
    if ((Get-ChildItem "src\tests").Count -eq 0) {
        Remove-Item "src\tests" -Force
        Write-Host "Deleted src\tests directory"
    }
}
