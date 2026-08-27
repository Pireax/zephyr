using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Zephyr.Visitors;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services.AddSingleton(sp =>
{
    const string TableName = "VisitorCounter";

    var endpoint = Environment.GetEnvironmentVariable("StorageEndpoint");
    var client = endpoint switch
    {
        null => new TableClient(Environment.GetEnvironmentVariable("StorageConnection"), TableName),
        _ => new TableClient(new Uri(endpoint), TableName, new Azure.Identity.DefaultAzureCredential())
    };
    var response = client.CreateIfNotExists();
    if (response.GetRawResponse().Status != 409)
        client.AddEntity(new VisitorCounter { Count = 0 });
    return client;
});

builder.Services.AddHttpClient();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

builder.Build().Run();
