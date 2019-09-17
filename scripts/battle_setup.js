
((WarLogger) => {

	function removeFromBattle(index, isNPC) {
		(isNPC ? npcsAdded : charsAdded).splice(index, 1);
		renderBattleAll();
	}

	let
		$wrapper = $('.pre-battle'),
		$charList = $wrapper.f('.char-list'),
		$startBattle = $wrapper.f('.start-battle'),
		charsAdded = [],
		npcsAdded = [],
		npcDuplicates = {},
		renderBattleList = (list, isNPC) => _.each(list, (charIndex, i) => {
			let duplicate = '';
			if (isNPC) {
				npcDuplicates[charIndex] = (npcDuplicates[charIndex] || 0) + 1;
				if (npcDuplicates[charIndex] > 1) {
					duplicate = npcDuplicates[charIndex];
				}
			}
			$charList.append($('<li>').addClass('clickable')
				.html(WarLogger.data.getChar(charIndex, isNPC).name + ' ' + duplicate)
				.on('click', () => removeFromBattle(i, isNPC)))
		}),
		renderBattleAll = () => {
			$charList.empty();
			npcDuplicates = {};
			renderBattleList(charsAdded, false);
			renderBattleList(npcsAdded, true);
		};

	$startBattle.on('click', () => {
		$wrapper.hide();
		npcDuplicates = {};
		WarLogger.dispatch('goToInitiatives',
			charsAdded.map(index => _.clone(WarLogger.data.getChar(index, false))),
			npcsAdded.map((charIndex, i) => {
				let npc = _.clone(WarLogger.data.getChar(charIndex, true)),
					hasMore = !!~npcsAdded.indexOf(charIndex, i+1);
				if (npcDuplicates[charIndex]) {
					npcDuplicates[charIndex]++;
				} else if (hasMore) {
					npcDuplicates[charIndex] = 1;
				}
				if (npcDuplicates[charIndex]) {
					npc.name += ' ' + npcDuplicates[charIndex];
				}
				return npc;
			})
		)
	})

	WarLogger.defineAction('addCharToBattle', (state, charIndex, isNPC) => {
		(isNPC ? npcsAdded : charsAdded).push(charIndex);
		renderBattleAll();
		return state;
	});

})(window.WarLogger);
