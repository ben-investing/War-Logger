
((WarLogger) => {
	let
		$wrapper = $('.settings-panel'),
		$confConditionsTA = $wrapper.mF('.conf-conditions'),
		$confConditionsEditButton = $wrapper.mF('.conf-conditions-edit'),
		$confConditionsSave = $wrapper.mF('.conf-conditions-save');

	$confConditionsSave.on('click', () => {
		WarLogger.data.saveConditions($confConditionsTA.val().split('\n').filter(row => !!row.trim()));
		WarLogger.dispatch('conditionsChanged');
	});

	$confConditionsEditButton.on('click', () => $confConditionsTA.val(WarLogger.data.getConditions().join('\n')))

})(window.WarLogger);
