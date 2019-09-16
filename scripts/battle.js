
((WarLogger) => {

	const injuries = ['Uninjured', 'Barely Injured', 'Barely Injured', 'Injured', 'Injured', 'Badly Injured', 'Badly Injured', 'Near Death'],
		injuryMeter = ratio => ratio === 1 ? 'Dead' : injuries[Math.floor(ratio * injuries.length)],
		scrW = 600, scrH = 500;

	let
		tableRow = _.template(`<tr class="<%= i === 1 ? 'current-turn' : ''%>">
<td><%=i%></td>
<td><%=name%></td>
<td data-name="hp"><%=processedHP%></td>
<td data-name="aggro"><%=lastAggro%></td>
<td data-name="conditions"></td>
</tr>`),
		$wrapper = $('.battle-zone'),
		$warGrounds = $wrapper.f('.war-grounds'),
		$warGroundsBody = $warGrounds.f('tbody'),
		$rows,
		$remoteBattleZone,
		battleWindow,
		renderBattleList = (list) => {
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
				charObj.lastAggro = '';
				renderedTableRow = $(tableRow(charObj));
				$warGroundsBody.append(renderedTableRow);
				$rows = $rows.add(renderedTableRow);
			})
		},
		rewriteWindow = () => $remoteBattleZone && $remoteBattleZone.empty().append($warGrounds.clone()),
		fireBattleWindow = () => {
			battleWindow = window.open('battleWindow.html', 'BattleWindow',
				`scrollbars=yes,width=${scrW},height=${scrH},menubar=no,left=${window.screen.width/2 - scrW/2},top=${window.screen.height/2 - scrH/2}`);
			setTimeout(() => {
				$remoteBattleZone = $(battleWindow.document.body).f('.battle-zone');
				rewriteWindow();
			}, 400);
		};

	WarLogger.redrawBattleList = () => {
		renderBattleList([...WarLogger.getBattleState().get('allChars')]);
	}
	WarLogger.commenceBattle = (allChars) => {
		$wrapper.show();
		_.each(allChars, charObj => charObj.currentHP = charObj.rolledHP);
		renderBattleList(allChars);
		0 && fireBattleWindow();
		WarLogger.initializeActions(allChars);
		WarLogger.trigger({ type: 'START_BATTLE', allChars });
	}

})(window.WarLogger);
