
((Immutable, WarLogger) => {

	const injuries = ['Uninjured', 'Barely Injured', 'Barely Injured', 'Injured', 'Injured', 'Badly Injured', 'Badly Injured', 'Near Death'],
		injuryMeter = ratio => ratio === 1 ? 'Dead' : injuries[Math.floor(ratio * injuries.length)],
		scrW = 600, scrH = 500,
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
<div>AB: <%=data.ab%></div>
<div>AC: <%=data.ac%></div>
`),
		$wrapper = $('.battle-zone'),
		$warGrounds = $wrapper.mF('.war-grounds'),
		$charDetails = $wrapper.mF('.current-char-details'),
		$warGroundsBody = $warGrounds.mF('.war-grounds-table tbody'),
		$battleLog = $wrapper.mF('.battle-log'),
		$settingsPopup = $('.settings-btlppp'),
		$rows,
		$remoteBattleZone,
		battleWindow,
		rewriteWindow = () => {
			if ($remoteBattleZone) {
				let $clone = $wrapper.clone();
				$clone.f('.hide-from-popup').remove();
				$clone.f('.show-in-popup').show();
				$remoteBattleZone.empty().append($clone.html());
			}
		},
		renderBattleList = (list, currentChar) => {
			$warGroundsBody.empty();
			$rows = $();
			_.each(list, ({ name, currentHP, rolledHP, isNPC, aggro, conditions }, i) => {
				let renderedTableRow;
				renderedTableRow = $(tableRow({
					name,
					processedHP: isNPC ? injuryMeter(1 - currentHP/rolledHP) : `${currentHP}/${rolledHP}`,
					i: i + 1,
					aggro: aggro || '',
					currentTurn: i === currentChar,
					conditions: conditions.join(',')
				}));

				$warGroundsBody.append(renderedTableRow);
				$rows = $rows.add(renderedTableRow);
			});
			$charDetails.html(charDetails({ data: list[currentChar] }));
			rewriteWindow();
		},
		fireBattleWindow = () => {
			battleWindow = window.open('battleWindow.html', 'BattleWindow',
				`scrollbars=yes,width=${scrW},height=${scrH},menubar=no,left=${window.screen.width/2 - scrW/2},top=${window.screen.height/2 - scrH/2}`);
			setTimeout(() => {
				$remoteBattleZone = $(battleWindow.document.body).mF('.battle-zone');
				rewriteWindow();
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
		$settingsPopup.isChecked() && fireBattleWindow();
		renderBattleList(allChars, 0);
		return state
			.set('uiStage', 'BATTLE')
			.set('allChars', List(allChars));
	});

	WarLogger.log = (message) => $battleLog.show().prepend($('<li>').html(message));

})(window.Immutable, window.WarLogger);
