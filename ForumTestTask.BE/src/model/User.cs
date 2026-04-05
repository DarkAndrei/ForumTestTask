using System.Text.Json.Serialization;

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? HomePage { get; set; }
}
