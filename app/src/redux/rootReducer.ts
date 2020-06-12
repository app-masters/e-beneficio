import { combineReducers, AnyAction, CombinedState } from 'redux';

// Reducers
import authReducer, { AuthReducerState } from './auth/reducers';
import consumptionReducer, { ConsumptionReducerState } from './consumption/reducers';
import familyReducer, { FamilyReducerState } from './family/reducers';
import userReducer, { UserReducerState } from './user/reducers';
import placeStoreReducer, { PlaceStoreReducerState } from './placeStore/reducers';
import placeReducer, { PlaceReducerState } from './place/reducers';
import dashboardReducer, { DashboardReducerState } from './dashboard/reducers';
import reportReducer, { ReportReducerState } from './report/reducers';
import groupReducer, { GroupReducerState } from './group/reducers';

type TypeReducers = {
  authReducer: AuthReducerState;
  consumptionReducer: ConsumptionReducerState;
  familyReducer: FamilyReducerState;
  userReducer: UserReducerState;
  placeStoreReducer: PlaceStoreReducerState;
  placeReducer: PlaceReducerState;
  dashboardReducer: DashboardReducerState;
  reportReducer: ReportReducerState;
  groupReducer: GroupReducerState;
};

const appReducer = combineReducers({
  authReducer,
  consumptionReducer,
  familyReducer,
  userReducer,
  placeStoreReducer,
  placeReducer,
  dashboardReducer,
  reportReducer,
  groupReducer
});

/**
 * Base Redux application component
 */
const rootReducer = (state: CombinedState<TypeReducers> | undefined, action: AnyAction) => {
  if (action.type === 'auth/USER_LOGOUT') {
    state = undefined;
  }
  return appReducer(state, action);
};

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
