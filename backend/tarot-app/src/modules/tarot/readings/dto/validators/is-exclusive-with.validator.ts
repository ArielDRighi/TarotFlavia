import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador personalizado que asegura que exactamente uno de dos campos esté presente
 * Se usa para validar que se proporcione predefinedQuestionId O customQuestion, pero no ambos ni ninguno
 */
@ValidatorConstraint({ name: 'IsExclusiveWith', async: false })
export class IsExclusiveWithConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const relatedPropertyName = args.constraints[0] as string;
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ];

    // Exactamente uno debe estar presente
    const hasCurrentValue =
      value !== undefined && value !== null && value !== '';
    const hasRelatedValue =
      relatedValue !== undefined &&
      relatedValue !== null &&
      relatedValue !== '';

    // True si exactamente uno está presente (XOR)
    return hasCurrentValue !== hasRelatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const relatedPropertyName = args.constraints[0] as string;
    return `Debes proporcionar solo una: ${args.property} o ${relatedPropertyName}, no ambas`;
  }
}
