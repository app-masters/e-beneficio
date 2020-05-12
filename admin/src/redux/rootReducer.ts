import { combineReducers, AnyAction, CombinedState } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import placeReducer from './place/reducers';
import benefitReducer from './benefit/reducers';
import institutionReducer from './institution/reducers';
import placeStoreReducer from './placeStore/reducers';
import userReducer from './user/reducers';
import familiesReducer from './families/reducers';
import reportReducer from './report/reducers';
import dashboardReducer from './dashboard/reducers';

const appReducer = combineReducers({
  authReducer,
  placeReducer,
  benefitReducer,
  institutionReducer,
  placeStoreReducer,
  userReducer,
  familiesReducer,
  reportReducer,
  dashboardReducer
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
