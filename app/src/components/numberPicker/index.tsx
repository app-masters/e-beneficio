import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
import { ActionWrapper, ActionButton } from './styles';

export type NumberPickerProps = {
  value: number;
  maxValue?: number;
  onChange?: (value: number) => void;
};

/**
 * Resource selector component
 * @param props component props
 */
export const NumberPicker: React.FC<NumberPickerProps> = ({ maxValue, value, onChange }) => {
  // Whenever a + or - button is clicked, send the updated value to the onChange event
  const handleChangeAmount = useCallback(
    (value: number) => {
      if (onChange) {
        if (maxValue) onChange(value <= maxValue ? value : maxValue);
        else onChange(value);
      }
    },
    [onChange, maxValue]
  );

  return (
    <ActionWrapper>
      <ActionButton disabled={value === 0} onClick={() => handleChangeAmount(value - 1)}>
        <MinusOutlined />
      </ActionButton>
      {value}
      <ActionButton
        disabled={maxValue === 0 || maxValue ? maxValue === value : false}
        onClick={() => handleChangeAmount(value + 1)}
      >
        <PlusOutlined />
      </ActionButton>
    </ActionWrapper>
  );
};
