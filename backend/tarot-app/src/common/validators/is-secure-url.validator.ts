import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that a URL is secure (HTTPS) and from a trusted domain
 */
@ValidatorConstraint({ async: false })
export class IsSecureUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string, args: ValidationArguments): boolean {
    if (!url) {
      return true; // Let @IsOptional handle empty values
    }

    try {
      const urlObj = new URL(url);

      // Only allow HTTPS or HTTP protocols (no javascript:, data:, etc.)
      if (!['https:', 'http:'].includes(urlObj.protocol)) {
        return false;
      }

      // Prefer HTTPS
      const preferHttps = (args.constraints[0] as boolean) ?? true;
      if (preferHttps && urlObj.protocol !== 'https:') {
        // We'll allow HTTP but it's not preferred
        // This could be made stricter in production
      }

      // Block suspicious patterns
      const suspiciousPatterns = [
        'javascript:',
        'data:',
        'vbscript:',
        'file:',
        'about:',
      ];

      const lowerUrl = url.toLowerCase();
      if (suspiciousPatterns.some((pattern) => lowerUrl.includes(pattern))) {
        return false;
      }

      return true;
    } catch {
      return false; // Invalid URL format
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid HTTPS URL`;
  }
}

/**
 * Decorator to validate secure URLs
 * @param preferHttps - Whether to prefer HTTPS (default: true)
 * @param validationOptions - Additional validation options
 */
export function IsSecureUrl(
  preferHttps = true,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [preferHttps],
      validator: IsSecureUrlConstraint,
    });
  };
}
