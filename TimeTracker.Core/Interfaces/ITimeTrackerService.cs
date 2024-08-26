using System.Collections.Generic;
using System.Threading.Tasks;
using TimeTracker.Domain.Models;
using TimeTracker.Jira.Models;

public interface ITimeTrackerService
{
    Task StartWorklogAsync(string worklogId, string date);
    Task StopWorklogAsync(string worklogId, string date);
    Task<List<Worklog>> GetWorklogsAsync(string date);
    Task<Worklog?> GetWorklogAsync(string worklogId, string date);
    Task<Worklog> SaveWorklogAsync(Worklog worklog, string date);
    Task DeleteWorklogAsync(string worklogId, string date);
    Task<JiraIssue?> GetJiraIssueAsync(string? projectId, string issueKey);
    Task<List<Worklog>> GetWorklogsWeekly(string startDate, string endDate);
}
