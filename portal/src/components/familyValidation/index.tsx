import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { Family } from '../../interfaces/family';
import { StepNIS, StepBirthDay, StepConfirmFamily } from './steps';

type ComponentProps = {
  onFamilySelect?: (id: Family['id']) => void;
  askForBirthday?: boolean;
};

/**
 * Family search component
 * @param props component props
 */
export const FamilySearch: React.FC<ComponentProps> = (props) => {
  // Local state
  const [currentStep, changeStep] = useState<number>(0);

  // Redux state
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);

  React.useEffect(() => {
    changeStep(family ? 1 : 0);
  }, [family]);

  /**
   * Use callback on the change of the familyId
   * @param id family unique ID
   */
  const changeFamilyId = (id: Family['id']) => {
    if (props.onFamilySelect) {
      props.onFamilySelect(id);
    }
  };

  return (
    <>
      {currentStep === 0 && <StepNIS />}
      {currentStep === 1 && <StepBirthDay family={family} onValidBirthday={() => changeStep(2)} />}
      {currentStep === 2 && (
        <StepConfirmFamily
          family={family}
          onConfirm={() => {
            changeStep(3);
            changeFamilyId(family?.id);
          }}
          onCancel={() => {
            changeStep(0);
            changeFamilyId(undefined);
          }}
        />
      )}
      {/* {currentStep === 3 && <StepSelectedFamily family={family} />} */}
    </>
  );
};
