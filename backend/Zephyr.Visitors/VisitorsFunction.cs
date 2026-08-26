using Azure;
using Azure.Data.Tables;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Zephyr.Visitors;

public class VisitorsFunction
{
    private const string PartitionKey = "counter";
    private const string RowKey = "visitors";
    private readonly ILogger<VisitorsFunction> _logger;
    private readonly TableClient _tableClient;

    public VisitorsFunction(ILogger<VisitorsFunction> logger, TableClient tableClient)
    {
        _logger = logger;
        _tableClient = tableClient;
    }

    [Function("Visitors")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
    {
        switch (req.Method)
        {
            case "GET":
                var response = await _tableClient.GetEntityAsync<VisitorCounter>(PartitionKey, RowKey);
                return new OkObjectResult(response.Value.Count);
            case "POST":
                var count = await IncrementVisitorCounter();
                return new OkObjectResult(count );
            default:
                return new BadRequestObjectResult("Unsupported HTTP method.");
        }
    }

    private async Task<long> IncrementVisitorCounter()
    {
        var response = await _tableClient.GetEntityAsync<VisitorCounter>(PartitionKey, RowKey);
        var counter = response.Value;
        counter.Count++;
        try
        {
            await _tableClient.UpdateEntityAsync(counter, counter.ETag, TableUpdateMode.Replace);
        }
        catch (RequestFailedException ex) when (ex.Status == 412)
        {
            // Handle concurrency conflict by retrying the operation
            _logger.LogWarning("Concurrency conflict detected. Retrying the operation.");
            return await IncrementVisitorCounter();
        }

        return counter.Count;
    }
}