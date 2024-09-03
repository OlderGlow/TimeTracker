using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TimeTracker.Domain.Dto;
using TimeTracker.Domain.Models;
using TimeTracker.Jira.Models;

[ApiController]
[Route("api/[controller]")]
public class TimeTrackerController(ITimeTrackerService timeTrackerService, ILogger<TimeTrackerController> _logger) : ControllerBase
{
    private readonly ITimeTrackerService _timeTrackerService = timeTrackerService;

    [HttpGet("{date}")]
    public async Task<ActionResult<TrackerResult<List<Worklog>>>> GetWorklogs(string date)
    {
        try
        {
            var worklogs = await _timeTrackerService.GetWorklogsAsync(date);
            return Ok(TrackerResult<List<Worklog>>.Success(worklogs));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while getting worklogs");
            return StatusCode(500, TrackerResult<List<Worklog>>.Failure("ERR001", ex.Message));
        }
    }

    [HttpGet("{date}/{worklogId}")]
    public async Task<ActionResult<TrackerResult<Worklog>>> GetWorklog(string date, string worklogId)
    {
        try
        {
            var worklog = await _timeTrackerService.GetWorklogAsync(worklogId, date);
            if (worklog == null)
            {
                return NotFound(TrackerResult<Worklog>.Failure("ERR002", "Worklog not found"));
            }
            return Ok(TrackerResult<Worklog>.Success(worklog));
        }
        catch (Exception ex)
        {
            return StatusCode(500, TrackerResult<Worklog>.Failure("ERR003", ex.Message));
        }
    }

    [HttpPost("{date}/{worklogId}/start")]
    public async Task<ActionResult<TrackerResult<string>>> StartWorklog(string date, string worklogId)
    {
        try
        {
            await _timeTrackerService.StartWorklogAsync(worklogId, date);
            return Ok(TrackerResult<string>.Success("Worklog started successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, TrackerResult<string>.Failure("ERR004", ex.Message));
        }
    }

    [HttpPut("{date}/{worklogId}/stop")]
    public async Task<ActionResult<TrackerResult<string>>> StopWorklog(string date, string worklogId)
    {
        try
        {
            await _timeTrackerService.StopWorklogAsync(worklogId, date);
            return Ok(TrackerResult<string>.Success("Worklog stopped successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, TrackerResult<string>.Failure("ERR006", ex.Message));
        }
    }

    [HttpPost("{date}")]
    public async Task<ActionResult<TrackerResult<Worklog>>> SaveWorklog(string date, [FromBody] Worklog worklog)
    {
        try
        {
           var worklogResult = await _timeTrackerService.SaveWorklogAsync(worklog, date);
            return Ok(TrackerResult<Worklog>.Success(worklogResult));
        }
        catch (Exception ex)
        {
            return StatusCode(500, TrackerResult<string>.Failure("ERR007", ex.Message));
        }
    }

    [HttpDelete("{date}/{worklogId}")]
    public async Task<ActionResult<TrackerResult<string>>> DeleteWorklog(string date, string worklogId)
    {
        try
        {
            await _timeTrackerService.DeleteWorklogAsync(worklogId, date);
            return Ok(TrackerResult<string>.Success("Worklog deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, TrackerResult<string>.Failure("ERR008", ex.Message));
        }
    }

    [HttpGet("jira/{issueKey}")]
    public async Task<ActionResult<TrackerResult<JiraIssue>>> GetJiraIssueUrl([FromQuery] string? projectId, string issueKey)
    {
        try
        {
            var issue = await _timeTrackerService.GetJiraIssueAsync(projectId, issueKey);
            if (issue == null)
            {
                return NotFound(TrackerResult<string>.Failure("ERR009", "Issue not found"));
            }
            return Ok(TrackerResult<JiraIssue>.Success(issue));
        }
        catch (Exception ex)
        {
            return StatusCode(500, TrackerResult<string>.Failure("ERR010", ex.Message));
        }
    }

    [HttpGet("weeklyDurationWorklog")]
    public async Task<ActionResult<TrackerResult<List<Worklog>>>> GetWorklogsWeekly([FromQuery] string startDate, [FromQuery] string endDate)
    {
        try
        {
            var result = await _timeTrackerService.GetWorklogsWeekly(startDate, endDate);
            return Ok(TrackerResult<List<Worklog>>.Success(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, TrackerResult<float>.Failure("ERR011", ex.Message));
        }
    }
}
