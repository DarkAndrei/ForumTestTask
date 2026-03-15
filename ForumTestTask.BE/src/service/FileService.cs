using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats;

public class FileService
{
    private const int MaxTxtSize = 102400; // 100 KB
    private const int TargetWidth = 320;
    private const int TargetHeight = 240;

    private readonly string[] _allowedImageExtensions = { ".jpg", ".png", ".gif" };
    private readonly string[] _allowedTextExtensions = { ".txt" };

    private readonly string _uploadFolder = "wwwroot/uploads/comments";
    private readonly string _fileFolder = "/uploads/comments";

    public async Task<string?> SaveAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return null;

        var extension = Path.GetExtension(file.FileName).ToLower();

        if (file.ContentType.StartsWith("image/") && _allowedImageExtensions.Contains(extension))
            return await SaveImage(file);

        if (file.ContentType.StartsWith("text/") && _allowedTextExtensions.Contains(extension))
            return await SaveTextFile(file);

        return null;
    }


    private async Task<string?> SaveImage(IFormFile file)
    {
        var fileName = GenerateUniqueFileName(file.FileName);
        var path = Path.Combine(_uploadFolder, fileName);

        try
        {
            using var image = await Image.LoadAsync(file.OpenReadStream());

            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(TargetWidth, TargetHeight)
            }));

            await image.SaveAsync(path);
        }
        catch
        {
            return null; // invalid or corrupted image
        }

        return _fileFolder + fileName;
    }

    private async Task<string?> SaveTextFile(IFormFile file)
    {
        if (file.Length > MaxTxtSize)
            return null;

        var fileName = GenerateUniqueFileName(file.FileName);
        var path = Path.Combine(_uploadFolder, fileName);

        using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream);

        return _fileFolder + fileName;
    }

    public string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        return Guid.NewGuid().ToString() + extension;
    }
}