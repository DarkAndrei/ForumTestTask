using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

public class FileService
{
    private const int TargetWidth = 320;
    private const int TargetHeight = 240;

    private readonly string _uploadFolder = "wwwroot/uploads/comments/";
    private readonly string _fileFolder = "/uploads/comments/";

    private readonly FileValidator _validationService;

    public FileService(FileValidator FileValidator)
    {
        _validationService = FileValidator;
    }

    public async Task<string?> SaveAsync(IFormFile file)
    {
        if (file == null)
            return null;

        if (await _validationService.IsValidImageAsync(file))
            return await SaveImage(file);

        if (await _validationService.IsValidTextAsync(file))
            return await SaveTextFile(file);

        return null;
    }

    private async Task<string?> SaveImage(IFormFile file)
    {
        var fileName = GenerateUniqueFileName(file.FileName);
        var path = Path.Combine(_uploadFolder, fileName);

        using var image = await Image.LoadAsync(file.OpenReadStream());

        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Mode = ResizeMode.Max,
            Size = new Size(TargetWidth, TargetHeight)
        }));

        await image.SaveAsync(path);

        return _fileFolder + fileName;
    }

    private async Task<string?> SaveTextFile(IFormFile file)
    {
        var fileName = GenerateUniqueFileName(file.FileName);
        var path = Path.Combine(_uploadFolder, fileName);

        using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream);

        return _fileFolder + fileName;
    }

    private string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        return Guid.NewGuid() + extension;
    }
}
