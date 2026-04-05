using System.Text.Json.Serialization;

public class ContentItem
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    [ValidEnum(typeof(ContentType))]
    public required ContentType Type { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

    [JsonPropertyName("id")]
    public int? Id { get; set; }
}
