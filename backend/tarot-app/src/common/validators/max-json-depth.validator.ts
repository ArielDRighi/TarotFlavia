import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that a JSON object doesn't exceed a maximum nesting depth
 * This prevents DoS attacks with deeply nested objects
 */
@ValidatorConstraint({ async: false })
export class MaxJsonDepthConstraint implements ValidatorConstraintInterface {
  private getDepth(obj: unknown, currentDepth = 0): number {
    if (obj === null || typeof obj !== 'object') {
      return currentDepth;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return currentDepth + 1;
      return Math.max(
        ...obj.map((item) => this.getDepth(item, currentDepth + 1)),
      );
    }

    const values = Object.values(obj);
    if (values.length === 0) return currentDepth + 1;

    return Math.max(
      ...values.map((value) => this.getDepth(value, currentDepth + 1)),
    );
  }

  validate(value: unknown, args: ValidationArguments): boolean {
    if (!value || typeof value !== 'object') {
      return true; // Not an object, no depth to validate
    }

    const maxDepth = (args.constraints[0] as number) || 10;
    const actualDepth = this.getDepth(value);

    return actualDepth <= maxDepth;
  }

  defaultMessage(args: ValidationArguments): string {
    const maxDepth = (args.constraints[0] as number) || 10;
    return `${args.property} must not have a nesting depth greater than ${maxDepth}`;
  }
}

/**
 * Decorator to validate maximum JSON nesting depth
 * @param maxDepth - Maximum allowed nesting depth (default: 10)
 * @param validationOptions - Additional validation options
 */
export function MaxJsonDepth(
  maxDepth = 10,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxDepth],
      validator: MaxJsonDepthConstraint,
    });
  };
}
