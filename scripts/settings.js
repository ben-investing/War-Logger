
((WarLogger) => {
	let
		$wrapper = $('.settings-panel'),
		$restartBattle = $('.restart-battle'),
		$confConditionsTA = $wrapper.mF('.conf-conditions'),
		$confConditionsEditButton = $wrapper.mF('.conf-conditions-edit'),
		$confConditionsSave = $wrapper.mF('.conf-conditions-save'),
		$downloadData = $wrapper.mF('.download-data'),
		$uploadData = $wrapper.mF('.upload-data');

	$downloadData.on('click', () => {
		let element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(WarLogger.data.getDataJSON()));
		element.setAttribute('download', `WarLogger Data ${WarLogger.getLocalDate()}`);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	});

	$uploadData.on('click', () => {
		let input = window.prompt('Enter JSON');
		WarLogger.data.loadDataJSON(input);
	});

	$confConditionsSave.on('click', () => {
		WarLogger.data.saveConditions($confConditionsTA.val().split('\n').filter(row => !!row.trim()));
		WarLogger.dispatch('conditionsChanged');
	});

	$restartBattle.on('click', () => {
		WarLogger.dispatch('clearAddedChars');
		$('.setup-battle').show();
		$('.set-initiatives-wrapper, .battle-zone').hide();
	});

	$confConditionsEditButton.on('click', () => $confConditionsTA.val(WarLogger.data.getConditions().join('\n')))

})(window.WarLogger);
