using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimeTracker.Domain.Models;
using TimeTracker.Jira.Interfaces;
using TimeTracker.Jira.Models;
using TimeTracker.Infrastructure.Interfaces;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Text;
using System.Xml.Linq;
using Atlassian.Jira;
using Worklog = TimeTracker.Domain.Models.Worklog;
namespace TimeTracker.Core.Services
{
    public class TimeTrackerService(IStorageService storageService, IJiraService jiraService, ILogger<TimeTrackerService> logger) : ITimeTrackerService
    {
        #region Injected Services
        private readonly IStorageService _storageService = storageService;
        private readonly IJiraService _jiraService = jiraService;
        #endregion

        #region Public
        public async Task StartWorklogAsync(string worklogId, string date)
        {
            var worklog = await _storageService.GetWorklogAsync(worklogId, date);
            if (worklog != null)
            {
                worklog.StartTime = DateTime.Now;
                await _storageService.SaveWorklogAsync(worklog, date);

                var jiraTimeEntry = new JiraTimeEntry
                {
                    Id = worklog.Id,
                    StartTime = worklog.StartTime,
                    EndTime = worklog.EndTime
                };

                await _jiraService.UpdateTimeSpentAsync(worklog.Name, jiraTimeEntry);
            }
        }

        public async Task StopWorklogAsync(string worklogId, string date)
        {
            var worklog = await _storageService.GetWorklogAsync(worklogId, date);
            if (worklog != null)
            {
                worklog.EndTime = DateTime.Now;
                await _storageService.SaveWorklogAsync(worklog, date);

                var jiraTimeEntry = new JiraTimeEntry
                {
                    Id = worklog.Id,
                    StartTime = worklog.StartTime,
                    EndTime = worklog.EndTime
                };

                await _jiraService.UpdateTimeSpentAsync(worklog.Name, jiraTimeEntry);
            }
        }

        public async Task<List<Worklog>> GetWorklogsAsync(string date)
        {
            return await _storageService.GetWorklogsAsync(date);
        }

        public async Task<List<Worklog>> GetWorklogsBeetweenDatesAsync(string startDate, string endDate)
        {
            return await _storageService.GetWorklogsBeetweenDatesAsync(startDate, endDate);
        }

        public async Task<Worklog?> GetWorklogAsync(string worklogId, string date)
        {
            return await _storageService.GetWorklogAsync(worklogId, date);
        }

        public async Task<Worklog> SaveWorklogAsync(Worklog worklog, string date)
        {
            try
            {
                var issue = await _jiraService.GetIssueAsync(worklog.Name);
                if (issue != null)
                {
                    worklog.Issue = new JiraIssue
                    {
                        Id = issue.Id,
                        Key = issue.Key,
                        Summary = issue.Summary,
                        Url = issue.Url
                    };
                }
            }
            catch
            {
                logger.LogWarning("[TimeTrackerService - SaveWorklogAsync] - Issue {IssueName} not found in Jira", worklog.Name);
            }

            var worklogResult = await _storageService.SaveWorklogAsync(worklog, date);

            var jiraTimeEntry = new JiraTimeEntry
            {
                Id = worklog.Issue?.Id ?? worklog.Id,
                StartTime = worklog.StartTime,
                EndTime = worklog.EndTime
            };

            if (worklog.IsCompleted)
            {
                try
                {
                    await _jiraService.UpdateTimeSpentAsync(worklog.Name, jiraTimeEntry);
                }
                catch(Exception e)
                {
                    logger.LogError(e, "[TimeTrackerService - SaveWorklogAsync] - Error while updating time spent in Jira");
                }
            }

            return worklogResult;
        }

        public async Task DeleteWorklogAsync(string worklogId, string date)
        {
            await _storageService.DeleteWorklogAsync(worklogId, date);
        }

        public async Task<JiraIssue?> GetJiraIssueAsync(string? projectId, string issueKey)
        {
            string cleanName = RemoveDiacritics(issueKey.Trim().ToLower());

            // Utilisation d'un switch expression avec des tâches asynchrones
            return cleanName switch
            {
                "reunion" => await FindRitualWithName(projectId, "Réunion"),
                "ds" or "daily" or "daily scrum" => await FindRitualWithName(projectId, "Daily Scrum"),
                "gestion de projet" => await FindRitualWithName(projectId, "Gestion de projet"),
                "autre" => await FindRitualWithName(projectId, "Autre"),
                "livraison" => await FindRitualWithName(projectId, "Livraison"),
                _ => await HandleDefaultCaseAsync(projectId, issueKey)
            };
        }

        public async Task<List<Worklog>> GetWorklogsWeekly(string startDate, string endDate)
        {
            return await GetWorklogsBeetweenDatesAsync(startDate, endDate);
        }

        #endregion

        #region Private

        private async Task<JiraIssue?> HandleDefaultCaseAsync(string? projectId, string issueKey)
        {
            if (projectId != null)
            {
                issueKey = projectId + "-" + issueKey;
            }
            return await _jiraService.GetIssueAsync(issueKey);
        }


        private async Task<JiraIssue?> FindRitualWithName(string? projectId, string name)
        {
            if (projectId == null) return null;
            string jql = $"project = \"{projectId}\" AND status = \"In Progress\" AND issuetype = Rituels AND summary ~ \"{name}\"";
            return await _jiraService.GetIssueFromJqlAsync(jql);
        }

        private static string RemoveDiacritics(string text)
        {
            string normalizedString = text.Normalize(NormalizationForm.FormD);

            var stringBuilder = new StringBuilder(normalizedString.Length);

            foreach (char c in normalizedString)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString();
        }
        #endregion
    }
}