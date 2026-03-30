// using System.ComponentModel.DataAnnotations;
// using System.Text.Json;

// public class ValidJsonAttribute : ValidationAttribute
// {
//     protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
//     {
//         if (value is not string str || string.IsNullOrWhiteSpace(str))
//             return new ValidationResult("ContentItems cannot be empty.");

//         try
//         {
//             var items = JsonSerializer.Deserialize<List<CommentContentItem>>(str);
//             if (items == null || items.Count == 0)
//                 return new ValidationResult("ContentItems must contain at least one item.");

//             // Optional: check each item
//             foreach (var item in items)
//             {
//                 if (item.Type != ContentType.Text && item.Type != ContentType.Quote)
//                     return new ValidationResult($"Invalid ContentType: {item.Type}");

//                 if (item.Type == ContentType.Text && string.IsNullOrWhiteSpace(item.Value))
//                     return new ValidationResult("Text items must have a value.");

//                 if (item.Type == ContentType.Quote && !item.Id.HasValue)
//                     return new ValidationResult("Quote items must have an ID.");
//             }
//         }
//         catch (JsonException)
//         {
//             return new ValidationResult("ContentItems is not valid JSON.");
//         }

//         return ValidationResult.Success;
//     }
// }