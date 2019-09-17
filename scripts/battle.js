
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
<td data-name="conditions"></td>
</tr>`),
		$wrapper = $('.battle-zone'),
		$warGrounds = $wrapper.f('.war-grounds'),
		$warGroundsBody = $warGrounds.f('tbody'),
		$rows,
		$remoteBattleZone,
		battleWindow,
		rewriteWindow = () => $remoteBattleZone && $remoteBattleZone.empty().append($warGrounds.clone()),
		renderBattleList = (list, currentChar) => {
			$warGroundsBody.empty();
			$rows = $();
			_.each(list, (charObj, i) => {
				let renderedTableRow;
				if (charObj.type === 'npc') {
					charObj.processedHP = injuryMeter(1 - charObj.currentHP/charObj.rolledHP);
				} else {
					charObj.processedHP = `${charObj.currentHP}/${charObj.rolledHP}`;
				}
				charObj.i = i + 1;
				charObj.aggro = charObj.aggro || '';
				charObj.currentTurn = i === currentChar;
				renderedTableRow = $(tableRow(charObj));
				$warGroundsBody.append(renderedTableRow);
				$rows = $rows.add(renderedTableRow);
			});
			rewriteWindow();
		},
		fireBattleWindow = () => {
			battleWindow = window.open('battleWindow.html', 'BattleWindow',
				`scrollbars=yes,width=${scrW},height=${scrH},menubar=no,left=${window.screen.width/2 - scrW/2},top=${window.screen.height/2 - scrH/2}`);
			setTimeout(() => {
				$remoteBattleZone = $(battleWindow.document.body).f('.battle-zone');
				rewriteWindow();
			}, 400);
		};

	WarLogger.defineAction('redrawBattle', (state) => {
		renderBattleList([...state.get('allChars')], state.get('currentChar'));
		return state;
	});
	WarLogger.defineAction('commenceBattle', (state, allChars) => {
		$wrapper.show();
		_.each(allChars, charObj => charObj.currentHP = charObj.rolledHP);
		1 && fireBattleWindow();
		renderBattleList(allChars, 0);
		return state
			.set('uiStage', 'BATTLE')
			.set('allChars', List(allChars));
	});

})(window.Immutable, window.WarLogger);
