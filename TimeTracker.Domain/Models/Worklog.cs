using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TimeTracker.Domain.Enums;
using TimeTracker.Jira.Models;

namespace TimeTracker.Domain.Models
{
    public class Worklog
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string Name { get; set; }
        public required string Project { get; set; }
        public string? Notes { get; set; }
        public CategoryEnum Category { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsCompleted => EndTime != null;
        public JiraIssue? Issue { get; set; }
    }
}
