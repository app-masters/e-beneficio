import React from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Modal } from 'antd';
import { AppState } from '../../redux/rootReducer';
import { Place } from '../../interfaces/place';

/**
 * Dashboard page component
 * @param props component props
 */
export const PlaceForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';
  // Redux state
  // const place = useSelector<AppState, Place | undefined>((state) =>
  //   state.placeReducer.list.filter((item) => item.id === props.match.params.id)
  // );
  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/estabelecimentos')}
    ></Modal>
  );
};
