using Ganss.Xss;
using System.Text.Json;
using System.Text.Json.Serialization;

public class HtmlSanitizerService
{
    private readonly HtmlSanitizer _sanitizer;

    public HtmlSanitizerService()
    {
        _sanitizer = new HtmlSanitizer();

        _sanitizer.AllowedTags.Clear();
        _sanitizer.AllowedTags.Add("a");
        _sanitizer.AllowedTags.Add("code");
        _sanitizer.AllowedTags.Add("i");
        _sanitizer.AllowedTags.Add("strong");

        _sanitizer.AllowedAttributes.Clear();
        _sanitizer.AllowedAttributes.Add("href");
        _sanitizer.AllowedAttributes.Add("title");

        _sanitizer.AllowedAttributes.Add("data-quote-id");
    }

    public string Sanitize(string html) =>
        string.IsNullOrWhiteSpace(html) ? string.Empty : _sanitizer.Sanitize(html);

    public List<CommentContentItem> SanitizeContentItems(List<CommentContentItem> items)
    {
        foreach (var item in items)
        {
            if (item.Type == ContentType.Text && !string.IsNullOrWhiteSpace(item.Value))
            {
                item.Value = _sanitizer.Sanitize(item.Value);
            }
        }

        return items;
    }
}
