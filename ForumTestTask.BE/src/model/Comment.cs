public class Comment
{
    public int Id { get; set; }
    public required int UserId { get; set; }
    public List<int>? ReplyIds { get; set; } = [];
    public required string Text { get; set; }
    public required DateTime CreatedAt { get; set; }
    public string? FilePath { get; set; }

    // public User? User { get; set; }
}

