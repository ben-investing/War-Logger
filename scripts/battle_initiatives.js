
((WarLogger) => {

	const dieRollRE = /^(\d*)d(\d+)(\s*\+\s*(\d+))?$/,
		numericRE = /^\d+$/,
		rollDie = (sides) => Math.floor(Math.random()*sides) + 1,
		wrapIfAny = str => str ? ` (${str})` : '';

	function rollDice(str) {
		let [, rolls, sides,, staticAdd ] = dieRollRE.exec(str) || [];
		if (rolls) {
			return _.reduce(Array(+rolls), acc => acc + rollDie(sides), 0) + (+staticAdd || 0);
		} else {
			return numericRE.exec(str) ? +str : '';
		}
	}

	let
		initiativeRow = _.template('<tr><td><%=name%></td><td><input type="text" value="<%=initiative%>" class="reg-input small" data-name="initiative"></td><td><input type="text" value="<%=hp%>" class="reg-input small" data-name="hp"></td></tr>'),
		$wrapper = $('.setup-battle'),
		$setInitsWrapper = $wrapper.f('.set-initiatives-wrapper'),
		$setInits = $setInitsWrapper.f('.set-initiatives tbody'),
		$commenceBattle = $setInitsWrapper.f('.commence-battle'),
		inputMap, fullList,
		renderBattleList = () => _.each(fullList, (charObj, i) => {
			let $inputRow = $(initiativeRow({
				name: charObj.name + wrapIfAny(charObj.initiative) + wrapIfAny(charObj.hp),
				initiative: rollDice(charObj.initiative),
				hp: rollDice(charObj.hp)
			}));
			$setInits.append($inputRow);
			inputMap[i] = { $initiative: $inputRow.f('input[data-name="initiative"]'), $hp: $inputRow.f('input[data-name="hp"]') };
		});

	$commenceBattle.on('click', () => {
		$wrapper.hide();
		_.each(inputMap, ({ $initiative, $hp }, i) => {
			fullList[i].rolledInitiative = $initiative.val();
			fullList[i].rolledHP = $hp.val();
			fullList[i].conditions = [];
		});
		WarLogger
			.dispatch('commenceBattle', fullList.sort((a, b) => b.rolledInitiative - a.rolledInitiative))
			.dispatch('initializeBattleActions');
	})

	WarLogger.defineAction('goToInitiatives', (state, chars, npcs) => {
		$setInitsWrapper.show();
		inputMap = [];
		$setInits.empty();
		fullList = chars.concat(npcs);
		renderBattleList();
		inputMap[0].$initiative.focus();
		return state.set('uiStage', 'ROLL_INITIATIVES');
	})

})(window.WarLogger);
