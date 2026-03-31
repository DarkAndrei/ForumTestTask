using SixLabors.ImageSharp;

public class FileValidator
{
    private const int MaxTxtSize = 100 * 1024; // 100KB
    private const int MaxImageSize = 5 * 1024 * 1024; // 5MB

    private readonly string[] _allowedImageFormats = { "JPEG", "PNG", "GIF" };
    private readonly string[] _allowedTextExtensions = { ".txt" };

    public async Task<bool> IsValidImageAsync(IFormFile file)
    {
        if (file.Length == 0 || file.Length > MaxImageSize)
            return false;

        try
        {
            using var stream = file.OpenReadStream();

            var format = await Image.DetectFormatAsync(stream);

            if (format == null || !_allowedImageFormats.Contains(format.Name))
                return false;

            stream.Position = 0;
            using var image = await Image.LoadAsync(stream);

            if (image.Width > 5000 || image.Height > 5000)
                return false;

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> IsValidTextAsync(IFormFile file)
    {
        if (file.Length == 0 || file.Length > MaxTxtSize)
            return false;

        var extension = Path.GetExtension(file.FileName).ToLower();

        if (!_allowedTextExtensions.Contains(extension))
            return false;

        try
        {
            using var reader = new StreamReader(file.OpenReadStream());
            var content = await reader.ReadToEndAsync();

            // 🔥 Basic sanitization rules
            if (content.Contains("<script", StringComparison.OrdinalIgnoreCase))
                return false;

            if (content.Contains("<html", StringComparison.OrdinalIgnoreCase))
                return false;

            return true;
        }
        catch
        {
            return false;
        }
    }
}
