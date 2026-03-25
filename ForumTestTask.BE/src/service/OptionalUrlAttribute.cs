using System;
using System.ComponentModel.DataAnnotations;

public class OptionalUrlAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
            return ValidationResult.Success;

        var str = value.ToString()!;

        if (!str.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
            !str.StartsWith("https://", StringComparison.OrdinalIgnoreCase) &&
            !str.StartsWith("ftp://", StringComparison.OrdinalIgnoreCase))
        {
            str = "http://" + str;
        }

        if (Uri.TryCreate(str, UriKind.Absolute, out var uriResult))
            return ValidationResult.Success;

        var displayName = validationContext?.DisplayName ?? "Field";
        return new ValidationResult($"The {displayName} field is not a valid URL.");
    }
}
