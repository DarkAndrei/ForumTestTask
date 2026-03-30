using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly FileService _fileService;
    private readonly HtmlSanitizerService _htmlSanitizerService;
    private readonly CommentService _commentService;

    public CommentsController(AppDbContext context, FileService fileService, HtmlSanitizerService htmlSanitizerService, CommentService commentService)
    {
        _context = context;
        _fileService = fileService;
        _htmlSanitizerService = htmlSanitizerService;
        _commentService = commentService;
    }

    [RequestSizeLimit(100_000_000)]
    [HttpPost]
    public async Task<IActionResult> AddComment(
    [FromForm] CommentDto commentDto,
    [FromForm] IFormFile? file
)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        string? filePath = null;
        if (file != null && file.Length > 0)
        {
            filePath = await _fileService.SaveAsync(file);
            if (filePath == null)
                return BadRequest(new { success = false, message = "Invalid file." });
        }

        List<CommentContentItem>? contentItems;

        try
        {
            contentItems = JsonSerializer.Deserialize<List<CommentContentItem>>(commentDto.ContentItems);

            if (contentItems == null || !contentItems.Any())
                return BadRequest(new { success = false, message = "No content items provided." });
        }
        catch (JsonException)
        {
            return BadRequest(new { success = false, message = "Invalid ContentItems JSON." });
        }

        var sanitizedItems = _htmlSanitizerService.SanitizeContentItems(contentItems);
        var serializedContent = JsonSerializer.Serialize(sanitizedItems, new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() }
        });

        var comment = new Comment
        {
            UserId = commentDto.UserId,
            ContentItems = serializedContent,
            CreatedAt = _commentService.GetDateTime(),
            FilePath = filePath
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Comment saved successfully" });
    }

    [RequestSizeLimit(100_000_000)]
    [HttpPut("reply")]
    public async Task<IActionResult> AddReplyComment(
    [FromForm] int parentId,
    [FromForm] CommentDto commentDto,
    [FromForm] IFormFile? file
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var parentComment = await _context.Comments.FindAsync(parentId);
        if (parentComment == null)
            return BadRequest(new { success = false, Message = "Parent comment not found." });

        string? filePath = null;

        if (file != null && file.Length > 0)
        {
            filePath = await _fileService.SaveAsync(file);
            if (filePath == null)
                return BadRequest(new { success = false, Message = "Invalid file." });
        }

        List<CommentContentItem>? contentItems;

        try
        {
            contentItems = JsonSerializer.Deserialize<List<CommentContentItem>>(commentDto.ContentItems);

            if (contentItems == null || !contentItems.Any())
                return BadRequest(new { success = false, message = "No content items provided." });
        }
        catch (JsonException)
        {
            return BadRequest(new { success = false, message = "Invalid ContentItems JSON." });
        }

        var sanitizedItems = _htmlSanitizerService.SanitizeContentItems(contentItems);

        var serializedContent = JsonSerializer.Serialize(sanitizedItems, new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() }
        });

        var replyComment = new Comment
        {
            UserId = commentDto.UserId,
            ContentItems = serializedContent,
            CreatedAt = _commentService.GetDateTime(),
            FilePath = filePath
        };

        _context.Comments.Add(replyComment);
        await _context.SaveChangesAsync();

        parentComment.ReplyIds ??= new List<int>();
        parentComment.ReplyIds.Add(replyComment.Id);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, Message = "Reply comment saved successfully" });
    }

    [HttpGet]
    public IActionResult GetComments()
    {
        var comments = _context.Comments.ToList();
        if (comments == null || !comments.Any())
        {
            return BadRequest(new { success = false, Message = "No comments found." });
        }

        return Ok(new { success = true, data = comments });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetComment(int id)
    {
        var comment = await _context.Comments.FindAsync(id);

        if (comment == null)
        {
            return BadRequest(new { success = false, Message = "Comment not found." });
        }

        return Ok(new { success = true, data = comment });
    }

    // temporary method for bulk comments creation without file upload
    [RequestSizeLimit(100_000_000)]
    [HttpPost("bulk")]
    public async Task<IActionResult> AddComments([FromBody] List<CommentDto> commentsDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, errors = ModelState });

        var result = new List<object>();

        foreach (var commentDto in commentsDto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == commentDto.UserId);
            if (!userExists)
            {
                result.Add(new { commentDto.UserId, Status = "User does not exist" });
                continue;
            }

            List<CommentContentItem>? contentItems;

            try
            {
                contentItems = JsonSerializer.Deserialize<List<CommentContentItem>>(commentDto.ContentItems);

                if (contentItems == null || !contentItems.Any())
                    return BadRequest(new { success = false, message = "No content items provided." });
            }
            catch (JsonException)
            {
                return BadRequest(new { success = false, message = "Invalid ContentItems JSON." });
            }

            var sanitizedItems = _htmlSanitizerService.SanitizeContentItems(contentItems);

            var serializedContent = JsonSerializer.Serialize(sanitizedItems, new JsonSerializerOptions
            {
                Converters = { new JsonStringEnumConverter() }
            });

            var comment = new Comment
            {
                UserId = commentDto.UserId,
                ContentItems = serializedContent,
                CreatedAt = _commentService.GetDateTime(),
                FilePath = null
            };

            _context.Comments.Add(comment);

            result.Add(new { comment, Status = "Created" });
        }

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = result });
    }
}
