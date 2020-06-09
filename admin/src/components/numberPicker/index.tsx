import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
import { ActionWrapper, ActionButton } from './styles';

export type NumberPickerProps = {
  value: number;
  onChange?: (value: number) => void;
};

/**
 * Resource selector component
 * @param props component props
 */
export const NumberPicker: React.FC<NumberPickerProps> = ({ value, onChange }) => {
  // Whenever a + or - button is clicked, send the updated value to the onChange event
  const handleChangeAmount = useCallback(
    (value: number) => {
      if (onChange) {
        onChange(value);
      }
    },
    [onChange]
  );

  return (
    <ActionWrapper>
      <ActionButton disabled={value === 0} onClick={() => handleChangeAmount(value - 1)}>
        <MinusOutlined />
      </ActionButton>
      {value}
      <ActionButton onClick={() => handleChangeAmount(value + 1)}>
        <PlusOutlined />
      </ActionButton>
    </ActionWrapper>
  );
};
