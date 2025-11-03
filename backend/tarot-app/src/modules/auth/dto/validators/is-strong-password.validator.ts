import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          // Mínimo 8 caracteres
          if (value.length < 8) {
            return false;
          }

          // Al menos una mayúscula
          if (!/[A-Z]/.test(value)) {
            return false;
          }

          // Al menos un número
          if (!/[0-9]/.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage() {
          return 'Password must be at least 8 characters long and contain at least one uppercase letter and one number';
        },
      },
    });
  };
}
