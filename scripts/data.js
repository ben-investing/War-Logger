
((WarLogger) => {
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
		renderList = () => WarLogger.renderCharList(data.chars, data.npcs);

	WarLogger.data = {
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
		},
		clearChars: () => {
			data.chars.length = 0;
			updateLS();
			renderList();
		},
		clearNPCs: () => {
			data.npcs.length = 0;
			updateLS();
			renderList();
		},
	}
})(window.WarLogger);