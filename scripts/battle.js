
((Immutable, WarLogger) => {

	const injuries = ['Uninjured', 'Barely Injured', 'Barely Injured', 'Injured', 'Injured', 'Badly Injured', 'Badly Injured', 'Near Death'],
		injuryMeter = ratio => ratio === 1 ? 'Dead' : injuries[Math.floor(ratio * injuries.length)],
		scrW = 900, scrH = 500,
		{ List } = Immutable;

	let
		tableRow = _.template(`<tr class="<%= currentTurn ? 'current-turn' : ''%>">
			<td><%=i%></td>
			<td><%=name%></td>
			<td data-name="hp"><%=processedHP%></td>
			<td data-name="aggro"><%=aggro%></td>
			<td data-name="conditions"><%=conditions%></td>
			</tr>`),
		charDetails = _.template(`
<h2><%=data.name%></h2>
<div>HP: <%=health%></div>
<div>AB: <%=data.ab%></div>
<div>AC: <%=data.ac%></div>
<div><%=data.conditions.join(', ')%></div>
`),
		charDetailsSelector = '.current-char-details',
		$wrapper = $('.battle-zone'),
		$warGrounds = $wrapper.mF('.war-grounds'),
		$charDetails = $wrapper.mF(charDetailsSelector),
		$warGroundsBody = $warGrounds.mF('.war-grounds-table tbody'),
		$battleLog = $wrapper.mF('.battle-log'),
		$battleActionsOpenPopup = $wrapper.mF('.battle-actions-open-popup'),
		$settingsPopup = $('.settings-btlppp'),
		$rows,
		$remoteBattleZone,
		battleWindow,
		rewriteWindow = (showDetails) => {
			if ($remoteBattleZone) {
				let $clone = $wrapper.clone();
				$clone.mF(charDetailsSelector)[showDetails ? 'removeClass' : 'addClass']('hide-from-popup');
				$clone.f('.show-in-popup').show();
				$remoteBattleZone.empty().append($clone.html());
			}
		},
		renderBattleList = (list, currentCharId) => {
			$warGroundsBody.empty();
			$rows = $();
			_.each(list, ({ name, currentHP, rolledHP, isNPC, aggro, conditions }, i) => {
				let renderedTableRow,
					health = `${currentHP}/${rolledHP}`,
					isCurrent = i === currentCharId;
				renderedTableRow = $(tableRow({
					name,
					processedHP: isNPC ? injuryMeter(1 - currentHP/rolledHP) : health,
					i: i + 1,
					aggro: aggro || '',
					currentTurn: isCurrent,
					conditions: conditions.join(',')
				}));

				$warGroundsBody.append(renderedTableRow);
				$rows = $rows.add(renderedTableRow);
				if (isCurrent) {
					$charDetails.html(charDetails({ data: list[currentCharId], health }));
				}
			});
			rewriteWindow(!list[currentCharId].isNPC);
		},
		fireBattleWindow = (showDetails) => {
			battleWindow = window.open('battleWindow.html', 'BattleWindow',
				`scrollbars=yes,width=${scrW},height=${scrH},menubar=no,left=${window.screen.width/2 - scrW/2},top=${window.screen.height/2 - scrH/2}`);
			setTimeout(() => {
				let $body = $(battleWindow.document.body);
				$remoteBattleZone = $body.addClass('popup-body').mF('.battle-zone');
				rewriteWindow(showDetails);
			}, 400);
		},
		announceIfVictorious = (state) => {
			if (!_.reduce([...state.get('allChars')], (total, charObj) => total + (charObj.isNPC ? +charObj.currentHP : 0), 0)) {
				WarLogger.log(`Total XP: ${state.get('collectedXP')}<br><br>`);
				WarLogger.log('Victory!');
				WarLogger.data.saveNewLogEntry({
					// Collect more data? Battle duration...Chars..
					time: Date.now(),
					html: $battleLog.html()
				});
			}
		};

	$battleActionsOpenPopup.on('click', fireBattleWindow);

	WarLogger.defineAction('redrawBattle', (state) => {
		announceIfVictorious(state);
		renderBattleList([...state.get('allChars')], state.get('currentChar'));
		return state;
	});

	WarLogger.defineAction('commenceBattle', (state, allChars) => {
		$wrapper.show();
		_.each(allChars, charObj => {
			charObj.currentHP = charObj.rolledHP;
			charObj.isNPC = charObj.type === 'npc';
		});
		$settingsPopup.isChecked() && fireBattleWindow(!allChars[0].isNPC);
		renderBattleList(allChars, 0);
		return state
			.set('uiStage', 'BATTLE')
			.set('allChars', List(allChars));
	});

	WarLogger.log = (message) => $battleLog.show().prepend($('<li>').html(message));

})(window.Immutable, window.WarLogger);
