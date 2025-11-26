const table_education = model.playerModel.getModelWithId("table_education");

// Функция валидации ИИН (упрощенная - можно доработать)
const validateIIN = (iin) => {
  if (!iin || typeof iin !== "string") return false;
  // Убираем пробелы и проверяем что только цифры и длина 12
  const cleanIIN = iin.replace(/\s/g, "");
  return /^\d{12}$/.test(cleanIIN);
};

const getData = async (iin, isMock = false) => {
  if (isMock)
    return {
      mgovHighEducations: {
        templateCode: "002",
        universityNameRu: "Северо-Казахстанский университет им.М.Козыбаева",
        universityNameKz: "М.Қозыбаев атындағы Солтүстік Қазақстан университеті",
        firstname: "Rustem",
        lastname: "Soltan",
        patronymic: "",
        honoursdiploma: false,
        awardedDegreeRu: "тест",
        awardedDegreeKz: "тест",
        awardedQualificationRu: "тест",
        awardedQualificationKz: "тест",
        protocolNumber: "",
        diplomaSeries: "ТКБ",
        diplomaNumber: "0074691",
        finishDateDiploma: "2010-06-30T00:00:00+05:00",
        katoNameRu: "г.Петропавловск",
        katoNameKz: "Петропавл қ.",
        regdiplomnumber: "123",
        dateDissertationDefense: "2024-09-02T00:00:00+05:00"
      },
      status: {
        code: "001",
        nameRu: "Успешно обработано. Сведения найдены",
        nameKz: "Сәтті өңделді. Ақпарат табылды"
      }
    };

  try {
    const response = await fetch(`${window.location.origin}/EPVO_digital_docs/getdata?RequestorBIN=940440000574&IIN=${iin}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Проверяем структуру ответа
    if (data.responseData && data.responseData.data) {
      return data.responseData.data;
    } else {
      return data; // если структура простая как в моке
    }
  } catch (error) {
    console.error("Ошибка при запросе данных:", error);
    throw error;
  }
};

const getLocalizedText = (locale) => {
  const texts = {
    ru: {
      search: "Поиск",
      searching: "Поиск...",
      invalidIIN: "Некорректный ИИН. Введите 12 цифр.",
      networkError: "Ошибка сети. Попробуйте позже.",
      noData: "Данные не найдены",
      fillIIN: "Введите ИИН для поиска"
    },
    kz: {
      search: "Іздеу",
      searching: "Іздеу...",
      invalidIIN: "Дұрыс емес ЖСН. 12 санды енгізіңіз.",
      networkError: "Желі қатесі. Кейінірек қайталаңыз.",
      noData: "Деректер табылмады",
      fillIIN: "Іздеу үшін ЖСН енгізіңіз"
    },
    en: {
      search: "Search",
      searching: "Searching...",
      invalidIIN: "Invalid IIN. Enter 12 digits.",
      networkError: "Network error. Try again later.",
      noData: "Data not found",
      fillIIN: "Enter IIN to search"
    }
  };

  return texts[locale] || texts.ru;
};

const handleSearch = async (searchButton) => {
  const currentLocale = AS.OPTIONS.locale || "ru";
  const texts = getLocalizedText(currentLocale);
  const iinValue = model.getValue();

  // Валидация ИИН
  if (!validateIIN(iinValue)) {
    AS.SERVICES.showErrorMessage(texts.invalidIIN);
    return;
  }

  // Блокируем кнопку и меняем текст
  searchButton.prop("disabled", true);
  const originalText = searchButton.text();
  searchButton.text(texts.searching);

  try {
    // Делаем запрос (используем мок для тестирования)
    const res = await getData(iinValue.replace(/\s/g, ""), true);

    if (res.status.code === "001" && res.mgovHighEducations) {
      // Работа с динамической таблицей
      if (table_education) {
        try {
          const firstRowIndex = table_education.modelBlocks[0]?.tableBlockIndex;
          if (firstRowIndex !== undefined) {
            // Заполняем университет
            const universityComponent = model.playerModel.getModelWithId("textarea_university", "table_education", firstRowIndex);
            if (universityComponent && res.mgovHighEducations?.universityNameRu) {
              universityComponent.setValue(res.mgovHighEducations.universityNameRu);
            }

            // Заполняем номер диплома
            const diplomaNumberComponent = model.playerModel.getModelWithId("textbox_diploma_number", "table_education", firstRowIndex);
            if (diplomaNumberComponent && res.mgovHighEducations?.diplomaNumber) {
              diplomaNumberComponent.setValue(res.mgovHighEducations.diplomaNumber);
            }
          }
        } catch (directAccessError) {
          console.warn("Не удалось заполнить через прямое обращение:", directAccessError);
        }

        console.log("Данные успешно загружены и заполнены в таблицу");
      } else {
        console.error("Таблица table_education не найдена");
      }

      // После успешного заполнения кнопка остается заблокированной
      searchButton.text(originalText);
    } else {
      // Если статус не успешный, показываем ошибку
      const errorMessage = currentLocale === "kz" ? res.status.nameKz : res.status.nameRu;
      AS.SERVICES.showErrorMessage(errorMessage || texts.noData);

      // Разблокируем кнопку при ошибке
      searchButton.prop("disabled", false);
      searchButton.text(originalText);
    }
  } catch (error) {
    console.error("Ошибка при поиске:", error);
    AS.SERVICES.showErrorMessage(texts.networkError);

    // Разблокируем кнопку при ошибке сети
    searchButton.prop("disabled", false);
    searchButton.text(originalText);
  }
};

// Основная логика создания кнопки
const initSearchButton = () => {
  if (!view || !view.container || !view.textBox) {
    console.error("View или его компоненты не найдены");
    return;
  }

  const currentLocale = AS.OPTIONS.locale || "ru";
  const texts = getLocalizedText(currentLocale);

  // Изменяем ширину input'а
  view.textBox.css({
    width: "70%",
    display: "inline-block",
    "vertical-align": "top"
  });

  // Создаем контейнер для кнопки
  const buttonContainer = jQuery("<div></div>").css({
    display: "inline-block",
    width: "25%",
    "margin-left": "10px",
    "vertical-align": "top"
  });

  // Создаем кнопку поиска
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

  // Добавляем обработчик клика
  searchButton.on("click", function (e) {
    e.preventDefault();
    if (!jQuery(this).prop("disabled")) {
      handleSearch(jQuery(this));
    }
  });

  // Добавляем кнопку в контейнер и контейнер в форму
  buttonContainer.append(searchButton);
  view.container.append(buttonContainer);

  // Обработчик изменения значения в поле ИИН
  view.textBox.on("input change", function () {
    const hasValue = jQuery(this).val().trim().length > 0;
    if (hasValue && searchButton.prop("disabled")) {
      // Если в поле есть значение и кнопка заблокирована, разблокируем её
      searchButton.prop("disabled", false);
    }
  });

  console.log("Кнопка поиска успешно добавлена");
};

// Инициализируем кнопку поиска
try {
  initSearchButton();
} catch (error) {
  console.error("Ошибка при инициализации кнопки поиска:", error);
}
