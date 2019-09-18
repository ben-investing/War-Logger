
((WarLogger) => {
	let
		$wrapper = $('.char-library'),
		$addChar = $wrapper.f('.add-char'),
		$charList = $wrapper.f('.char-list'),
		$npcList = $wrapper.f('.npc-list'),
		$inputs = $addChar.f('.add-char-input'),
		$submit = $addChar.f('.add-char-submit'),
		$title = $addChar.f('.add-char-title'),
		$form = $addChar.f('.add-char-form'),
		$minmax = $wrapper.f('.minmax'),
		$toHide = $wrapper.f('.char-library-to-hide'),
		demiInit = _.once(() => {
			setTimeout(() => {
				let $npc = $('.char-library .npc-list').f('.clickable').first();
				$npc.click(); $npc.click(); $npc.click();
				$('.char-library .char-list').f('.clickable').first().click();
			}, 200)
		}),
		renderGroup = ($charList, list, isNPC) => _.each(list, (item, i) =>
			$charList.append($('<li>').addClass('clickable').html(item.name)
				.on('click', () => WarLogger.dispatch('addCharToBattle', i, isNPC))
				.append($('<span>').addClass('right-f').html('x').on('click', (e) => {
					WarLogger.data.deleteChar(i, isNPC);
					e.stopPropagation();
				}))));

	$minmax.on('click', () => $toHide.toggle());
	$title.on('click', () => $form.toggleClass('hide'));
	$submit.on('click', () => {
		let charObj = {};
		_.e($inputs, input => {
			let $input = $(input);
			charObj[$input.data('name')] = $input.val();
		});
		(charObj.type === 'npc' ? WarLogger.data.addNPC : WarLogger.data.addChar)(charObj);
	})

	WarLogger.defineAction('INIT_LIB', (state, chars, npcs) => {
		$charList.empty();
		$npcList.empty();
		renderGroup($charList, chars, false);
		renderGroup($npcList, npcs, true);
		demiInit();
		return state.set('uiStage', 'INITIALIZED');
	});

})(window.WarLogger);
