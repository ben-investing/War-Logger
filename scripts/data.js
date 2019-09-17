
(() => {
	let
		getObjFromLs = key => {
			let res = localStorage.getItem(key);
			return res ? JSON.parse(res) : null;
		},
		data = getObjFromLs('data') || {
			chars: [],
			npcs: []
		},
		updateLS = () => localStorage.setItem('data', JSON.stringify(data)),
		renderList = () => window.WarLogger.dispatch('INIT_LIB', data.chars, data.npcs),
		reducers = {};

	window.WarLogger = {
		defineAction: (actionLabel, reducer) => reducers[actionLabel] = reducer,
		reducers,
		data: {
			renderList,
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
			getChar: (index, isNPC) => (isNPC ? data.npcs : data.chars)[index],
			deleteChar: (index, isNPC) => {
				(isNPC ? data.npcs : data.chars).splice(index, 1);
				updateLS();
				renderList();
			}
		}
	}
})();