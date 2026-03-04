using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly FileService _fileService = new FileService();
    private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png" };
    private readonly string[] _allowedTxtFileExtensions = { ".txt" };


    public CommentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public IActionResult CreateComment(CommentDto commentDto)
    {
        var comment = new Comment
        {
            UserId = commentDto.UserId,
            Text = commentDto.Text,
            CreatedAt = DateTime.UtcNow
        };
        {
            _context.Comments.Add(comment);
            _context.SaveChanges();
            return Ok(comment);
        }
    }

    [HttpGet]
    public IActionResult GetComments()
    {
        var comments = _context.Comments.ToList();
        return Ok(comments);
    }

    [HttpPost("with-files")]
    public async Task<IActionResult> CreateCommentWithFiles(
        [FromForm] CommentDto commentDto,
        [FromForm] IFormFile? txtFile,
        [FromForm] IFormFile? image
        )
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == commentDto.UserId);

        if (!userExists)
            return BadRequest("User does not exist.");

        // Handle image 
        if (image != null && image.Length > 0)
        {
            var extension = Path.GetExtension(image.FileName).ToLower();

            if (!_allowedImageExtensions.Contains(extension))
                return BadRequest("Only JPG and PNG images are allowed.");
        }

        // Handle TXT file
        if (txtFile != null && txtFile.Length > 0)
        {
            var extension = Path.GetExtension(txtFile.FileName).ToLower();

            if (!_allowedTxtFileExtensions.Contains(extension))
                return BadRequest("Only TXT files are allowed.");
        }

        // Create comment entity
        var comment = new Comment
        {
            UserId = commentDto.UserId,
            Text = commentDto.Text,
            CreatedAt = DateTime.UtcNow,
            ImagePath = image != null ? await _fileService.ResizeAndSaveImage(image) : null,
            TxtFilePath = txtFile != null ? _fileService.SaveTxtFile(txtFile) : null
        };

        // Save to database 
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok("Comment saved successfully");
    }
}
