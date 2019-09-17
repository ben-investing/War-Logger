
((WarLogger) => {

	const getNextAble = (allChars, currentChar) => {
		let	roundLength = allChars.size,
			nextCharRes = -1, newRound = false;
		while (!~nextCharRes) {
			let nextChar;
			if (++currentChar === roundLength) {
				newRound = true;
				currentChar = 0;
			}
			nextChar = allChars.get(currentChar);
			if (nextChar.currentHP /* and !conditions */) {
				nextCharRes = currentChar;
			}
		}
		return { next: nextCharRes, newRound };
	};

	let
		$wrapper = $('.battle-actions'),
		$attackSelect = $wrapper.f('.battle-actions-attack-select'),
		$attackDamage = $wrapper.f('.battle-actions-attack-damage'),
		$attackSubmit = $wrapper.f('.battle-actions-attack-submit'),
		$damageSelect = $wrapper.f('.battle-actions-damage-select'),
		$damageDamage = $wrapper.f('.battle-actions-damage-damage'),
		$damageSubmit = $wrapper.f('.battle-actions-damage-submit');

	$attackSubmit.on('click', () => {
		let attackeeId = $attackSelect.val(),
			damage = $attackDamage.val();

		WarLogger
			.dispatch('damage', attackeeId, damage)
			.dispatch('passTurn')
			.dispatch('redrawBattle');
	});

	$damageSubmit.on('click', () => {
		let attackeeId = $damageSelect.val(),
			damage = $damageDamage.val();

		WarLogger
			.dispatch('damage', attackeeId, damage, true)
			.dispatch('redrawBattle');
	})

	WarLogger.defineAction('passTurn', (state) => {
		let allChars = state.get('allChars'),
			round = state.get('round'),
			newCurrentsAggro,
			{ next, newRound } = getNextAble(allChars, state.get('currentChar'));

		newCurrentsAggro = allChars.get(next).aggro;
		newCurrentsAggro && $attackSelect.f(`option:contains("${newCurrentsAggro}")`).prop('selected', true);

		return state
			.set('currentChar', next)
			.set('round', newRound ? round + 1 : round);
	});

	WarLogger.defineAction('initializeBattleActions', (state) => {
		$attackSelect.empty();
		_.e([...state.get('allChars')], (charObj, i) => {
			let $option = $('<option>').val(i).html(charObj.name);
			$attackSelect.append($option);
			$damageSelect.append($option.clone());
		});
		return state;
	});

	WarLogger.defineAction('damage', (state, attackeeId, damage, skipAggro) => {
		let allChars = state.get('allChars'),
			attackerId = state.get('currentChar'),
			attackee = allChars.get(attackeeId),
			attacker = allChars.get(attackerId);

		attackee.currentHP = Math.max(attackee.currentHP - damage, 0);
		if (!skipAggro) {
			attacker.aggro = attackee.name;
		}

		return state;
	});

})(window.WarLogger);
