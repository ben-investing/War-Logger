
((WarLogger) => {
	let
		$wrapper = $('.char-library'),
		$addChar = $wrapper.mF('.add-char'),
		$charList = $wrapper.mF('.char-list'),
		$npcList = $wrapper.mF('.npc-list'),
		$spawnsList = $wrapper.mF('.spawns-list'),
		$spawnsNewSpawnButton = $wrapper.mF('.spawns-new-spawn-button'),
		$spawnsNewSpawnList = $wrapper.mF('.spawns-new-spawn-list'),
		$spawnsNewSpawnName = $wrapper.mF('.spawns-new-spawn-name'),
		$spawnsNewSpawnSave = $wrapper.mF('.spawns-new-spawn-save'),
		$spawnsNewSpawnCancel = $wrapper.mF('.spawns-new-spawn-cancel'),
		$inputs = $addChar.mF('.add-char-input'),
		$submit = $addChar.mF('.add-char-submit'),
		$title = $addChar.mF('.add-char-title'),
		$form = $addChar.mF('.add-char-form'),
		$minmax = $wrapper.mF('.minmax'),
		$toHide = $wrapper.mF('.char-library-to-hide'),
		newSpawnMode = false,
		newSpawnAdded,
		demiInit = _.once(() => {
			setTimeout(() => {
				let $npc = $('.char-library .npc-list').mF('.clickable').first();
				$npc.click(); $npc.click(); $npc.click();
				$('.char-library .char-list').mF('.clickable').first().click();
			}, 200)
		}),
		addToNewSpawn = (charId, isNPC) => {
			newSpawnAdded[isNPC ? 'npcs' : 'chars'].push(charId);
			$spawnsNewSpawnList.append($('<div>').html(WarLogger.data.getChar(charId, isNPC).name));
		},
		renderSpawns = () => {
			$spawnsList.empty();
			_.e(WarLogger.data.getSpawns(), (spawn, i) => {
				$spawnsList.append($('<div>').addClass('clickable').html(spawn.name)
					.on('click', () => {
						WarLogger.dispatch('clearAddedChars');
						spawn.chars.map(char => WarLogger.dispatch('addCharToBattle', char, false));
						spawn.npcs.map(npc => WarLogger.dispatch('addCharToBattle', npc, true));
					}).append(makeX(e => {
						WarLogger.data.deleteSpawn(i);
						renderSpawns();
						e.stopPropagation();
					})));
			})
		},
		makeX = handler => $('<span>').addClass('right-f').html('x').on('click', handler),
		cancelNewSpawn = () => { $spawnsNewSpawnName.val(''); newSpawnMode = false; },
		renderGroup = ($charList, list, isNPC) => _.each(list, (item, i) =>
			$charList.append($('<li>').addClass('clickable').html(item.name)
				.attr('title', JSON.stringify(item, '', '\n'))
				.on('click', () => newSpawnMode ? addToNewSpawn(i, isNPC) : WarLogger.dispatch('addCharToBattle', i, isNPC))
				.append(makeX(e => {
					WarLogger.data.deleteChar(i, isNPC);
					e.stopPropagation();
				}))));

	$spawnsNewSpawnButton.on('click', () => {
		newSpawnAdded = { chars: [], npcs: [] };
		$spawnsNewSpawnList.empty();
		newSpawnMode = true;
	});
	$spawnsNewSpawnSave.on('click', () => {
		newSpawnAdded.name = $spawnsNewSpawnName.val().trim();
		WarLogger.data.addSpawn(newSpawnAdded);
		renderSpawns();
		cancelNewSpawn();
	});
	$spawnsNewSpawnCancel.on('click', cancelNewSpawn);
	renderSpawns();

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
