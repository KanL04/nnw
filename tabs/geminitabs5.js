/*
   ФИНАЛЬНАЯ ВЕРСИЯ 5.0 (FIXED LISTBOX)
   1. Валидация listbox теперь смотрит ТОЛЬКО на значение (игнорирует сломанные ключи)
   2. Валидация по индексу (для динамических таблиц)
   3. manualCheckIds
*/

async function setVisibleEl() {
    if (!model || !model.cmps || !Array.isArray(model.cmps)) return;

    model.cmps = model.cmps
        .map(id => view.playerView.getViewWithId(id))
        .filter(Boolean);

    if (model.cmps.length === 0) return;

    try {
        const res = await AS.FORMS.ApiUtils.simpleAsyncGet('rest/api/person/auth?getGroups=true');
        if (!res || !res.groups) return;

        const hasAccess = res.groups.some(g => model.groups && model.groups.includes(g.groupCode));

        if (!hasAccess && model.tabs) {
            model.tabs = model.tabs.filter(tab => tab.id !== 'admin');
        }

        model.cmps.forEach(cmp => cmp.setVisible(hasAccess));
        return hasAccess; 
    } catch (err) {
        console.error('Error checking groups:', err);
        model.cmps.forEach(cmp => cmp.setVisible(false));
        if (model.tabs) model.tabs = model.tabs.filter(tab => tab.id !== 'admin');
        return false;
    }
}

