using System;
using System.ComponentModel.DataAnnotations;

public class OptionalUrlAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
            return ValidationResult.Success;

        string str = value.ToString()!;

        if (Uri.TryCreate(str, UriKind.Absolute, out var uriResult) &&
            (uriResult.Scheme == Uri.UriSchemeHttp ||
             uriResult.Scheme == Uri.UriSchemeHttps ||
             uriResult.Scheme == Uri.UriSchemeFtp))
        {
            return ValidationResult.Success;
        }

        string displayName = validationContext?.DisplayName ?? "Field";
        return new ValidationResult($"The {displayName} field is not a valid URL.");
    }
}
