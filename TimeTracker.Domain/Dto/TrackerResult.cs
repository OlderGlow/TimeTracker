using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TimeTracker.Domain.Dto
{
    public class TrackerResult<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string? ErrorCode { get; set; }
        public string? ErrorMessage { get; set; }

        public static TrackerResult<T> Success(T data)
        {
            return new TrackerResult<T> { IsSuccess = true, Data = data };
        }

        public static TrackerResult<T> Failure(string errorCode, string errorMessage)
        {
            return new TrackerResult<T> { IsSuccess = false, ErrorCode = errorCode, ErrorMessage = errorMessage };
        }
    }

}
