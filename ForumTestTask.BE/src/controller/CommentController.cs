using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly FileService _fileService = new();
    private readonly string[] _allowedFileExtensions = { ".jpg", ".gif", ".png", ".txt" };
    private readonly string[] _allowedImageExtensions = { ".jpg", ".gif", ".png" };
    private readonly string[] _allowedTextFileExtensions = { ".txt" };
    private readonly int _txtFileWeightLimit = 102400; // 100 KB

    private string filePath = "";

    public CommentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetComments()
    {
        var comments = _context.Comments.ToList();
        return Ok(comments);
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment(
        [FromForm] CommentDto commentDto,
        [FromForm] IFormFile? file
        )
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == commentDto.UserId);

        if (!userExists)
            return BadRequest("User does not exist.");

        // Handle file 
        if (file != null && file.Length > 0)
        {
            var filePath = await ValidateFile(file);

            if (filePath is null && file != null)
                return BadRequest("Invalid file.");
        }


        // Create comment entity
        var comment = new Comment
        {
            UserId = commentDto.UserId,
            Text = commentDto.Text,
            CreatedAt = DateTime.UtcNow,
            FilePath = filePath
        };

        Console.WriteLine($"Comment created: {comment.UserId}, {comment.Text}, {comment.CreatedAt}, {comment.FilePath}");

        // Save to database 
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Comment saved successfully" });
    }

    [HttpPut("reply")]
    public async Task<IActionResult> CreateReplyComment(
        [FromForm] int parentId,
        [FromForm] CommentDto commentDto,
        [FromForm] IFormFile? file
        )
    {
        // 1. Find parent comment
        var parentComment = await _context.Comments.FindAsync(parentId);
        if (parentComment == null)
            return NotFound("Parent comment not found.");

        // Handle file 
        if (file != null && file.Length > 0)
        {
            var filePath = await ValidateFile(file);

            if (filePath is null && file != null)
                return BadRequest("Invalid file.");
        }

        // 2. Create the reply (child comment)
        var replyComment = new Comment
        {
            UserId = commentDto.UserId,
            Text = commentDto.Text,
            CreatedAt = DateTime.UtcNow,
            FilePath = filePath
        };

        _context.Comments.Add(replyComment);
        await _context.SaveChangesAsync(); // child.Id is now generated

        // 3. Link parent -> child
        parentComment.ReplyIds ??= new List<int>(); // ensure list is not null
        parentComment.ReplyIds.Add(replyComment.Id);



        await _context.SaveChangesAsync();

        return Ok(new { Message = "Comment saved successfully" });
    }

    // POST many comments in the same time
    [HttpPost("bulk")]
    public async Task<IActionResult> CreateComments([FromBody] List<CommentDto> commentsDto)
    {
        if (commentsDto == null || commentsDto.Count == 0)
            return BadRequest("No comments provided.");

        var result = new List<object>();

        foreach (var commentDto in commentsDto)
        {
            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == commentDto.UserId);
            if (!userExists)
            {
                result.Add(new { commentDto.UserId, commentDto.Text, Status = "User does not exist" });
                continue;
            }

            // Handle optional file (if you want to allow per comment)
            string? filePath = null;

            // Create comment entity
            var comment = new Comment
            {
                UserId = commentDto.UserId,
                Text = commentDto.Text,
                CreatedAt = DateTime.UtcNow,
                FilePath = filePath
            };

            _context.Comments.Add(comment);
            result.Add(new { commentDto.UserId, commentDto.Text, Status = "Created" });
        }

        await _context.SaveChangesAsync();

        return Ok(result);
    }

    private async Task<string?> ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0) return null;

        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!_allowedFileExtensions.Contains(extension))
            return null;

        if (_allowedImageExtensions.Contains(extension))
            await _fileService.ResizeImage(file);
        else if (_allowedTextFileExtensions.Contains(extension) && file.Length > _txtFileWeightLimit)
            return null;

        return await _fileService.SaveFile(file);
    }
}
