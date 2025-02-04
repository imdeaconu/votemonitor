import { FC } from 'react';
import { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { FormItem, FormLabel, FormMessage, FormField as OriginalFormField } from './form';

interface ComposableFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends ControllerProps<TFieldValues, TName> {
  label: string;
  Input: React.ComponentType<any>;
  placeholder?: string;
}

export const ComposableFormField: FC<ComposableFormFieldProps> = ({ label, name, Input, placeholder }) => {
  return (
    <OriginalFormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Input {...field} {...fieldState} placeholder={placeholder ?? label} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
