
/*
model.tabs = [];
model.tabs.push({name: '', blocks: [], accordion: [
  {titleID: '', open: true, blocks: []}
]});

@param name - наименование таба
@param blocks - массив, перечисление ID компонентов которые будут входить в данный блок.
@param accordion.titleID - ID компонента на форме с типом label для заголовка блока
@param accordion.open - true/false, открытый или закрытый блок
@param accordion.blocks - массив, перечисление ID компонентов которые будут входить в данный блок.
*/

async function setVisibleEl() {
    model.cmps = model.cmps
        .map(id => view.playerView.getViewWithId(id))
        .filter(Boolean);

    if (model.cmps.length === 0) return;

    try {
        const res = await AS.FORMS.ApiUtils.simpleAsyncGet('rest/api/person/auth?getGroups=true');
        const hasAccess = res.groups.some(g => model.groups.includes(g.groupCode));

        
        if (!hasAccess) {
            // Удаляем таб с id = 'admin', если его нет в группах пользователя
            model.tabs = model.tabs.filter(tab => tab.id !== 'admin');
        }
      

        model.cmps.forEach(cmp => cmp.setVisible(hasAccess));
        return hasAccess; // возвращаем, чтобы использовать дальше
    } catch (err) {
        console.error('Ошибка проверки групп:', err);
        model.cmps.forEach(cmp => cmp.setVisible(false));

        // Даже при ошибке — убираем админский таб (безопасность превыше)
        model.tabs = model.tabs.filter(tab => tab.id !== 'admin');

        return false;
    }
}
function tabs() {
    let asfPlayerView = $(view.container[0]).find('.asf-playerView');
    if (!view.playerView.container[0].contains(view.container[0])) return;
    model.EVENT_TAB_LOADED = false;
    if (model.EVENT_TAB_LOADED) return;

    let parentContainer = view.playerView.container;

    // Создание контейнера для табов
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

    // Функция проверки валидности поля (включая регулярные выражения)
    const isFieldValid = (fieldView, fieldType) => {
        if (!fieldView || !fieldView.model) return false;

        const value = fieldView.model.value;
        const key = fieldView.model.key;

        // Проверка для listbox
        if (fieldType === 'listbox') {
            const isEmpty = key === "0" || key === 0 || value === null || value === undefined || value === '' || value === 'Не выбрано';
            if (fieldView.model.getSpecialErrors) {
                try {
                    const errors = fieldView.model.getSpecialErrors();
                    if (errors && typeof errors === 'object' && errors.errorCode) {
                        return false; // Поле невалидно, если getSpecialErrors возвращает ошибку
                    }
                } catch (e) {
                    return false; // Ошибка при вызове getSpecialErrors считается недействительным состоянием
                }
            }
            return !isEmpty; // Если нет ошибок или getSpecialErrors не определено
        }

        // Проверка на пустоту для всех типов
        if (value === null || value === undefined || value === '') {
            return false;
        }

        // Проверка регулярного выражения для textbox и других полей
        if (fieldView.tableModel && fieldView.tableModel.asfProperty) {
            const config = fieldView.tableModel.asfProperty.config;

            // Если есть regex валидация
            if (config && config.regExp === true && config['input-mask']) {
                try {
                    const regex = new RegExp(config['input-mask']);
                    const isValid = regex.test(value);
                    return isValid;
                } catch (e) {
                    return false; // Ошибка в regex считается недействительным состоянием
                }
            }
        }

        // Проверка через встроенную валидацию модели (если есть)
        if (fieldView.model.validate) {
            try {
                const validationResult = fieldView.model.validate();
                return validationResult === true || validationResult === null || validationResult === undefined;
            } catch (e) {
                return false; // Ошибка валидации считается недействительным состоянием
            }
        }

        // Проверка через getSpecialErrors (для listbox с кастомной валидацией)
        if (fieldView.model.getSpecialErrors) {
            try {
                const errors = fieldView.model.getSpecialErrors();
                return !errors; // Если есть ошибки, поле невалидно
            } catch (e) {
                return false; // Ошибка при вызове getSpecialErrors считается недействительным состоянием
            }
        }

        // Если поле заполнено и нет других проверок - считаем валидным
        return true;
    };

    // Функция для получения всех блоков таба (включая accordion)
    const getAllTabBlocks = (tabData) => {
        let allBlocks = [];

        // Добавляем обычные блоки
        if (tabData.blocks && Array.isArray(tabData.blocks)) {
            allBlocks = [...tabData.blocks];
        }

        // Добавляем блоки из accordion
        if (tabData.accordion && Array.isArray(tabData.accordion)) {
            tabData.accordion.forEach(acc => {
                if (acc.blocks && Array.isArray(acc.blocks)) {
                    allBlocks = [...allBlocks, ...acc.blocks];
                }
            });
        }

        return allBlocks;
    };

    // Функция проверки наличия обязательных полей в табе
    const checkRequiredFields = (tabIndex) => {
        const tabData = tabsData[tabIndex];
        if (!tabData) return { hasRequired: false, hasEmpty: false };

        let hasRequired = false;
        let hasEmpty = false;

        // Получаем все блоки (обычные + из accordion)
        const allBlocks = getAllTabBlocks(tabData);

        allBlocks.forEach(blockId => {
            try {
                const blockView = view.playerView.getViewWithId(blockId);
                if (blockView && blockView.tableModel && blockView.tableModel.asfProperty) {
                    // Проверяем видимость блока
                    const isBlockVisible = !blockView.tableModel.hasOwnProperty('visible') || blockView.tableModel.visible !== false;
                    if (!isBlockVisible) {
                        return; // Пропускаем скрытые блоки
                    }

                    const properties = blockView.tableModel.asfProperty.properties;

                    if (properties && Array.isArray(properties)) {
                        properties.forEach(prop => {
                            if (prop.required === true && prop.type !== 'label') {
                                try {
                                    const fieldView = view.playerView.getViewWithId(prop.id);

                                    if (!fieldView) {
                                        return; // Поле не найдено
                                    }

                                    // Проверяем видимость поля - может быть в разных местах
                                    let isFieldVisible = true;

                                    // Проверка 1: через tableModel.visible
                                    if (fieldView.tableModel && fieldView.tableModel.hasOwnProperty('visible')) {
                                        isFieldVisible = fieldView.tableModel.visible !== false;
                                    }

                                    // Проверка 2: через model.visible (если есть)
                                    if (isFieldVisible && fieldView.model && fieldView.model.hasOwnProperty('visible')) {
                                        isFieldVisible = fieldView.model.visible !== false;
                                    }

                                    // Проверка 3: через DOM элемент
                                    if (isFieldVisible && fieldView.container && fieldView.container[0]) {
                                        const $el = $(fieldView.container[0]);
                                        const displayStyle = $el.css('display');
                                        const visibilityStyle = $el.css('visibility');
                                        if (displayStyle === 'none' || visibilityStyle === 'hidden') {
                                            isFieldVisible = false;
                                        }
                                    }

                                    if (!isFieldVisible) {
                                        return; // Пропускаем скрытые поля
                                    }

                                    hasRequired = true;

                                    if (!isFieldValid(fieldView, prop.type)) {
                                        hasEmpty = true;
                                    }
                                } catch (e) {
                                    // Ошибка при доступе к полю - не считаем это ошибкой валидации
                                    console.warn('Error checking field:', prop.id, e);
                                }
                            }
                        });
                    }
                }
            } catch (e) {
                // Ошибка игнорируется
            }
        });

        return { hasRequired, hasEmpty };
    };

    // Функция проверки, пустой ли таб или все его блоки скрыты
    const isTabEmpty = (tabIndex) => {
        const tabData = tabsData[tabIndex];
        if (!tabData) return true;
        if (tabData.hasOwnProperty('visible') && tabData.visible === false) return true;

        const allBlocks = getAllTabBlocks(tabData);
        if (allBlocks.length === 0) return true;

        // Проверяем: есть ли хоть один блок В DOM (самый надёжный способ)
        for (const blockId of allBlocks) {
            console.log(blockId, allBlocks)
            if ($(parentContainer).find(`[data-asformid$=".container.${blockId}"]`).length > 0) {
                return false; // найден → таб НЕ пустой
            }
        }

        return true; // ничего не найдено → скрываем таб
    };

    // Функция обновления визуального состояния табов
    const updateTabsValidation = () => {
        tabsData.forEach((item, i) => {
            const tabButton = $(tabContainer.find('.tablinks')[i]);
            const validation = checkRequiredFields(i);

            // Проверяем, пустой ли таб или все блоки скрыты
            if (isTabEmpty(i)) {
                tabButton.addClass('hidden');
            } else {
                tabButton.removeClass('hidden');
                if (validation.hasRequired && validation.hasEmpty) {
                    tabButton.addClass('has-error'); // Таб с ошибкой, если есть обязательные и недействительные поля
                } else {
                    tabButton.removeClass('has-error'); // Убираем ошибку только если все обязательные поля валидны
                }
            }
        });
    };

    // Глобальная функция для валидации из внешних скриптов
    model.validateTabs = () => {
        updateTabsValidation();

        // Проверяем, есть ли табы с ошибками
        let hasErrors = false;
        tabsData.forEach((item, i) => {
            // Пропускаем скрытые табы
            if (isTabEmpty(i)) return;
            const validation = checkRequiredFields(i);
            if (validation.hasRequired && validation.hasEmpty) {
                hasErrors = true;
            }
        });

        return !hasErrors;
    };

    // Функция для отображения текущего таба
    const showTab = (index) => {
        if (index < 0 || index >= tabsData.length) return;

        let currentIndex = index;
        let tabButton = $(tabContainer.find('.tablinks')[currentIndex]);

        // Пропускаем скрытые табы
        while (tabButton.hasClass('hidden') && currentIndex < tabsData.length) {
            currentIndex++;
            tabButton = $(tabContainer.find('.tablinks')[currentIndex]);
        }

        // Если индекс вышел за пределы, возвращаемся к последнему видимому табу
        if (currentIndex >= tabsData.length) {
            currentIndex = tabsData.length - 1;
            while (currentIndex >= 0 && $(tabContainer.find('.tablinks')[currentIndex]).hasClass('hidden')) {
                currentIndex--;
            }
            if (currentIndex < 0) {
                return; // Нет видимых табов
            }
        }

        // Скрываем все табы и деактивируем кнопки
        tabContainer.find('.tabcontent').removeClass('active');
        tabContainer.find('.tablinks').removeClass('active');

        // Отображаем текущий таб и активируем соответствующую кнопку
        $(tabContainer.find('.tabcontent')[currentIndex]).addClass('active');
        $(tabContainer.find('.tablinks')[currentIndex]).addClass('active');

        currentTabIndex = currentIndex;
        model.currentTabIndex = currentIndex;

        // Обновляем валидацию при смене таба
        updateTabsValidation();
    };

    model.showTab = showTab;

    tabContainer.append(tab);
    $(view.container).append(tabContainer);
    if (model.hasOwnProperty('tabs')) tabsData = model.tabs;

    // Генерация табов и их контента
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

        // Проверяем, пустой ли таб или все блоки скрыты
        if (isTabEmpty(i)) {
            tabButton.addClass('hidden');
        }

        // Если таб явно скрыт
        if (item.hasOwnProperty('visible') && item.visible === false) {
            tabButton.addClass('hidden');
        }

        tab.append(tabButton);
        tabContainer.append(tabcontent);

        tabButton.on('click', () => {
            showTab(i);
        });

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

    // Инициализируем первый видимый таб
    let initialTabIndex = 0;
    while (initialTabIndex < tabsData.length && $(tabContainer.find('.tablinks')[initialTabIndex]).hasClass('hidden')) {
        initialTabIndex++;
    }
    if (initialTabIndex < tabsData.length) {
        showTab(initialTabIndex);
    }

    // Первичная проверка валидации
    setTimeout(() => {
        updateTabsValidation();
    }, 500);

    // Устанавливаем флаг загрузки табов
    model.EVENT_TAB_LOADED = true;
}

(async () => {
    await setVisibleEl();
    await new Promise(r => setTimeout(r, 200)); // ← важно!
    tabs();
})();