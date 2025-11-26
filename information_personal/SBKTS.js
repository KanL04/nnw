const textbox_iccid = model.playerModel.getModelWithId('textbox_iccid');
const textbox_mark_evak = model.playerModel.getModelWithId('textbox_mark_evak');
const textbox_reg_name = model.playerModel.getModelWithId('textbox_reg_name');
const textbox_reg_status = model.playerModel.getModelWithId('textbox_reg_status');
const date_reg_date = model.playerModel.getModelWithId('date_reg_date');
const textbox_coordinates = model.playerModel.getModelWithId('textbox_coordinates');
const textbox_bin_ops = model.playerModel.getModelWithId('textbox_bin_ops');
const textbox_geo = model.playerModel.getModelWithId('textbox_geo'); // Проверяем это поле

const getCarDataByVIN = (vinCode) => {
  var headers = new Headers();
  return new Promise((resolve, reject) => {
    try {
      headers.append(
        'Authorization',
        'Basic ' + btoa('iNte9_nkT:GYDU?V5O~g')
      );

      const url = `https://techreg.gov.kz/CarCheck/VINCode?VINCode=${vinCode}`;

      fetch(url, { method: 'POST', headers: headers, redirect: 'follow' })
        .then(async (response) => {
          const text = await response.text();
          console.log('Ответ сервера (текст) для VIN:', text);
          
          if (!response.ok) {
            reject(new Error(text || `HTTP ${response.status}`));
            return;
          }
          
          try {
            const result = JSON.parse(text);
            resolve(result);
          } catch (parseError) {
            reject(new Error(text));
          }
        })
        .catch((error) => reject(error));
    } catch (e) {
      reject(e);
    }
  });
};

const getAccreditationDataByBIN = async (binCode) => {
  return new Promise((resolve, reject) => {
    try {
      const apiUtils = AS.FORMS?.ApiUtils;
      if (!apiUtils || typeof apiUtils.simpleAsyncGet !== 'function') {
        console.error('AS.FORMS.ApiUtils.simpleAsyncGet не доступен, используем fallback fetch');
        return fetchFallback(binCode).then(resolve).catch(reject);
      }

      const config = {
        registryCode: 'registr_certificate_accreditation_ru',
        searchField: 'textbox_bin',
        condition: 'CONTAINS',
        cordField: 'textbox_cord'
      };

      const searchInRegistry = async ({ registryCode, searchField, condition, cordField }) => {
        const params = new URLSearchParams();
        params.append('registryCode', registryCode);
        params.append('field', searchField);
        params.append('condition', condition);
        params.append('value', binCode);
        params.append('loadData', 'true');
        params.append('countInPart', '1');
        params.append('sortDesc', 'true');
        params.append('locale', AS.OPTIONS.locale || 'ru');
        const fieldsParam = `&fields=${cordField}`;
        const searchUrl = `rest/api/registry/data_ext?${params.toString()}${fieldsParam}`;

        console.log(`Поиск по БИН в ${registryCode} (field: ${searchField}, condition: ${condition}, cordField: ${cordField}):`, searchUrl);

        try {
          const response = await apiUtils.simpleAsyncGet(searchUrl);
          console.log('Полный ответ API:', JSON.stringify(response, null, 2));

          // Проверяем структуру ответа
          if (!response || typeof response !== 'object') {
            console.warn('Ответ сервера пуст или не является объектом');
            return null;
          }

          let data = response.result || response.data; // Пробуем оба варианта
          console.log('Извлечённые данные:', JSON.stringify(data, null, 2));

          if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn(`Запись не найдена в ${registryCode} для ${searchField} с condition ${condition}`);
            return null;
          }

          const selectedRecord = data[0];
          let foundCord = null;

          const fieldValue = selectedRecord.fieldValue || {};
          foundCord = fieldValue[cordField] || null;
          console.log(`Значение ${cordField} из fieldValue в ${registryCode}:`, foundCord);

          if (!foundCord && selectedRecord.dataUUID) {
            try {
              if (typeof apiUtils.loadAsfData === 'function') {
                const { data: asfData } = await apiUtils.loadAsfData(selectedRecord.dataUUID);
                console.log(`asfData для ${registryCode}:`, JSON.stringify(asfData, null, 2));

                const cordItem = Array.isArray(asfData) ? asfData.find(item => 
                  (item.id === cordField || item.componentId === cordField)
                ) : null;
                foundCord = extractAsfValue(cordItem);
                console.log(`Извлеченное значение ${cordField} из asfData в ${registryCode}:`, foundCord);
              } else {
                console.warn('loadAsfData не доступен');
              }
            } catch (e) {
              console.error(`Ошибка загрузки asfData для ${registryCode}:`, e.message);
            }
          }

          return foundCord;
        } catch (e) {
          console.error(`Ошибка запроса в ${registryCode} (field: ${searchField}, condition: ${condition}):`, e.message);
          if (e.responseText) {
            console.log('Ответ сервера (сырой):', e.responseText);
          }
          return null;
        }
      };

      searchInRegistry(config).then((result) => {
        console.log('Финальное значение textbox_cord:', result);
        resolve(result);
      }).catch(reject);

    } catch (e) {
      console.error('Общая ошибка в getAccreditationDataByBIN:', e.message);
      resolve(null);
    }
  });
};

