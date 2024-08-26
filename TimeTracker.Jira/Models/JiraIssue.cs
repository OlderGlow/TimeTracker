using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TimeTracker.Jira.Models
{
    public class JiraIssue
    {
        public required string Id { get; set; }
        public string? Key { get; set; }
        public string? Summary { get; set; }
        public string? Url { get; set; }
    }
}
