import { Control, ControllerFieldState, ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { FormItem, FormLabel, FormMessage, FormField as OriginalFormField } from './form';

interface ComposableFormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  Input?: React.ComponentType<any>;
  renderedInput?: (props: {
    field: ControllerRenderProps<FieldValues, Path<T>>;
    fieldState: ControllerFieldState;
  }) => React.ReactNode;
  placeholder?: string;
}



export const ComposableFormField = <T extends FieldValues>({
  name,
  label,
  Input,
  placeholder,
  renderedInput,
}: ComposableFormFieldProps<T>) => {
  return (
    <OriginalFormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {Input && <Input {...field} {...fieldState} placeholder={placeholder ?? label} />}
          {renderedInput && renderedInput({ field, fieldState })}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
