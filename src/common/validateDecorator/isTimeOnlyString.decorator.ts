import {
  buildMessage,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const TIME_ONLY_REGEX = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

/**
 * 시간 형식(HH:mm:ss) 문자열 검증
 */
export const IsTimeOnlyString = (
  dateOption: {allowEmptyString?: boolean} = {allowEmptyString: false},
  validationOption?: ValidationOptions
) => {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsTimeOnlyString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOption,
      validator: {
        validate(value: string, validationArguments?: ValidationArguments): boolean {
          if (dateOption?.allowEmptyString && value == '') return true;
          return TIME_ONLY_REGEX.test(value);
        },
        defaultMessage: buildMessage((eachPrefix) => {
          let message = eachPrefix + '$property allow only time format(HH:mm:ss)';
          if (dateOption?.allowEmptyString) message += ' or empty string';
          return message;
        }, validationOption),
      },
    });
  };
};