const fetchFallback = (binCode) => {
  return new Promise((resolve, reject) => {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa('iNte9_nkT:GYDU?V5O~g'));
    const params = new URLSearchParams();
    params.append('registryCode', 'registr_certificate_accreditation_ru');
    params.append('field', 'textbox_bin');
    params.append('condition', 'CONTAINS');
    params.append('value', binCode);
    params.append('loadData', 'true');
    params.append('countInPart', '1');
    params.append('sortDesc', 'true');
    params.append('locale', 'ru');
    params.append('fields', 'textbox_cord');
    const url = `https://techreg.gov.kz/Synergy/rest/api/registry/data_ext?${params.toString()}`;

    fetch(url, { method: 'GET', headers, redirect: 'follow' })
      .then(async (response) => {
        if (!response.ok) {
          console.error('Fetch fallback ошибка:', response.status, await response.text());
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetch fallback ответ:', JSON.stringify(data, null, 2));
        const selectedRecord = data.result && data.result[0];
        let cordValue = selectedRecord?.fieldValue?.textbox_cord || null;
        resolve(cordValue);
      })
      .catch(reject);
  });
};

const extractAsfValue = (item) => {
  if (!item) return undefined;
  const { value, key, valueID, type, username, ...rest } = item;
  if (type === 'listbox' && key !== undefined && key !== null && key !== '') return key;
  if (type === 'reglink' && (valueID || key)) return valueID || key;
  if (value !== undefined && value !== null && value !== '') return value;
  if (username !== undefined && username !== null && username !== '') return username;
  if (rest && rest.valueText) return rest.valueText;
  if (rest && rest.text) return rest.text;
  return undefined;
};

