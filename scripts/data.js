
(() => {
	let
		getObjFromLs = key => {
			let res = localStorage.getItem(key);
			return res ? JSON.parse(res) : null;
		},
		data = getObjFromLs('data') || {
			conditions: [],
			chars: [],
			npcs: [],
			spawns: [],
			log: []
		},
		getDataJSON = () => JSON.stringify(data),
		saveToLS = (customJSON) => localStorage.setItem('data', customJSON || getDataJSON()),
		renderList = () => window.WarLogger.dispatch('INIT_LIB', data.chars, data.npcs),
		reducers = {};

	window.WarLogger = {
		defineAction: (actionLabel, reducer) => reducers[actionLabel] = reducer,
		reducers,
		data: {
			getDataJSON,
			loadDataJSON: (dataJSON) => {
				saveToLS(dataJSON);
				data = JSON.parse(dataJSON);
				renderList();
			},
			renderList,
			getSpawns: () => data.spawns || [],
			getChar: (index, isNPC) => (isNPC ? data.npcs : data.chars)[index],
			addChar: charObj => {
				data.chars.push(charObj);
				saveToLS();
				renderList();
			},
			addNPC: npcObj => {
				data.npcs.push(npcObj);
				saveToLS();
				renderList();
			},
			deleteChar: (index, isNPC) => {
				(isNPC ? data.npcs : data.chars).splice(index, 1);
				saveToLS();
				renderList();
			},
			addSpawn: spawnObj => {
				data.spawns.push(spawnObj);
				saveToLS();
			},
			deleteSpawn: spawnId => {
				data.spawns.splice(spawnId, 1);
				saveToLS();
			},
			getConditions: () => data.conditions || [],
			saveConditions: conditions => {
				data.conditions = conditions;
				saveToLS();
			},
			saveNewLogEntry: entry => {
				data.log.push(entry);
				saveToLS();
			}
		}
	}
})();