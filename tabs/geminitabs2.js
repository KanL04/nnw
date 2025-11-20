/*
   Скрипт валидации табов с поддержкой APPENDABLE TABLE и Блока модератора
*/

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

// === 1. ЧИСТАЯ ВАЛИДАЦИЯ ЗНАЧЕНИЯ ===
const isValueInvalid = (value) => {
    if (value === null || value === undefined) return true;
    let strVal = String(value).trim();
    if (strVal === '') return true;
    if (strVal === '—' || strVal === '–' || strVal === '-') return true;
    if (strVal === 'Не выбрано') return true;
    if (strVal === '0') return true;
    return false;
};

// === 2. ВАЛИДАЦИЯ МОДЕЛИ ===
const isFieldValidModel = (fieldView, fieldType) => {
    if (!fieldView || !fieldView.model) return false;
    const value = fieldView.model.value;
    const key = fieldView.model.key;
    
    if (fieldType === 'listbox') return !isValueInvalid(key) && !isValueInvalid(value);
    
    if (fieldView.model.getSpecialErrors) {
        try { if (fieldView.model.getSpecialErrors()) return false; } catch (e) { return false; }
    }
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

// === 3. ГЛАВНАЯ ФУНКЦИЯ ПРОВЕРКИ ===
const checkRequiredFields = (tabIndex) => {
    const tabData = tabsData[tabIndex];
    if (!tabData) return { hasRequired: false, hasEmpty: false };

    let hasRequired = false;
    let hasEmpty = false;
    
    const allBlocks = getAllTabBlocks(tabData);
    
    allBlocks.forEach(blockId => {
        try {
            const blockView = view.playerView.getViewWithId(blockId);
            
            if (!blockView || !blockView.tableModel) return;
            const isBlockVisible = !blockView.tableModel.hasOwnProperty('visible') || blockView.tableModel.visible !== false;
            if (!isBlockVisible) return;

            // --- ЛОГИКА ДЛЯ ДИНАМИЧЕСКОЙ ТАБЛИЦЫ ---
            if (blockView.tableModel.type === 'appendable_table') {
                let columns = [];
                if (blockView.tableModel.asfProperty && blockView.tableModel.asfProperty.properties) {
                    columns = blockView.tableModel.asfProperty.properties;
                } else if (blockView.tableModel.data && Array.isArray(blockView.tableModel.data)) {
                    columns = blockView.tableModel.data;
                }

                columns.forEach(col => {
                    let isRequired = col.required === true;
                    
                    if (!isRequired && tabData.manualCheckIds && Array.isArray(tabData.manualCheckIds)) {
                         isRequired = tabData.manualCheckIds.some(manualId => col.id.includes(manualId));
                    }

                    if (isRequired && col.type !== 'label') {
                        hasRequired = true; 
                        let $tableContainer = $(parentContainer).find(`[data-asformid="${blockId}"]`);
                        let $rows = $tableContainer.find(`[data-asformid*="${col.id}"], [id*="${col.id}"]`);
                        $rows = $rows.filter('input, select, textarea, .asf-textbox, .asf-listbox');

                        $rows.each(function() {
                            let $el = $(this);
                            if ($el.is(':visible')) {
                                let val = $el.val();
                                if (!val && ($el.is('div') || $el.is('span'))) {
                                    val = $el.text();
                                }
                                if (isValueInvalid(val)) {
                                    hasEmpty = true;
                                }
                            }
                        });
                    }
                });
            } 
            // --- ЛОГИКА ДЛЯ ОБЫЧНЫХ БЛОКОВ ---
            else if (blockView.tableModel.asfProperty) {
                const properties = blockView.tableModel.asfProperty.properties;
                if (properties && Array.isArray(properties)) {
                    properties.forEach(prop => {
                        if (prop.required === true && prop.type !== 'label') {
                            try {
                                const fieldView = view.playerView.getViewWithId(prop.id);
                                if (!fieldView) return;
                                
                                let isFieldVisible = true;
                                if (fieldView.tableModel && fieldView.tableModel.visible === false) isFieldVisible = false;
                                if (isFieldVisible && fieldView.model && fieldView.model.visible === false) isFieldVisible = false;
                                if (isFieldVisible && fieldView.container && fieldView.container[0]) {
                                    const $el = $(fieldView.container[0]);
                                    if ($el.css('display') === 'none' || $el.css('visibility') === 'hidden') isFieldVisible = false;
                                }

                                if (!isFieldVisible) return;

                                hasRequired = true;
                                if (!isFieldValidModel(fieldView, prop.type)) hasEmpty = true;
                            } catch(err) { }
                        }
                    });
                }
            }
        } catch (e) { }
    });

    return { hasRequired, hasEmpty };
};

// === 4. ИСПРАВЛЕННАЯ ФУНКЦИЯ ПРОВЕРКИ ПУСТОТЫ ТАБА ===
const isTabEmpty = (tabIndex) => {
    const tabData = tabsData[tabIndex];
    if (!tabData) return true;
    
    // Если таб явно скрыт через visible: false
    if (tabData.hasOwnProperty('visible') && tabData.visible === false) return true;
    
    // !!! ИСПРАВЛЕНИЕ !!!
    // Никогда не скрывать Блок модератора (по имени или по ID 'admin')
    if (tabData.name === 'Блок модератора' || tabData.id === 'admin') {
        return false;
    }

    // Если есть manualCheckIds, считаем таб заполненным
    if (tabData.manualCheckIds && tabData.manualCheckIds.length > 0) return false;

    const allBlocks = getAllTabBlocks(tabData);
    if (allBlocks.length === 0) return true;
    
    let hasVisibleBlock = false;
    allBlocks.forEach(blockId => {
        try {
            const blockView = view.playerView.getViewWithId(blockId);
            if (blockView && blockView.tableModel) {
                const isVisible = !blockView.tableModel.hasOwnProperty('visible') || blockView.tableModel.visible !== false;
                if (isVisible) hasVisibleBlock = true;
            }
        } catch (e) {}
    });
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
        while (currentIndex >= 0 && $(tabContainer.find('.tablinks')[currentIndex]).hasClass('hidden')) currentIndex--;
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
while (initialTabIndex < tabsData.length && $(tabContainer.find('.tablinks')[initialTabIndex]).hasClass('hidden')) initialTabIndex++;
if (initialTabIndex < tabsData.length) showTab(initialTabIndex);

setTimeout(() => { updateTabsValidation(); }, 500);
model.EVENT_TAB_LOADED = true;