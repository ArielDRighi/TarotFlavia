import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

/**
 * Validador que asegura que al menos uno de los campos especificados esté presente
 */
@ValidatorConstraint({ name: 'requireOneOf', async: false })
export class RequireOneOfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>;
    const [fields] = args.constraints as [string[]];

    // Al menos uno de los campos debe tener valor
    return fields.some((field) => {
      const fieldValue = object[field];
      return (
        fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
      );
    });
  }

  defaultMessage(args: ValidationArguments): string {
    const [fields] = args.constraints as [string[]];
    return `Debes proporcionar al menos uno de los siguientes campos: ${fields.join(', ')}`;
  }
}

/**
 * Decorador que valida que al menos uno de los campos especificados esté presente
 */
export function RequireOneOf(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'requireOneOf',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [fields],
      validator: RequireOneOfConstraint,
    });
  };
}
