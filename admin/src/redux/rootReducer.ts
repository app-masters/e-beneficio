import { combineReducers, AnyAction, CombinedState } from 'redux';

// Reducers
import authReducer, { AuthReducerState } from './auth/reducers';
import entityReducer, { EntityReducerState } from './entity/reducers';
import benefitReducer, { BenefitReducerState } from './benefit/reducers';
import institutionReducer, { InstitutionReducerState } from './institution/reducers';
import localityReducer, { LocalityReducerState } from './locality/reducers';
import userReducer, { UserReducerState } from './user/reducers';
import familiesReducer, { FamilyReducerState } from './families/reducers';
import reportReducer, { ReportReducerState } from './report/reducers';
import dashboardReducer, { DashboardReducerState } from './dashboard/reducers';
import consumptionReducer, { ConsumptionReducerState } from './consumption/reducers';
import productReducer, { ProductReducerState } from './product/reducers';

type TypeReducers = {
  authReducer: AuthReducerState;
  entityReducer: EntityReducerState;
  benefitReducer: BenefitReducerState;
  institutionReducer: InstitutionReducerState;
  localityReducer: LocalityReducerState;
  userReducer: UserReducerState;
  familiesReducer: FamilyReducerState;
  reportReducer: ReportReducerState;
  dashboardReducer: DashboardReducerState;
  consumptionReducer: ConsumptionReducerState;
  productReducer: ProductReducerState;
};

const appReducer = combineReducers({
  authReducer,
  entityReducer,
  benefitReducer,
  institutionReducer,
  localityReducer,
  userReducer,
  familiesReducer,
  reportReducer,
  dashboardReducer,
  consumptionReducer,
  productReducer
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
