public class Comment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string ContentItems { get; set; }
    public required DateTime CreatedAt { get; set; }

    public string? FilePath { get; set; }

    public int? ParentId { get; set; }
    public Comment? Parent { get; set; }

    public List<Comment> Children { get; set; } = new();

    public User? User { get; set; }
}
