using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly FileService _fileService = new();

    public CommentsController(AppDbContext context, FileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    [HttpGet]
    public IActionResult GetComments()
    {
        var comments = _context.Comments.ToList();
        return Ok(comments);
    }

    [HttpPost]
    public async Task<IActionResult> AddComment(
        [FromForm] CommentDto commentDto,
        [FromForm] IFormFile? file
        )
    {
        string? filePath = null;

        var userExists = await _context.Users.AnyAsync(u => u.Id == commentDto.UserId);

        if (!userExists)
            return BadRequest("User does not exist.");

        if (file != null && file.Length > 0)
        {
            filePath = await _fileService.SaveAsync(file);

            if (filePath == null)
                return BadRequest("Invalid file.");
        }

        var comment = new Comment
        {
            UserId = commentDto.UserId,
            Text = commentDto.Text,
            CreatedAt = DateTime.UtcNow,
            FilePath = filePath
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Comment saved successfully" });
    }

    [HttpPut("reply")]
    public async Task<IActionResult> AddReplyComment(
        [FromForm] int parentId,
        [FromForm] CommentDto commentDto,
        [FromForm] IFormFile? file
        )
    {
        string? filePath = null;

        var parentComment = await _context.Comments.FindAsync(parentId);

        if (parentComment == null)
            return NotFound("Parent comment not found.");

        if (file != null && file.Length > 0)
        {
            filePath = await _fileService.SaveAsync(file);

            if (filePath == null)
                return BadRequest("Invalid file.");
        }

        var replyComment = new Comment
        {
            UserId = commentDto.UserId,
            Text = commentDto.Text,
            CreatedAt = DateTime.UtcNow,
            FilePath = filePath
        };

        _context.Comments.Add(replyComment);
        await _context.SaveChangesAsync();

        parentComment.ReplyIds ??= new List<int>();
        parentComment.ReplyIds.Add(replyComment.Id);

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Comment saved successfully" });
    }


    // temporary method for bulk comments creation without file upload
    [HttpPost("bulk")]
    public async Task<IActionResult> AddComments([FromBody] List<CommentDto> commentsDto)
    {
        if (commentsDto == null || commentsDto.Count == 0)
            return BadRequest("No comments provided.");

        var result = new List<object>();

        foreach (var commentDto in commentsDto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == commentDto.UserId);

            if (!userExists)
            {
                result.Add(new { commentDto.UserId, commentDto.Text, Status = "User does not exist" });
                continue;
            }

            string? filePath = null;

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
}
