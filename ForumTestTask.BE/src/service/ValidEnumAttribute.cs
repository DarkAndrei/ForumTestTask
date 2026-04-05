using System.ComponentModel.DataAnnotations;

public class ValidEnumAttribute : ValidationAttribute
{
    private readonly Type _enumType;

    public ValidEnumAttribute(Type enumType)
    {
        _enumType = enumType;
    }

    public override bool IsValid(object? value)
    {
        if (value == null) return false;
        return Enum.IsDefined(_enumType, value);
    }
}
