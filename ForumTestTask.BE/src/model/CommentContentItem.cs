using System.Text.Json.Serialization;

public class CommentContentItem
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ContentType Type { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

    [JsonPropertyName("id")]
    public int? Id { get; set; }
}