function tabs() {
    let asfPlayerView = $(view.container[0]).find('.asf-playerView');
    if (!view.playerView.container[0].contains(view.container[0])) return;
    model.EVENT_TAB_LOADED = false;
    if (model.EVENT_TAB_LOADED) return;

    let parentContainer = view.playerView.container;
    let tabContainer = $('<div>', { class: 'tab-container' });
    let tab = $('<div>', { class: 'tab' });
    let tabsData = [];
    let currentTabIndex = 0;
    model.currentTabIndex = 0;

    const toggleAcc = (el, block) => {
        el = el[0];
        el.classList.toggle("active");
        block.open = $(el).hasClass('active');
        let panel = el.nextElementSibling;
        if (panel.style.maxHeight) panel.style.maxHeight = null;
        else panel.style.maxHeight = "initial";
    };

    // === ВАЛИДАЦИЯ ЗНАЧЕНИЯ ===
    const isValueInvalid = (value) => {
        if (value === null || value === undefined) return true;
        let strVal = String(value).trim();
        if (strVal === '') return true;
        if (strVal === '—' || strVal === '–' || strVal === '-') return true;
        if (strVal === 'Не выбрано') return true;
        if (strVal === '0') return true;
        return false;
    };

    // === ИСПРАВЛЕННАЯ ВАЛИДАЦИЯ ПОЛЯ ===
    const isFieldValid = (fieldView, fieldType) => {
        if (!fieldView || !fieldView.model) return false;
        
        const value = fieldView.model.value;
        
        // !!! ИЗМЕНЕНИЕ: Мы убрали отдельную проверку ключа для listbox !!!
        // Теперь проверяется только value. Если value валидное ("SatbayevUniversity"), то поле валидно.
        
        // Проверка Regex
        if (fieldView.tableModel && fieldView.tableModel.asfProperty) {
            const config = fieldView.tableModel.asfProperty.config;
            if (config && config.regExp === true && config['input-mask']) {
                try {
                    const regex = new RegExp(config['input-mask']);
                    return regex.test(value);
                } catch (e) { return false; }
            }
        }

        if (fieldView.model.getSpecialErrors) {
            try { if (fieldView.model.getSpecialErrors()) return false; } catch (e) { return false; }
        }
        if (fieldView.model.validate) {
            try { 
                const res = fieldView.model.validate();
                return res === true || res === null || res === undefined;
            } catch (e) { return false; }
        }
        
        // Главная проверка значения
        return !isValueInvalid(value);
    };

    const getAllTabBlocks = (tabData) => {
        let allBlocks = [];
        if (tabData.blocks && Array.isArray(tabData.blocks)) allBlocks = [...tabData.blocks];
        if (tabData.accordion && Array.isArray(tabData.accordion)) {
            tabData.accordion.forEach(acc => {
                if (acc.blocks && Array.isArray(acc.blocks)) allBlocks = [...allBlocks, ...acc.blocks];
            });
        }
        return allBlocks;
    };

   // === ФУНКЦИЯ ПРОВЕРКИ С ЛОГАМИ ДЛЯ ДИНАМИЧЕСКИХ ТАБЛИЦ ===
const checkRequiredFields = (tabIndex) => {
        const tabData = tabsData[tabIndex];
        if (!tabData) return { hasRequired: false, hasEmpty: false };

        let hasRequired = false;
        let hasEmpty = false;

        const allBlocks = getAllTabBlocks(tabData);

        allBlocks.forEach(blockId => {
            try {
                const blockView = view.playerView.getViewWithId(blockId);
                
                if (blockView && blockView.tableModel && blockView.tableModel.asfProperty) {
                    const isBlockVisible = !blockView.tableModel.hasOwnProperty('visible') || blockView.tableModel.visible !== false;
                    if (!isBlockVisible) return;

                    const properties = blockView.tableModel.asfProperty.properties;
                    const modelBlocks = blockView.tableModel.modelBlocks;

                    // Логика для динамических таблиц
                    if (properties && Array.isArray(properties) && modelBlocks && Array.isArray(modelBlocks)) {
                        const requiredProps = properties.filter(prop => {
                            const isVisible = !prop.hasOwnProperty('visible') || prop.visible !== false;
                            const isRequired = prop.required === true && prop.type !== 'label';
                            return isVisible && isRequired;
                        });

                        modelBlocks.forEach((row) => {
                            if (Array.isArray(row)) {
                                requiredProps.forEach((prop) => {
                                    const colIndex = properties.indexOf(prop);
                                    const cellModel = row[colIndex];

                                    if (cellModel) {
                                        let isFieldVisible = true;
                                        if (cellModel.hasOwnProperty('visible') && cellModel.visible === false) {
                                            isFieldVisible = false;
                                        }

                                        if (isFieldVisible) {
                                            hasRequired = true;
                                            const fakeView = { 
                                                model: cellModel,
                                                tableModel: blockView.tableModel 
                                            };
                                            const valid = isFieldValid(fakeView, prop.type);
                                            if (!valid) {
                                                hasEmpty = true;
                                                // Минимальное логирование для отладки в продакшене
                                                if (console && console.debug) {
                                                    console.debug('Tab validation:', {
                                                        tab: tabData.name,
                                                        field: prop.id,
                                                        value: cellModel.value,
                                                        key: cellModel.key
                                                    });
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                    // Логика для обычных блоков
                    else if (!modelBlocks) {
                         if (properties && Array.isArray(properties)) {
                            properties.forEach(prop => {
                                if (prop.required === true && prop.type !== 'label') {
                                    const isPropVisible = !prop.hasOwnProperty('visible') || prop.visible !== false;
                                    if (!isPropVisible) return;

                                    try {
                                        const fieldView = view.playerView.getViewWithId(prop.id);
                                        if (!fieldView) return;
                                        let isVis = true;
                                        if (fieldView.model && fieldView.model.visible === false) isVis = false;
                                        
                                        if (isVis) {
                                            hasRequired = true;
                                            if (!isFieldValid(fieldView, prop.type)) hasEmpty = true;
                                        }
                                    } catch(e) {}
                                }
                            });
                        }
                    }
                }
            } catch (e) {
                console.warn('Error checking block:', blockId, e);
            }
        });

        return { hasRequired, hasEmpty };
    };
    // === ВИДИМОСТЬ ТАБА ===
    const isTabEmpty = (tabIndex) => {
        const tabData = tabsData[tabIndex];
        if (!tabData) return true;
        if (tabData.hasOwnProperty('visible') && tabData.visible === false) return true;
        if (tabData.name === 'Блок модератора' || tabData.id === 'admin') return false;
        if (tabData.manualCheckIds && tabData.manualCheckIds.length > 0) return false;

        const allBlocks = getAllTabBlocks(tabData);
        if (allBlocks.length === 0) return true;

        let hasVisibleBlock = false;
        for (const blockId of allBlocks) {
             if ($(parentContainer).find(`[data-asformid$=".container.${blockId}"]`).length > 0) {
                 hasVisibleBlock = true;
                 break;
             }
        }
        if (!hasVisibleBlock) {
            allBlocks.forEach(blockId => {
                try {
                    const blockView = view.playerView.getViewWithId(blockId);
                    if (blockView && blockView.tableModel) {
                        const isVisible = !blockView.tableModel.hasOwnProperty('visible') || blockView.tableModel.visible !== false;
                        if (isVisible) hasVisibleBlock = true;
                    }
                } catch (e) {}
            });
        }
        return !hasVisibleBlock;
    };

    const updateTabsValidation = () => {
        tabsData.forEach((item, i) => {
            const tabButton = $(tabContainer.find('.tablinks')[i]);
            const validation = checkRequiredFields(i);

            if (isTabEmpty(i)) {
                tabButton.addClass('hidden');
            } else {
                tabButton.removeClass('hidden');
                if (validation.hasRequired && validation.hasEmpty) {
                    tabButton.addClass('has-error');
                } else {
                    tabButton.removeClass('has-error');
                }
            }
        });
    };

    model.validateTabs = () => {
        updateTabsValidation();
        let hasErrors = false;
        tabsData.forEach((item, i) => {
            if (isTabEmpty(i)) return;
            const validation = checkRequiredFields(i);
            if (validation.hasRequired && validation.hasEmpty) hasErrors = true;
        });
        return !hasErrors;
    };

    const showTab = (index) => {
        if (index < 0 || index >= tabsData.length) return;
        let currentIndex = index;
        let tabButton = $(tabContainer.find('.tablinks')[currentIndex]);

        while (tabButton.hasClass('hidden') && currentIndex < tabsData.length) {
            currentIndex++;
            tabButton = $(tabContainer.find('.tablinks')[currentIndex]);
        }

        if (currentIndex >= tabsData.length) {
            currentIndex = tabsData.length - 1;
            while (currentIndex >= 0 && $(tabContainer.find('.tablinks')[currentIndex]).hasClass('hidden')) {
                currentIndex--;
            }
            if (currentIndex < 0) return;
        }

        tabContainer.find('.tabcontent').removeClass('active');
        tabContainer.find('.tablinks').removeClass('active');
        $(tabContainer.find('.tabcontent')[currentIndex]).addClass('active');
        $(tabContainer.find('.tablinks')[currentIndex]).addClass('active');

        currentTabIndex = currentIndex;
        model.currentTabIndex = currentIndex;
        updateTabsValidation();
    };

    model.showTab = showTab;

    tabContainer.append(tab);
    $(view.container).append(tabContainer);
    if (model.hasOwnProperty('tabs')) tabsData = model.tabs;

    tabsData.forEach((item, i) => {
        let tabButton = $(`<button class="tablinks" id="tab_button_${i}"></button>`);
        let tabcontent = $('<div>', { class: 'tabcontent' });

        if (AS.OPTIONS.locale === 'ru' && item.name) {
            tabButton.text(item.name);
        } else if (AS.OPTIONS.locale === 'kk' && item.nameKZ) {
            tabButton.text(item.nameKZ);
        } else if (AS.OPTIONS.locale === 'en' && item.nameEN) {
            tabButton.text(item.nameEN);
        } else {
            tabButton.text(item.name);
        }

        if (isTabEmpty(i)) tabButton.addClass('hidden');
        if (item.hasOwnProperty('visible') && item.visible === false) tabButton.addClass('hidden');

        tab.append(tabButton);
        tabContainer.append(tabcontent);

        tabButton.on('click', () => { showTab(i); });

        if (i === 0 && !tabButton.hasClass('hidden')) {
            tabButton.addClass('active');
            tabcontent.addClass('active');
        }

        if (item.hasOwnProperty('blocks')) {
            item.blocks.forEach(block => {
                let tabData = $(parentContainer).find(`[data-asformid$=".container.${block}"]`);
                tabData.parent().parent().hide();
                tabcontent.append(tabData.detach());
            });
        }

        if (item.hasOwnProperty('accordion')) {
            let accordionContainer = $('<div class="custom-accordion">');
            tabcontent.append(accordionContainer);

            item.accordion.forEach(acc => {
                let block = $('<div class="accordion-block">');
                let title = $(parentContainer).find(`[data-asformid="label.label.${acc.titleID}"]`);
                let button = $(`<button class="accordion-button">${title.text()}</button>`);
                let body = $('<div class="accordion-body">');

                title.parent().parent().parent().hide();
                accordionContainer.append(block);
                block.append(button).append(body);
                button.on('click', () => toggleAcc(button, acc));

                acc.blocks.forEach(accblock => {
                    let cc = $(parentContainer).find(`[data-asformid$=".container.${accblock}"]`);
                    cc.parent().parent().hide();
                    body.append(cc.detach());
                });

                body.append('<div class="accordion-footer"></div>');
                if (acc.open) toggleAcc(button, acc);
            });
        }
    });

    let initialTabIndex = 0;
    while (initialTabIndex < tabsData.length && $(tabContainer.find('.tablinks')[initialTabIndex]).hasClass('hidden')) {
        initialTabIndex++;
    }
    if (initialTabIndex < tabsData.length) {
        showTab(initialTabIndex);
    }

    setTimeout(() => { updateTabsValidation(); }, 500);
    model.EVENT_TAB_LOADED = true;
}

(async () => {
    try {
        await setVisibleEl();
    } catch (e) { }
    await new Promise(r => setTimeout(r, 200));
    tabs();
})();