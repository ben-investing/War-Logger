window.cl = console.log;

((redux, immutable, reduxThunk, WarLogger) => {

	const
		{ createStore, combineReducers, applyMiddleware, compose } = redux,
		{ Map, List } = immutable,
		composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
			window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 }) || compose,
		cl = console.log,
		actionLog = [],
		wait3 = () => new Promise(res => setTimeout(res, 3000)),
		logger = store => thunkedDispatch => action => {
			cl(action);
			actionLog.push(action);
			return thunkedDispatch(action);
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
				uiStage: 'UNINITIALIZED',
				chars: List(),
				currentChar: 0,
				round: 0,
				charConditions: List(), // Objects that contain expiry, label, char, modifications
				aggroMap: List() // Char indices?
			})
		},
		buildReducer = (actionMap, initialState) =>
			(state = initialState, action) => actionMap[action.type] ? actionMap[action.type](state, ...action.args) : state,

		pushIn = (root, path, value) => root.setIn([...path, root.getIn(path).size], value),
		actionMap = {
			Battle: WarLogger.reducers
		},
		store = createStore(combineReducers({
			Battle: buildReducer(actionMap.Battle, initialStates.Battle)
		}), initialStates, composeEnhancers(applyMiddleware(...middlewareCollection))),
		printUIStage = () => cl('UI Stage -', store.getState().Battle.get('uiStage'));

	Object.assign(WarLogger, {
		dispatch: (type, ...args) => store.dispatch({ type, args }) && WarLogger,
		subscribe: handler => store.subscribe(handler),
		getBattleState: () => store.getState().Battle
	});

	store.subscribe(printUIStage);

	printUIStage();
	WarLogger.data.renderList();

})(window.Redux, window.Immutable, window.ReduxThunk.default, window.WarLogger)



// "Done is always better than perfect, after all."