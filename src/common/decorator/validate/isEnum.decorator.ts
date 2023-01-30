import {
  buildMessage,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * enum 검증
 */
export const IsEnum = (
  entity: Object,
  decoratorOption: {allowEmptyString?: boolean} = {allowEmptyString: false},
  validationOption?: ValidationOptions
) => {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsEnum',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOption,
      validator: {
        validate(value: unknown, validationArguments?: ValidationArguments): boolean {
          if (value === undefined) return false;
          if (decoratorOption?.allowEmptyString && value == '') return true;

          const enumValues = Object.keys(entity).map((k) => entity[k]);

          return enumValues.includes(value);
        },
        defaultMessage: buildMessage((eachPrefix) => {
          const validEnumValues = Object.entries(entity)
            .filter(([key, value]) => isNaN(parseInt(key)))
            .map(([key, value]) => value as string);

          let message = eachPrefix;
          message += decoratorOption?.allowEmptyString
            ? `$property allow empty string or one of the following values: ${validEnumValues}`
            : `$property must be one of the following values: ${validEnumValues}`;

          return message;
        }, validationOption),
      },
    });
  };
};
