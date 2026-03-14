// using Ganss.XSS;

// public class CommentService
// {
//     private readonly HtmlSanitizer _sanitizer;

//     public CommentService()
//     {
//         _sanitizer = new HtmlSanitizer();

//         // Дозволені теги
//         _sanitizer.AllowedTags.Clear();
//         _sanitizer.AllowedTags.Add("b");
//         _sanitizer.AllowedTags.Add("i");
//         _sanitizer.AllowedTags.Add("strong");
//         _sanitizer.AllowedTags.Add("code");
//         _sanitizer.AllowedTags.Add("a");

//         // Дозволені атрибути
//         _sanitizer.AllowedAttributes.Add("href");
//     }

//     public string SanitizeComment(string html)
//     {
//         return _sanitizer.Sanitize(html);
//     }
// }