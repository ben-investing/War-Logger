
((WarLogger) => {

	let
		$wrapper = $('.battle-actions'),
		$attackSelect = $wrapper.f('.battle-actions-attack-select'),
		$damage = $wrapper.f('.battle-actions-attack-damage'),
		$attackSubmit = $wrapper.f('.battle-actions-attack-submit');

		// Consider exporting the Battle actionMap, having each component
		// add his own handlers for diff actions

	$attackSubmit.on('click', () => {
		let state = WarLogger.getBattleState(),
			allChars = state.get('allChars'),
			attackerId = state.get('charTurn'),
			attackeeId = $attackSelect.val(),
			attackee = allChars.get(attackeeId),
			damage = $damage.val();

		attackee.currentHP -= damage;

		cl('Final state', WarLogger.getBattleState());
		WarLogger.redrawBattleList();
	})

	WarLogger.setLastAggro = (charIndex) => {
		$attackSelect.val(charIndex);
	}

	WarLogger.initializeActions = (allChars) => {
		$attackSelect.empty();
		_.each(allChars, (charObj, i) => $attackSelect.append($('<option>').val(i).html(charObj.name)));
	}

})(window.WarLogger);
