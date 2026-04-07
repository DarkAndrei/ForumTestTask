using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

public class CommentService : ICommentService
{
    private readonly AppDbContext _context;
    private readonly FileService _fileService;
    private readonly HtmlSanitizerService _htmlSanitizerService;

    public CommentService(AppDbContext context, FileService fileService, HtmlSanitizerService htmlSanitizerService)
    {
        _context = context;
        _fileService = fileService;
        _htmlSanitizerService = htmlSanitizerService;
    }

    public async Task<Comment?> AddCommentAsync(
        CreateCommentDto createCommentDto,
        IFormFile? file,
        int? parentId = null
    )
    {
        string? filePath = null;

        if (file != null && file.Length > 0)
        {
            filePath = await _fileService.SaveAsync(file);
            if (filePath == null) return null;
        }

        var contentItems = JsonSerializer.Deserialize<List<ContentItem>>(createCommentDto.ContentItems);
        if (contentItems == null || !contentItems.Any()) return null;

        var sanitizedItems = _htmlSanitizerService.SanitizeContentItems(contentItems);
        var serializedContent = JsonSerializer.Serialize(sanitizedItems, new JsonSerializerOptions
        {
            Converters = { new JsonStringEnumConverter() }
        });

        var comment = new Comment
        {
            UserId = createCommentDto.UserId,
            ContentItems = serializedContent,
            CreatedAt = GetDateTime(),
            FilePath = filePath,
            ParentId = parentId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        return comment;
    }

    public async Task<Comment?> AddReplyAsync(int parentId, CreateCommentDto createCommentDto, IFormFile? file)
    {
        var parentExists = await _context.Comments.AnyAsync(c => c.Id == parentId);
        if (!parentExists) return null;

        var reply = await AddCommentAsync(createCommentDto, file);
        if (reply == null) return null;

        reply.ParentId = parentId;

        await _context.SaveChangesAsync();

        return reply;
    }

    public async Task<List<Comment>> GetCommentsAsync()
    {
        return await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Children)
            .ToListAsync();
    }

    public async Task<Comment?> GetCommentByIdAsync(int id)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<(List<CommentResponseDto> comments, int totalItems, int totalPages)> GetCommentsByPageAsync(
    int pageNumber, SortType sortType)
    {
        const int pageSize = 25;

        var allComments = await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Children)
            .ToListAsync();

        var allCommentDtos = allComments.Select(c => new CommentResponseDto
        {
            Id = c.Id,
            UserName = c.User?.Name ?? "",
            ContentItems = c.ContentItems,
            FilePath = c.FilePath,
            CreatedAt = c.CreatedAt,
            ParentId = c.ParentId,
        }).ToList();

        var commentTree = BuildCommentTrees(allCommentDtos);
        var sortedComments = SortComments(commentTree, sortType);

        var totalItems = commentTree.Count;
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var pagedTopLevel = sortedComments
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return (pagedTopLevel, totalItems, totalPages);
    }

    private List<CommentResponseDto> SortComments(List<CommentResponseDto> comments, SortType? sortType)
    {
        comments.Sort(sortType switch
        {
            SortType.Default or SortType.Date =>
                (x, y) => y.CreatedAt.CompareTo(x.CreatedAt),
            SortType.Name =>
                (x, y) => string.Compare(x.UserName, y.UserName, StringComparison.Ordinal),
            SortType.Email =>
                (x, y) => string.Compare(x.UserName, y.UserName, StringComparison.Ordinal),
            _ => (x, y) => y.CreatedAt.CompareTo(x.CreatedAt)
        });

        return comments;
    }

    private List<CommentResponseDto> BuildCommentTrees(List<CommentResponseDto> allComments)
    {
        var lookup = allComments.ToDictionary(c => c.Id);
        var roots = new List<CommentResponseDto>();

        foreach (var comment in allComments)
        {
            if (comment.ParentId.HasValue && lookup.TryGetValue(comment.ParentId.Value, out var parent))
            {
                parent.Children.Add(comment);
            }
            else
            {
                roots.Add(comment);
            }
        }

        ReverseChildren(roots);

        return roots;
    }

    private List<CommentResponseDto> ReverseChildren(List<CommentResponseDto> comments)
    {
        foreach (var c in comments)
        {
            if (c.Children != null && c.Children.Any())
            {
                c.Children.Reverse();
                ReverseChildren(c.Children);
            }
        }

        return comments;
    }

    private DateTime GetDateTime() => DateTime.UtcNow;
}
