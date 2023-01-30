import {
  buildMessage,
  isInt,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * int 검증
 */
export const IsInt = (
  decoratorOption: {allowEmptyString?: boolean} = {allowEmptyString: false},
  validationOption?: ValidationOptions
) => {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsInt',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOption,
      validator: {
        validate(value: string, validationArguments?: ValidationArguments): boolean {
          if (decoratorOption?.allowEmptyString && value == '') return true;
          return isInt(value);
        },
        defaultMessage: buildMessage((eachPrefix) => {
          let message = eachPrefix + '$property allow only integer number';
          if (decoratorOption?.allowEmptyString) message += ' or empty string';
          return message;
        }, validationOption),
      },
    });
  };
};
