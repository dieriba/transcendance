import { RESTRICTION } from '@prisma/client';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class IsRightChatTypesConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    if (Object.values(RESTRICTION).includes(value)) return true;

    return false;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    console.log(validationArguments);
    return 'Chat type can either be BAN,KICK OR MUTED';
  }
}

export function isRightRestrictionTypes(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRightChatTypesConstraint,
    });
  };
}
