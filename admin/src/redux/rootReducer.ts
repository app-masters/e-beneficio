import { combineReducers, AnyAction, CombinedState } from 'redux';

// Reducers
import authReducer, { AuthReducerState } from './auth/reducers';
import placeReducer, { PlaceReducerState } from './place/reducers';
import benefitReducer, { BenefitReducerState } from './benefit/reducers';
import institutionReducer, { InstitutionReducerState } from './institution/reducers';
import placeStoreReducer, { PlaceStoreReducerState } from './placeStore/reducers';
import userReducer, { UserReducerState } from './user/reducers';
import familiesReducer, { FamilyReducerState } from './families/reducers';
import reportReducer, { ReportReducerState } from './report/reducers';
import dashboardReducer, { DashboardReducerState } from './dashboard/reducers';
import consumptionReducer, { ConsumptionReducerState } from './consumption/reducers';
import productReducer, { ProductReducerState } from './product/reducers';
import groupReducer, { GroupReducerState } from './group/reducers';

type TypeReducers = {
  authReducer: AuthReducerState;
  placeReducer: PlaceReducerState;
  benefitReducer: BenefitReducerState;
  institutionReducer: InstitutionReducerState;
  placeStoreReducer: PlaceStoreReducerState;
  userReducer: UserReducerState;
  familiesReducer: FamilyReducerState;
  reportReducer: ReportReducerState;
  dashboardReducer: DashboardReducerState;
  consumptionReducer: ConsumptionReducerState;
  productReducer: ProductReducerState;
  groupReducer: GroupReducerState;
};

const appReducer = combineReducers({
  authReducer,
  placeReducer,
  benefitReducer,
  institutionReducer,
  placeStoreReducer,
  userReducer,
  familiesReducer,
  reportReducer,
  dashboardReducer,
  consumptionReducer,
  productReducer,
  groupReducer
});

/**
 * Base Redux application component
 */
const rootReducer = (state: CombinedState<TypeReducers> | undefined, action: AnyAction) => {
  console.log(action);
  if (action.type === 'auth/USER_LOGOUT') {
    state = undefined;
  }
  return appReducer(state, action);
};

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
