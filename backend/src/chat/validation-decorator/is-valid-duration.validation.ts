import { Logger } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { DURATION_UNIT, RestrictedUsersDto } from '../dto/chatroom.dto';
import { RESTRICTION } from '@prisma/client';
import {
  BAN_MAX_DAYS,
  KICK_MAX_DAYS,
  KICK_MAX_HOURS,
  MUTE_MAX_DAYS,
  MUTE_MAX_HOURS,
  MUTE_MAX_MIN,
} from '../../../../shared/restriction.constant';

@ValidatorConstraint({ name: 'isValidRestriction', async: false })
export class isValidDurationConstraint implements ValidatorConstraintInterface {
  private readonly logger = new Logger(isValidDurationConstraint.name);
  private response: string;

  private setResponse(response: string): boolean {
    this.response = response;
    return false;
  }

  validate(value: any, args: ValidationArguments): boolean {
    const { restriction, duration, durationUnit } =
      args.object as RestrictedUsersDto;

    if (restriction === RESTRICTION.MUTED) {
      if (durationUnit === DURATION_UNIT.MINUTES && duration > MUTE_MAX_MIN)
        return this.setResponse(
          `Can't mute a user more than ${MUTE_MAX_MIN} min`,
        );
      else if (durationUnit === DURATION_UNIT.HOUR && duration > MUTE_MAX_HOURS)
        return this.setResponse(
          `Can't mute a user more than ${MUTE_MAX_HOURS} hours`,
        );
      else if (durationUnit === DURATION_UNIT.DAY && duration > MUTE_MAX_DAYS)
        return this.setResponse(
          `Can't mute a user more than ${MUTE_MAX_DAYS} days`,
        );
    } else if (restriction === RESTRICTION.KICKED) {
      if (durationUnit === DURATION_UNIT.MINUTES && duration > KICK_MAX_DAYS)
        return this.setResponse(
          `Can't kick a user more than ${KICK_MAX_DAYS} min`,
        );
      else if (durationUnit === DURATION_UNIT.HOUR && duration > KICK_MAX_HOURS)
        return this.setResponse(
          `Can't kick a user more than ${KICK_MAX_HOURS} hours`,
        );
      else if (durationUnit === DURATION_UNIT.DAY && duration > MUTE_MAX_DAYS)
        return this.setResponse(
          `Can't kick a user more than ${MUTE_MAX_DAYS} days`,
        );
    } else if (restriction === RESTRICTION.BANNED) {
      if (
        durationUnit === DURATION_UNIT.DAY &&
        duration > BAN_MAX_DAYS &&
        duration !== Number.MAX_SAFE_INTEGER
      )
        return this.setResponse(
          `Can't ban a user more than ${BAN_MAX_DAYS} days`,
        );
      else if (durationUnit !== DURATION_UNIT.DAY)
        return this.setResponse('Can only ban user in days unit');
    }
    return true;
  }

  defaultMessage(): string {
    return this.response;
  }
}

export function isValidDuration(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidDuration',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: isValidDurationConstraint,
    });
  };
}
