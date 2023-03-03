import {
  buildMessage,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const FULL_FORMAT_REGEX = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
const YEAR_REGEX = /^\d{4}$/;
const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * 날짜 형식(YYYY-MM-DD) 문자열 검증
 */
export const IsDateOnlyString = (
  dateOption: {allowEmptyString?: boolean; format?: 'full' | 'year' | 'yearmonth'} = {
    allowEmptyString: false,
    format: 'full',
  },
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

          if (dateOption?.format == 'year') return YEAR_REGEX.test(value);
          else if (dateOption?.format == 'yearmonth') return YEAR_MONTH_REGEX.test(value);
          else return FULL_FORMAT_REGEX.test(value);
        },
        defaultMessage: buildMessage((eachPrefix) => {
          let message = eachPrefix;
          if (dateOption?.format == 'year') {
            message += '$property allow only date format(YYYY)';
          } else if (dateOption?.format == 'yearmonth') {
            message += '$property allow only date format(YYYY-MM)';
          } else {
            message += '$property allow only date format(YYYY-MM-DD)';
          }
          if (dateOption?.allowEmptyString) message += ' or empty string';
          return message;
        }, validationOption),
      },
    });
  };
};
