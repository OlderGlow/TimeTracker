namespace TimeTracker.Infrastructure.Services
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Text.Json;
    using System.Threading.Tasks;
    using TimeTracker.Infrastructure.Interfaces;
    using TimeTracker.Domain.Models;

    public class FileStorageService : IStorageService
    {
        private readonly string _storageDirectory;
        private readonly JsonSerializerOptions _jsonSerializerOptions;

        public FileStorageService(string storageDirectory)
        {
            _storageDirectory = storageDirectory;
            _jsonSerializerOptions = new JsonSerializerOptions { WriteIndented = true };

            // Crée le dossier de stockage s'il n'existe pas
            if (!Directory.Exists(_storageDirectory))
            {
                Directory.CreateDirectory(_storageDirectory);
            }
        }

        public async Task<List<Worklog>> GetWorklogsAsync(string date)
        {
            var filePath = GetFilePath(date);

            if (!File.Exists(filePath))
            {
                return []; // Retourne une liste vide si le fichier n'existe pas
            }

            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<List<Worklog>>(json) ?? new List<Worklog>();
        }

        public async Task<Worklog?> GetWorklogAsync(string worklogId, string date)
        {
            var worklogs = await GetWorklogsAsync(date);
            return worklogs.Find(w => w.Id == worklogId);
        }

        public async Task<Worklog> SaveWorklogAsync(Worklog worklog, string date)
        {
            var worklogs = await GetWorklogsAsync(date);
            var existingWorklog = worklogs.Find(w => w.Id == worklog.Id);

            if (existingWorklog != null)
            {
                worklogs.Remove(existingWorklog); // Remplace le worklog existant
            }

            worklogs.Add(worklog);

            var json = JsonSerializer.Serialize(worklogs, _jsonSerializerOptions);
            var filePath = GetFilePath(date);
            await File.WriteAllTextAsync(filePath, json);

            return worklog;
        }

        public async Task DeleteWorklogAsync(string worklogId, string date)
        {
            var worklogs = await GetWorklogsAsync(date);
            var worklogToDelete = worklogs.Find(w => w.Id == worklogId);

            if (worklogToDelete != null)
            {
                worklogs.Remove(worklogToDelete);
                var json = JsonSerializer.Serialize(worklogs, _jsonSerializerOptions);
                var filePath = GetFilePath(date);
                await File.WriteAllTextAsync(filePath, json);
            }
        }

        private string GetFilePath(string date)
        {
            return Path.Combine(_storageDirectory, $"worklogs_{date}.json");
        }

        public async Task<List<Worklog>> GetWorklogsBeetweenDatesAsync(string startDate, string endDate)
        {
            var worklogs = new List<Worklog>();

            var currentDate = DateTime.Parse(startDate);
            var currentEndDate = DateTime.Parse(endDate);

            while (currentDate <= currentEndDate)
            {
                var worklogsForDate = await GetWorklogsAsync(currentDate.ToString("dd-MM-yyyy"));
                worklogs.AddRange(worklogsForDate);
                currentDate = currentDate.AddDays(1);
            }

            return worklogs;
        }
    }

}
