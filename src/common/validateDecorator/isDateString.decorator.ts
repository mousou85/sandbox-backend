import {
  buildMessage,
  isISO8601,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import ValidatorJS from 'validator';

interface IDateOption extends ValidatorJS.IsISO8601Options {
  allowEmptyString?: boolean;
}

/**
 * 날짜/시간(YYYY-MM-DD HH:mm:ss) 형식 문자열 검증
 */
export const IsDateString = (
  dateOption: IDateOption = {allowEmptyString: false},
  validationOption?: ValidationOptions
) => {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsDateString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOption,
      validator: {
        validate(value: string, validationArguments?: ValidationArguments): boolean {
          if (dateOption?.allowEmptyString && value == '') return true;
          return isISO8601(value, dateOption);
        },
        defaultMessage: buildMessage((eachPrefix) => {
          let message = eachPrefix + '$property must be a valid ISO 8601 date string';
          if (dateOption?.allowEmptyString) message += ' or empty string';
          return message;
        }, validationOption),
      },
    });
  };
};
