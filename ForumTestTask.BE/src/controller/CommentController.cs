using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpPost]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> AddComment([FromForm] CreateCommentDto createCommentDto, [FromForm] IFormFile? file)
    {
        var comment = await _commentService.AddCommentAsync(createCommentDto, file);
        if (comment == null) return BadRequest(new { success = false, message = "Could not create comment" });

        return Ok(new { success = true, message = "Comment saved successfully" });
    }

    [HttpPut("reply")]
    public async Task<IActionResult> AddReply([FromForm] int parentId, [FromForm] CreateCommentDto createCommentDto, [FromForm] IFormFile? file)
    {
        var reply = await _commentService.AddReplyAsync(parentId, createCommentDto, file);
        if (reply == null) return BadRequest(new { success = false, message = "Could not create reply" });

        return Ok(new { success = true, message = "Reply saved successfully" });
    }

    [HttpGet]
    public async Task<IActionResult> GetCommentsFromPage(
      [FromQuery] int page = 1,
      [FromQuery] SortType sortType = SortType.Default)
    {
        var (comments, totalItems, totalPages) = await _commentService.GetCommentsByPageAsync(page, sortType);

        if (!comments.Any()) return NotFound(new { success = false, message = "No comments found." });

        return Ok(new
        {
            success = true,
            comments = comments,
            pagination = new { page = page, pageSize = 25, totalItems, totalPages }
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetComment(int id)
    {
        var comment = await _commentService.GetCommentByIdAsync(id);
        if (comment == null) return NotFound(new { success = false, message = "Comment not found" });

        return Ok(new { success = true, data = comment });
    }
}
