
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
			logs: []
		},
		updateLS = () => localStorage.setItem('data', JSON.stringify(data)),
		renderList = () => window.WarLogger.dispatch('INIT_LIB', data.chars, data.npcs),
		reducers = {};

	window.WarLogger = {
		defineAction: (actionLabel, reducer) => reducers[actionLabel] = reducer,
		reducers,
		data: {
			getSpawns: () => data.spawns || [],
			renderList,
			getChar: (index, isNPC) => (isNPC ? data.npcs : data.chars)[index],
			addChar: charObj => {
				data.chars.push(charObj);
				updateLS();
				renderList();
			},
			addNPC: npcObj => {
				data.npcs.push(npcObj);
				updateLS();
				renderList();
			},
			deleteChar: (index, isNPC) => {
				(isNPC ? data.npcs : data.chars).splice(index, 1);
				updateLS();
				renderList();
			},
			addSpawn: spawnObj => {
				data.spawns.push(spawnObj);
				updateLS();
			},
			deleteSpawn: spawnId => {
				data.spawns.splice(spawnId, 1);
				updateLS();
			},
			getConditions: () => data.conditions || [],
			saveConditions: conditions => {
				data.conditions = conditions;
				updateLS();
			},
			saveNewLogEntry: entry => {
				data.log.push(entry);
				updateLS();
			}
		}
	}
})();