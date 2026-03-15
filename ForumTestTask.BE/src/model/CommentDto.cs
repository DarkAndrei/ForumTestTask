using System.ComponentModel.DataAnnotations;


public class CommentDto
{
    public int UserId { get; set; }

    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public required string Text { get; set; }
}