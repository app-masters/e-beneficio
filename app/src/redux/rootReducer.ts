import { combineReducers, AnyAction, CombinedState } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import consumptionReducer from './consumption/reducers';
import familyReducer from './family/reducers';
import userReducer from './user/reducers';
import placeStoreReducer from './placeStore/reducers';
import placeReducer from './place/reducers';
import dashboardReducer from './dashboard/reducers';
import reportReducer from './report/reducers';

const appReducer = combineReducers({
  authReducer,
  consumptionReducer,
  familyReducer,
  userReducer,
  placeStoreReducer,
  placeReducer,
  dashboardReducer,
  reportReducer
});

/**
 * Base Redux application component
 */
const rootReducer = (state: CombinedState<any>, action: AnyAction) => {
  if (action.type === 'auth/USER_LOGOUT') {
    state = undefined;
  }
  return appReducer(state, action);
};

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
