using System.ComponentModel.DataAnnotations;

public class CommentDto
{
    [Required]
    public int UserId { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(1000)]
    public string ContentItems { get; set; } = string.Empty;
}
