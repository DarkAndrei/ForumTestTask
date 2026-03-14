using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats;

public class FileService
{
    private readonly string _uploadFolder = "wwwroot/uploads/comments";

    public string generateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        return Guid.NewGuid().ToString() + extension;
    }

    public async Task<Image> ResizeImage(IFormFile file)
    {
        var genImageName = generateUniqueFileName(file.FileName);
        var imagePath = Path.Combine(_uploadFolder, genImageName);

        using var image = await Image.LoadAsync(file.OpenReadStream());

        int targetWidth = 320;
        int targetHeight = 240;

        if (image.Width > targetWidth || image.Height > targetHeight)
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new SixLabors.ImageSharp.Size(targetWidth, targetHeight)
            }));
        }

        return image;
    }

    public async Task<string> SaveFile(IFormFile file)
    {
        var genFileName = generateUniqueFileName(file.FileName);
        var filePath = Path.Combine(_uploadFolder, genFileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return "/uploads/comments/" + genFileName;
    }



}