import {
  buildMessage,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const DATE_ONLY_REGEX = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;

/**
 * 날짜 형식(YYYY-MM-DD) 문자열 검증
 */
export const IsDateOnlyString = (
  dateOption: {allowEmptyString?: boolean} = {allowEmptyString: false},
  validationOption?: ValidationOptions
) => {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsDateOnlyString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOption,
      validator: {
        validate(value: string, validationArguments?: ValidationArguments): boolean {
          if (dateOption?.allowEmptyString && value == '') return true;
          return DATE_ONLY_REGEX.test(value);
        },
        defaultMessage: buildMessage((eachPrefix) => {
          let message = eachPrefix + '$property allow only date format(YYYY-MM-DD)';
          if (dateOption?.allowEmptyString) message += ' or empty string';
          return message;
        }, validationOption),
      },
    });
  };
};
