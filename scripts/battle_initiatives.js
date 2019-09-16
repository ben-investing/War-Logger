
((WarLogger) => {

	const dieRollRE = /^(\d*)d(\d+)$/,
		rollDie = (sides) => Math.floor(Math.random()*sides) + 1,
		wrapIfAny = str => str ? ` (${str})` : '';

	function rollDice(str) {
		let [, rolls, sides ] = dieRollRE.exec(str) || [];
		if (rolls) {
			return _.reduce(Array(+rolls), acc => acc + rollDie(sides), 0);
		} else {
			return '';
		}
	}

	let
		initiativeRow = _.template('<div class="initiative-row"><%=name%><input type="text" value="<%=val%>" class="reg-input right-f"></div>'),
		$wrapper = $('.setup-battle'),
		$setInitsWrapper = $wrapper.f('.set-initiatives-wrapper'),
		$setInits = $setInitsWrapper.f('.set-initiatives'),
		$commenceBattle = $setInitsWrapper.f('.commence-battle'),
		inputMap, fullList,
		renderBattleList = () => _.each(fullList, (charObj, i) => {
			let $inputRow = $(initiativeRow({
				name: charObj.name + wrapIfAny(charObj.initiative),
				val: rollDice(charObj.initiative)
			}));
			$setInits.append($inputRow);
			inputMap[i] = $inputRow.f('input');
		});

	$commenceBattle.on('click', () => {
		$wrapper.hide();
		_.each(inputMap, ($input, i) => {
			fullList[i].rolledInitiative = $input.val();
			fullList[i].rolledHP = +(rollDice(fullList[i].hp) || fullList[i].hp);
		});
		WarLogger.commenceBattle(fullList.sort((a, b) => b.rolledInitiative - a.rolledInitiative));
	})

	WarLogger.goToInitiatives = (chars, npcs) => {
		$setInitsWrapper.show();
		inputMap = [];
		$setInits.empty();
		fullList = chars.concat(npcs);
		renderBattleList();
	}

})(window.WarLogger);
