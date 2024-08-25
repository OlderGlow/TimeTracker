# Définir les chemins de vos projets .NET et Angular
$dotnetSolutionPath = "C:\Users\dext1\source\repos\TimeTrackerApi\TimeTrackerApi.sln"
$angularProjectPath = "C:\Users\dext1\source\repos\TimeTracker.Web"
$publishDirectory = "C:\inetpub\wwwroot\TimeTracker"

# 1. Builder tous les projets .NET de la solution avec MSBuild pour .NET Framework
Write-Host "Building .NET solution using MSBuild..."
& "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" $dotnetSolutionPath /p:Configuration=Release

# 2. Publier l'application .NET
Write-Host "Publishing .NET application..."
dotnet publish $dotnetSolutionPath --configuration Release --output $publishDirectory\api

# 3. Builder l'application Angular
Write-Host "Building Angular application..."
cd $angularProjectPath
npm install # S'assurer que toutes les dépendances sont installées
ng build --configuration production --output-path $publishDirectory\client

# 4. Déployer sur IIS
# Vérifier si le site "TimeTracker" existe déjà et le supprimer si nécessaire
$siteName = "TimeTracker"
if (Test-Path "IIS:\Sites\$siteName") {
    Write-Host "Removing existing site '$siteName'..."
    Remove-Website -Name $siteName
}

# Créer un nouveau site IIS pour héberger l'application Angular
Write-Host "Creating new IIS site '$siteName'..."
New-Website -Name $siteName -PhysicalPath "$publishDirectory\client" -Port 80 -Force

# Ajouter une application pour l'API .NET sous le site principal
Write-Host "Adding API application to the site..."
New-WebApplication -Site $siteName -Name "api" -PhysicalPath "$publishDirectory\api" -ApplicationPool "DefaultAppPool"

# 5. Configurer le site IIS (autres idées)
# Ajouter des en-têtes de sécurité ou configurer d'autres paramètres IIS spécifiques
Write-Host "Configuring IIS settings..."
Set-ItemProperty "IIS:\Sites\$siteName" -Name "logFile.directory" -Value "C:\inetpub\logs\TimeTracker"
Set-WebConfigurationProperty -Filter "system.webServer/defaultDocument" -Name "enabled" -Value "True" -PSPath "IIS:\Sites\$siteName"
Set-WebConfigurationProperty -Filter "system.webServer/httpErrors" -Name "errorMode" -Value "Detailed" -PSPath "IIS:\Sites\$siteName"

# 6. Redémarrer le site pour appliquer les changements
Write-Host "Restarting IIS site '$siteName'..."
Restart-WebAppPool -Name "DefaultAppPool"
Restart-WebItem "IIS:\Sites\$siteName"

Write-Host "Deployment completed successfully!"
