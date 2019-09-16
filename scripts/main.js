window.cl = console.log;

((redux, immutable, reduxThunk) => {


	const
		{ createStore, combineReducers, applyMiddleware, compose } = redux,
		{ Map, List } = immutable,
		composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
			window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 }) || compose,
		cl = console.log,
		actionLog = [],
		wait3 = () => new Promise(res => setTimeout(res, 3000)),
		logger = store => thunkedDispatch => action => {
			cl('Dispatching Action:', action);
			actionLog.push(action);
			let result = thunkedDispatch(action);
			cl('Action Done');
			return result;
		},
		errorMonitor = store => thunkedDispatch => action => {
			try {
				return thunkedDispatch(action);
			} catch (e) {
				cl('Caught Exception for action: ', action);
				throw e;
			}
		},
		promiseSupport = store => thunkedDispatch => action => {
			if (action.constructor === Promise) {
				return action.then(thunkedDispatch);
			} else {
				return thunkedDispatch(action);
			}
		},
		middlewareCollection = [ reduxThunk, logger, promiseSupport ];

	let
		initialStates = {
			Battle: Map({
				chars: List(),
				charTurn: 0, // Current Char's index
				round: 0,
				charConditions: List(), // Objects that contain expiry, label, char, modifications
				aggroMap: List() // Char indices?
			})
		},
		buildReducer = (actionMap, initialState) =>
			(state = initialState, action) => actionMap[action.type] ? actionMap[action.type](state, action) : state,

		pushIn = (root, path, value) => root.setIn([...path, root.getIn(path).size], value),
		actionMap = {
			Battle: {
				'START_BATTLE': (state, action) => state
					.set('charTurn', 0)
					.set('round', 0)
					.set('charConditions', List())
					.set('allChars', List(action.allChars)),
				'PASS_TURN': (state, action) => state,
				'ADD_COND': (state, action) => state,
				'DAMAGE': (state, action) => state,
			}
		},
		store = createStore(combineReducers({
			Battle: buildReducer(actionMap.Battle, initialStates.Battle)
		}), initialStates, composeEnhancers(applyMiddleware(...middlewareCollection))),
		WarLogger = {
			trigger: action => store.dispatch(action),
			subscribe: handler => store.subscribe(handler),
			getBattleState: () => store.getState().Battle
		};

	store.subscribe(() => cl('STATE CHANGED', store.getState()));

	window.WarLogger = WarLogger;

	window.printLog = () => actionLog.forEach(i => cl(i));


})(window.Redux, window.Immutable, window.ReduxThunk.default)



// "Done is always better than perfect, after all."