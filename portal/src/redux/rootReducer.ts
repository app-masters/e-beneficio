import { combineReducers } from 'redux';

// Reducers
import familyReducer from './family/reducers';
import consumptionReducer from './consumption/reducers';

const rootReducer = combineReducers({
  familyReducer,
  consumptionReducer
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
