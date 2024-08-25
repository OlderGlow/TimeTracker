using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TimeTracker.Jira.Models;

namespace TimeTracker.Jira.Interfaces
{
    public interface IJiraService
    {
        Task<JiraIssue> GetIssueAsync(string issueKey);
        string GetIssueUrl(string issueKey);
        Task UpdateTimeSpentAsync(string issueKey, JiraTimeEntry timeEntry);
        Task<JiraIssue?> GetIssueFromJqlAsync(string requestJql);
    }
}
