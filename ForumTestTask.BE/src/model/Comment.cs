public class Comment
{
    public int Id { get; set; }
    public required int UserId { get; set; }
    public int? ReplayId { get; set; }
    public required string Text { get; set; }
    public required DateTime CreatedAt { get; set; }
    public string? TxtFilePath { get; set; }
    public string? ImagePath { get; set; }

    public User? User { get; set; }
}
