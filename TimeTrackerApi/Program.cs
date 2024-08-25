using Serilog;
using TimeTracker.Core.Services;
using TimeTracker.Infrastructure.Interfaces;
using TimeTracker.Infrastructure.Services;
using TimeTracker.Jira.Interfaces;
using TimeTracker.Jira.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuration de Serilog pour écrire dans un fichier
Log.Logger = new LoggerConfiguration()
    .WriteTo.File(
        path: "C:\\TimeTracker\\Traces/timetracker-.log", // Chemin du fichier de log avec un pattern pour les noms de fichiers
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level}] {Message}{NewLine}{Exception}",
        rollingInterval: RollingInterval.Day, // Crée un nouveau fichier chaque jour
        retainedFileCountLimit: 7, // Conserve les fichiers des 7 derniers jours
        fileSizeLimitBytes: 10_000_000, // Limite de taille du fichier à 10MB
        rollOnFileSizeLimit: true // Crée un nouveau fichier si la taille limite est atteinte
    )
    .CreateLogger();

builder.Host.UseSerilog();
// Ajouter CORS au service
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddSingleton<IJiraService>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    string jiraUrl = configuration["Jira:Url"] ?? "";
    string username = configuration["Jira:Username"] ?? "";
    string apiToken = configuration["Jira:ApiToken"] ?? "";
    return new JiraService(jiraUrl, username, apiToken);
});

// Configuration du StorageService
builder.Services.AddSingleton<IStorageService>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    string storagePath = configuration["Storage:Path"] ?? "C:\\TimeTracker";
    return new FileStorageService(storagePath);
});

// Configuration du TimeTrackerService
builder.Services.AddTransient<ITimeTrackerService, TimeTrackerService>();

var app = builder.Build();

// Configuration du middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularApp");
app.UseRouting();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