function formatApiDateToPickerValue(apiDateStr) {
  if (!apiDateStr) return '';
  const safeDateStr = apiDateStr.includes('T') ? apiDateStr : apiDateStr.replace('+', 'T00:00:00+');
  const parsedDate = new Date(safeDateStr);
  if (isNaN(parsedDate.getTime())) return '';
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const getLocalizedText = (locale) => {
  const texts = {
    ru: {
      search: "Поиск",
      searching: "Поиск...",
      invalidVin: "Введен некорректный VIN-код",
      serviceUnavailable: "Сервис временно недоступен",
      emptyBinOps: "Поле BIN/OPS не заполнено",
      noDataFound: "Данные по БИН не найдены в реестре",
      geoFieldError: "Поле textbox_geo не найдено или не может быть заполнено"
    },
    kz: {
      search: "Іздеу",
      searching: "Іздеу...",
      invalidVin: "VIN-код қате енгізілді",
      serviceUnavailable: "Қызмет уақытша қолжетімсіз",
      emptyBinOps: "BIN/OPS өрісі толтырылмаған",
      noDataFound: "БИН бойынша деректер тізілімде табылмады",
      geoFieldError: "textbox_geo өрісі табылмады немесе толтырылмайды"
    },
    en: {
      search: "Search",
      searching: "Searching...",
      invalidVin: "Invalid VIN code entered",
      serviceUnavailable: "Service temporarily unavailable",
      emptyBinOps: "BIN/OPS field is empty",
      noDataFound: "No data found for BIN in the registry",
      geoFieldError: "Field textbox_geo not found or cannot be filled"
    }
  };
  return texts[locale] || texts.ru;
};

const handleSearch = async (searchButton) => {
  const currentLocale = AS.OPTIONS.locale || "ru";
  const texts = getLocalizedText(currentLocale);
  const vinCodeValue = model.getValue();
  const binOpsValue = textbox_bin_ops?.getValue()?.trim();

  if (!binOpsValue) {
    AS.SERVICES.showErrorMessage(texts.emptyBinOps);
    return;
  }

  // Раскомментируйте для проверки VIN
  /*
  if (!vinCodeValue || vinCodeValue.trim().length < 10) {
    AS.SERVICES.showErrorMessage(texts.invalidVin);
    return;
  }
  */

  searchButton.prop("disabled", true);
  const originalText = searchButton.text();
  searchButton.text(texts.searching);

  AS.SERVICES.showWaitWindow();

  try {
    let carResponseData = null;
    if (vinCodeValue) {
      carResponseData = await getCarDataByVIN(vinCodeValue.trim());
      const data = carResponseData?.response?.data || carResponseData;

      console.log('Полный ответ API для VIN:', carResponseData);
      console.log('Данные для заполнения от VIN:', data);

      if (data) {
        textbox_iccid?.setValue(data.ICCID || '');
        textbox_mark_evak?.setValue(data.Модель || data["Модель"] || '');
        textbox_reg_name?.setValue(data["Имя регистратора"] || '');
        textbox_reg_status?.setValue(data.RegistrationState || '');
        date_reg_date?.setValue(formatApiDateToPickerValue(data.RegistrationDate));
        textbox_coordinates?.setValue(data.LastCallDate || '');
        // Поле textbox_geo рядом с этим блоком
        if (textbox_geo) {
          textbox_geo.setValue(''); // Очищаем перед заполнением
          console.log('textbox_geo инициализировано перед заполнением');
        }

        console.log('ICCID:', data.ICCID);
        console.log('Модель:', data.Модель);
        console.log('Имя регистратора:', data["Имя регистратора"]);
        console.log('Статус регистрации:', data.RegistrationState);
        console.log('Дата регистрации:', formatApiDateToPickerValue(data.RegistrationDate));
        console.log('Последний вызов:', data.LastCallDate);
      }
    }

    const cordValue = await getAccreditationDataByBIN(binOpsValue);
    console.log('Полученное cordValue:', cordValue);

    if (cordValue) {
      if (textbox_geo) {
        try {
          textbox_geo.setValue(cordValue);
          textbox_geo.trigger('change'); // Синхронизация для ASF
          console.log('textbox_geo заполнено значением:', cordValue);
        } catch (e) {
          console.error('Ошибка при заполнении textbox_geo:', e.message);
          AS.SERVICES.showErrorMessage(texts.geoFieldError);
          // Попытка заполнения через jQuery как fallback
          jQuery('#textbox_geo').val(cordValue).trigger('change');
          console.log('Попытка заполнения textbox_geo через jQuery:', cordValue);
        }
      } else {
        console.error('textbox_geo не найдено в модели');
        AS.SERVICES.showErrorMessage(texts.geoFieldError);
        // Попытка заполнения через jQuery
        jQuery('#textbox_geo').val(cordValue).trigger('change');
        console.log('Попытка заполнения textbox_geo через jQuery (модель не найдена):', cordValue);
      }
    } else {
      console.log('Значение textbox_cord не найдено в реестре');
      textbox_geo?.setValue('');
      AS.SERVICES.showErrorMessage(texts.noDataFound);
    }

    searchButton.text(originalText);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    AS.SERVICES.showErrorMessage(texts.serviceUnavailable);
    
    searchButton.prop("disabled", false);
    searchButton.text(originalText);
  } finally {
    AS.SERVICES.hideWaitWindow();
  }
};

const initSearchButton = () => {
  if (!view || !view.container || !view.textBox) {
    console.error("View или его компоненты не найдены");
    return;
  }

  if (!textbox_bin_ops) {
    console.error("textbox_bin_ops не найден в модели");
    return;
  }

  console.log('Проверка textbox_geo:', textbox_geo ? 'Найдено' : 'Не найдено');

  const currentLocale = AS.OPTIONS.locale || "ru";
  const texts = getLocalizedText(currentLocale);

  view.textBox.css({
    width: "70%",
    display: "inline-block",
    "vertical-align": "top"
  });

  const buttonContainer = jQuery("<div></div>").css({
    display: "inline-block",
    width: "25%",
    "margin-left": "10px",
    "vertical-align": "top"
  });

  const searchButton = jQuery("<button></button>")
    .text(texts.search)
    .addClass("asf-button asf-search-button")
    .css({
      width: "100%",
      height: "28px",
      "font-size": "14px",
      cursor: "pointer",
      border: "1px solid #ccc",
      background: "#f8f8f8",
      "border-radius": "4px"
    })
    .hover(
      function () {
        if (!jQuery(this).prop("disabled")) {
          jQuery(this).css("background", "#e8e8e8");
        }
      },
      function () {
        if (!jQuery(this).prop("disabled")) {
          jQuery(this).css("background", "#f8f8f8");
        }
      }
    );

  const updateButtonState = () => {
    const vinValue = view.textBox.getValue?.()?.trim() || 
                     view.textBox.val()?.trim() || 
                     model.getValue()?.trim();
    const binOpsValue = textbox_bin_ops.getValue()?.trim();

    console.log("VIN value (val):", view.textBox.val());
    console.log("VIN value (getValue):", view.textBox.getValue?.());
    console.log("VIN value (model.getValue):", model.getValue());
    console.log("BIN/OPS value:", binOpsValue);

    const isButtonEnabled = binOpsValue; // Временная проверка только BIN
    // Для проверки VIN: const isButtonEnabled = vinValue && binOpsValue;

    searchButton.prop("disabled", !isButtonEnabled);

    if (!isButtonEnabled) {
      console.log("Кнопка заблокирована. Причина:", 
        !vinValue ? "VIN пуст" : "", 
        !binOpsValue ? "BIN/OPS пуст" : "");
    } else {
      console.log("Кнопка разблокирована");
    }
  };

  updateButtonState();

  searchButton.on("click", function (e) {
    e.preventDefault();
    if (!jQuery(this).prop("disabled")) {
      handleSearch(jQuery(this));
    }
  });

  buttonContainer.append(searchButton);
  view.container.append(buttonContainer);

  view.textBox.on("valueChange", (event) => {
    console.log("VIN value changed:", event?.value || view.textBox.val() || view.textBox.getValue?.());
    updateButtonState();
  });

  textbox_bin_ops.on("valueChange", (event) => {
    console.log("BIN/OPS value changed:", event?.value || textbox_bin_ops.getValue());
    updateButtonState();
  });

  view.textBox.on("input change", () => {
    console.log("VIN input changed:", view.textBox.val());
    updateButtonState();
  });

  console.log("Кнопка поиска успешно добавлена");
};

try {
  initSearchButton();
} catch (error) {
  console.error("Ошибка при инициализации кнопки поиска:", error);
}