import React, { useCallback } from 'react';
import { Input } from 'antd';

export type InputFormatterProps = React.ComponentProps<typeof Input> & {
  setValue?: (value: string) => void;
  formatter?: (value: string) => string;
  parser?: (value: string) => string;
};

/**
 * An input with a cnpj formatter
 */
export const InputFormatter: React.FC<InputFormatterProps> = ({ setValue, formatter, parser, onChange, ...props }) => {
  /**
   * Handle onChange event in the input
   */
  const handleChangeValue = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (setValue) {
        const value = formatter ? formatter(event.target.value) : event.target.value;
        setValue(parser ? parser(value) : value);
      } else if (onChange) {
        onChange(event);
      }
    },
    [formatter, parser, onChange, setValue]
  );

  return <Input {...props} onChange={handleChangeValue} />;
};
