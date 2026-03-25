using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;


public class UserDto
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9]+$",
        ErrorMessage = "Username can contain only letters and numbers")]
    public required string UserName { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(100)]
    public required string Email { get; set; }

    [OptionalUrl]
    [StringLength(200)]
    public string? HomePage { get; set; }
}
