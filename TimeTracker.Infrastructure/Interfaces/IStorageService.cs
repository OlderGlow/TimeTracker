using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TimeTracker.Domain.Models;

namespace TimeTracker.Infrastructure.Interfaces
{
    public interface IStorageService
    {
        Task<List<Worklog>> GetWorklogsAsync(string date);
        Task<Worklog?> GetWorklogAsync(string worklogId, string date);
        Task<Worklog> SaveWorklogAsync(Worklog worklog, string date);
        Task DeleteWorklogAsync(string worklogId, string date);
        Task<List<Worklog>> GetWorklogsBeetweenDatesAsync(string startDate, string endDate);
    }
}
