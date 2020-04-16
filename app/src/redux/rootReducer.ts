import { combineReducers } from 'redux';

// Reducers
import authReducer from './auth/reducers';
import consumptionReducer from './consumption/reducers';
import familyReducer from './family/reducers';
import userReducer from './user/reducers';
import placeStoreReducer from './placeStore/reducers';
import placeReducer from './place/reducers';
import dashboardReducer from './dashboard/reducers';

const rootReducer = combineReducers({
  authReducer,
  consumptionReducer,
  familyReducer,
  userReducer,
  placeStoreReducer,
  placeReducer,
  dashboardReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
