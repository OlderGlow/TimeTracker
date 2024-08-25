using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TimeTracker.Jira.Models
{
    public class JiraTimeEntry
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? Comment { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan TimeSpent => (EndTime ?? DateTime.Now) - StartTime;
    }


}
