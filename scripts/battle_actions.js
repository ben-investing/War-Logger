
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
		$passTurn = $wrapper.mF('.battle-actions-pass-turn'),
		$attackTarget = $wrapper.mF('.battle-actions-attack-target'),
		$attackDamage = $wrapper.mF('.battle-actions-attack-damage'),
		$attackAndPass = $wrapper.mF('.battle-actions-attack-pass'),
		$attackSubmit = $wrapper.mF('.battle-actions-attack-submit'),
		$healTarget = $wrapper.mF('.battle-actions-heal-target'),
		$healAmount = $wrapper.mF('.battle-actions-heal-amount'),
		$healType = $wrapper.mF('.battle-actions-heal-type'),
		$healSubmit = $wrapper.mF('.battle-actions-heal-submit'),
		$conditionTarget = $wrapper.mF('.battle-actions-condition-target'),
		$conditionName = $wrapper.mF('.battle-actions-condition-name'),
		$conditionDuration = $wrapper.mF('.battle-actions-condition-duration'),
		$conditionSubmit = $wrapper.mF('.battle-actions-condition-submit'),
		currentRound, currentChar,
		pendingActions = [],
		$blankOption = $('<option>').val('').html(' - '),
		getOptionByText = (text, notDisabled) => $attackTarget.f(`option:contains("${text}")${notDisabled ? ':not([disabled])' : ''}`),
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
		},
		renderConditions = () => {
			$conditionName.empty();
			WarLogger.data.getConditions().map(cond => $conditionName.append($('<option>').val(cond).text(cond)));
		};

	$attackSubmit.on('click', () => {
		let attackeeId = $attackTarget.val(),
			damage = $attackDamage.val(),
			andPass = $attackAndPass.isChecked();

		attackeeId !== '' && damage !== '' && WarLogger
			.dispatch('damage', +attackeeId, +damage)
			.dispatch(andPass ? 'passTurn' : '')
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

	WarLogger.defineAction('conditionsChanged', (state) => {
		renderConditions();
		return state;
	});
	
	WarLogger.defineAction('initializeBattleActions', (state) => {
		renderConditions()
		$attackTarget.empty().append($blankOption);
		_.e([...state.get('allChars')], (charObj, i) => {
			let $option = $('<option>').val(i).html(charObj.name);
			$attackTarget.append($option);
			$healTarget.append($option.clone());
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
			getOptionByText(attackee.name).disable();
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

		if (newCurrentsAggro) {
			let $option = getOptionByText(newCurrentsAggro);
			if (!$option.prop('disabled')) {
				$option.setSelected();
			} else {
				$attackTarget.val('');
			}
		} else {
			$attackTarget.val('');
		}

		currentRound = newRound ? round + 1 : round;
		currentChar = next;

		return processPending(state, currentRound, currentChar)
			.set('currentChar', currentChar)
			.set('round', currentRound);
	});

})(window.WarLogger);
