using Azure;
using Azure.Data.Tables;

namespace Zephyr;

internal class VisitorCounter : ITableEntity
{
    public string PartitionKey { get; set; } = "counter";
    public string RowKey { get; set; } = "visitors";

    public long Count { get; set; }

    public ETag ETag { get; set; }
    public DateTimeOffset? Timestamp { get; set; }
}
