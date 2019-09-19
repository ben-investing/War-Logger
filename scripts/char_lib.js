
((WarLogger) => {
	let
		$wrapper = $('.char-library'),
		$addChar = $wrapper.mF('.add-char'),
		$charList = $wrapper.mF('.char-list'),
		$npcList = $wrapper.mF('.npc-list'),
		$inputs = $addChar.mF('.add-char-input'),
		$submit = $addChar.mF('.add-char-submit'),
		$title = $addChar.mF('.add-char-title'),
		$form = $addChar.mF('.add-char-form'),
		$minmax = $wrapper.mF('.minmax'),
		$toHide = $wrapper.mF('.char-library-to-hide'),
		demiInit = _.once(() => {
			setTimeout(() => {
				let $npc = $('.char-library .npc-list').mF('.clickable').first();
				$npc.click(); $npc.click(); $npc.click();
				$('.char-library .char-list').mF('.clickable').first().click();
			}, 200)
		}),
		renderGroup = ($charList, list, isNPC) => _.each(list, (item, i) =>
			$charList.append($('<li>').addClass('clickable').html(item.name)
				.attr('title', JSON.stringify(item, '', '\n'))
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
