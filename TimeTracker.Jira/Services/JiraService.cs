namespace TimeTracker.Jira.Services
{
    using Atlassian.Jira;
    using TimeTracker.Jira.Interfaces;
    using TimeTracker.Jira.Models;

    public class JiraService(string jiraUrl, string username, string apiToken) : IJiraService
    {
        private readonly Jira _jiraClient = Jira.CreateRestClient(jiraUrl, username, apiToken);
        private readonly string _jiraBaseUrl = jiraUrl.TrimEnd('/');

        public async Task<JiraIssue> GetIssueAsync(string issueKey)
        {
            var issue = await _jiraClient.Issues.GetIssueAsync(issueKey);
            return new JiraIssue
            {
                Key = issue.Key.Value,
                Summary = issue.Summary,
                Url = GetIssueUrl(issue.Key.Value)
            };
        }

        public string GetIssueUrl(string issueKey)
        {
            return $"{_jiraBaseUrl}/browse/{issueKey}";
        }

        public async Task UpdateTimeSpentAsync(string issueKey, JiraTimeEntry timeEntry)
        {
            var issue = await _jiraClient.Issues.GetIssueAsync(issueKey);
            var existingWorklog = timeEntry.Id != null ? await GetWorklogAsync(issue, timeEntry.Id) : null;

            if (existingWorklog != null)
            {
                existingWorklog.Comment = timeEntry.Comment;
                existingWorklog.StartDate = timeEntry.StartTime;
                existingWorklog.TimeSpent = timeEntry.TimeSpent.ToString();
                await _jiraClient.Issues.UpdateIssueAsync(issue); // Mise à jour de l'ID localement
            }
            else
            {
                var newWorklog = new Worklog(timeEntry.TimeSpent.ToString(), timeEntry.StartTime)
                {
                    Comment = timeEntry.Comment
                };
                await issue.AddWorklogAsync(newWorklog);
                timeEntry.Id = newWorklog.Id;  // Mise à jour de l'ID localement
            }
        }

        private static async Task<Worklog?> GetWorklogAsync(Issue issue, string worklogId)
        {
            var worklogs = await issue.GetWorklogsAsync();
            return worklogs.FirstOrDefault(w => w.Id == worklogId);
        }

        public async Task<JiraIssue?> GetIssueFromJqlAsync(string requestJql)
        {
            var result = await _jiraClient.Issues.GetIssuesFromJqlAsync(requestJql);
            if (!result.Any())
            {
                return null;
            }
            return new JiraIssue
            {
                Key = result.First().Key.Value,
                Summary = result.First().Summary,
                Url = GetIssueUrl(result.First().Key.Value)
            };
        }
    }

}
