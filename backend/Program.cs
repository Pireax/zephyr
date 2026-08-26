using Azure.Data.Tables;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Zephyr;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services.AddSingleton(sp =>
{
    var connectionString = Environment.GetEnvironmentVariable("StorageConnection");
    var serviceClient = new TableServiceClient(connectionString);
    var client = serviceClient.GetTableClient("VisitorCounter");
    //var client = new TableClient(connectionString, "VisitorCounter");
    var response = client.CreateIfNotExists();
    if (response.GetRawResponse().Status != 409)
        client.AddEntity(new VisitorCounter { Count = 0 });
    return client;
});

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

builder.Build().Run();
