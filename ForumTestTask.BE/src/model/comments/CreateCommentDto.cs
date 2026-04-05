using System.ComponentModel.DataAnnotations;

public class CreateCommentDto
{
    [Required]
    public int UserId { get; set; }

    [Required]
    [MinLength(1)]
    [MaxLength(1000)]
    public required string ContentItems { get; set; }
}
