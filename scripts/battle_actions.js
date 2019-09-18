
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
	},
		getOptionByText = ($select, text, notDisabled) => $select.find(`option:contains("${text}")${notDisabled ? ':not([disabled])' : ''}`);

	let
		$wrapper = $('.battle-actions'),
		$passTurn = $wrapper.f('.battle-actions-pass-turn'),
		$attackSelect = $wrapper.f('.battle-actions-attack-select'),
		$attackDamage = $wrapper.f('.battle-actions-attack-damage'),
		$attackSubmit = $wrapper.f('.battle-actions-attack-submit'),
		$damageSelect = $wrapper.f('.battle-actions-damage-select'),
		$damageDamage = $wrapper.f('.battle-actions-damage-damage'),
		$damageSubmit = $wrapper.f('.battle-actions-damage-submit'),
		$healTarget = $wrapper.f('.battle-actions-heal-target'),
		$healAmount = $wrapper.f('.battle-actions-heal-amount'),
		$healType = $wrapper.f('.battle-actions-heal-type'),
		$healSubmit = $wrapper.f('.battle-actions-heal-submit'),
		$conditionTarget = $wrapper.f('.battle-actions-condition-target'),
		$conditionName = $wrapper.f('.battle-actions-condition-name'),
		$conditionDuration = $wrapper.f('.battle-actions-condition-duration'),
		$conditionSubmit = $wrapper.f('.battle-actions-condition-submit'),
		currentRound, currentChar,
		pendingActions = [],
		pendAction = (action, round, char, ...args) => pendingActions.push({ action, round, char, args }),
		actionReducers = {
			heal: (state, targetId, amount) => {
				let target = state.get('allChars').get(~targetId ? targetId : state.get('currentChar'));
				target.currentHP = Math.min(target.rolledHP, target.currentHP + amount);
				WarLogger.log(`${target.name} healed ${target.isNPC ? 'some' : amount} HP`);
				return state;
			},
			removeCondition: (state, name, targetId) => {
				let targetConditions = state.get('allChars').get(targetId).conditions;
				targetConditions.splice(targetConditions.indexOf(name), 1);
				return state;
			}
		},
		processPending = (state, currentRound, currentChar) => {
			let resultState = state;
			_.e(pendingActions, ({ action, round, char, args, done }, i) => {
				if (!done && round <= currentRound && char <= currentChar) {
					resultState = actionReducers[action](resultState, ...args);
					pendingActions[i].done = true;
				}
			})
			return resultState;
		};

	$attackSubmit.on('click', () => {
		let attackeeId = +$attackSelect.val(),
			damage = +$attackDamage.val();

		WarLogger
			.dispatch('damage', attackeeId, damage)
			.dispatch('passTurn')
			.dispatch('redrawBattle');
	});

	$damageSubmit.on('click', () => {
		let attackeeId = +$damageSelect.val(),
			damage = +$damageDamage.val();

		WarLogger
			.dispatch('damage', attackeeId, damage, true)
			.dispatch('redrawBattle');
	});

	$healSubmit.on('click', () => {
		let targetId = +$healTarget.val(),
			amount = +$healAmount.val(),
			type = +$healType.val();

		if (type) { // Kit
			// Add pending
			pendAction('heal', currentRound + 1, currentChar, !~targetId ? currentChar : targetId, amount);
			WarLogger
				.dispatch('passTurn')
				.dispatch('redrawBattle');
		} else {
			WarLogger
				.dispatch('heal', targetId, amount)
				.dispatch('passTurn')
				.dispatch('redrawBattle');
		}
	});

	$conditionSubmit.on('click', () => {
		let name = $conditionName.val(),
			target = +$conditionTarget.val(),
			duration = +$conditionDuration.val();

		WarLogger
			.dispatch('applyCondition', name, target, duration)
			.dispatch('redrawBattle');
	});

	$passTurn.on('click', () => {
		WarLogger
			.dispatch('passTurn')
			.dispatch('redrawBattle');
	});

	WarLogger.defineAction('initializeBattleActions', (state) => {
		$attackSelect.empty();
		_.e([...state.get('allChars')], (charObj, i) => {
			let $option = $('<option>').val(i).html(charObj.name);
			$attackSelect.append($option);
			$damageSelect.append($option.clone());
			$conditionTarget.append($option.clone());
		});
		return state;
	});

	WarLogger.defineAction('damage', (state, attackeeId, damage, skipAggro) => {
		let allChars = state.get('allChars'),
			attackerId = state.get('currentChar'),
			attackee = allChars.get(attackeeId),
			attacker = allChars.get(attackerId),
			collectedXP = state.get('collectedXP') || 0;

		attackee.currentHP = Math.max(attackee.currentHP - damage, 0);
		if (!skipAggro) {
			attacker.aggro = attackee.name;
		}
		if (!attackee.currentHP) { // He ded
			getOptionByText($attackSelect, attackee.name).disable();
			getOptionByText($damageSelect, attackee.name).disable();
			collectedXP += +attackee.xp;
		}

		WarLogger.log(`${attackee.name} took ${damage} damage${!attackee.currentHP ? ` and died! ${attackee.isNPC ? `(${attackee.xp} XP)` : ''}` : '' }`);
		return state.set('collectedXP', collectedXP);
	});

	WarLogger.defineAction('heal', actionReducers.heal);

	WarLogger.defineAction('applyCondition', (state, name, targetId, duration) => {
		let target = state.get('allChars').get(targetId);
		if (!target.conditions) {
			target.conditions = [];
		}
		WarLogger.log(`${target.name} is ${name}!`);
		target.conditions.push(name);
		pendAction('removeCondition', state.get('round') + duration, state.get('currentChar'), name, targetId);
		return state;
	});

	WarLogger.defineAction('passTurn', (state) => {
		let allChars = state.get('allChars'),
			round = state.get('round'),
			newCurrentsAggro,
			{ next, newRound } = getNextAble(allChars, state.get('currentChar'));

		newCurrentsAggro = allChars.get(next).aggro;
		newCurrentsAggro && getOptionByText($attackSelect, newCurrentsAggro, true).prop('selected', true);

		currentRound = newRound ? round + 1 : round;
		currentChar = next;

		return processPending(state, currentRound, currentChar)
			.set('currentChar', currentChar)
			.set('round', currentRound);
	});

})(window.WarLogger);
