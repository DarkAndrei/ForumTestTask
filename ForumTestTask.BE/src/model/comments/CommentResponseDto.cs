public class CommentResponseDto
{
    public int Id { get; set; }
    public required string UserName { get; set; } = string.Empty;
    public required string ContentItems { get; set; }
    public required DateTime CreatedAt { get; set; }
    public string? FilePath { get; set; }

    public List<CommentResponseDto> Children { get; set; } = [];

    public int? ParentId { get; set; }
}
