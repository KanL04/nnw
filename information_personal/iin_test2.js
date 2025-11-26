const table_education = model.playerModel.getModelWithId("table_education");


const listbox_type_education = model.playerModel.getModelWithId("listbox_type_education");
const textbox_speciality = model.playerModel.getModelWithId("textbox_speciality");
const textarea_university = model.playerModel.getModelWithId("textarea_university");
const textbox_year_university = model.playerModel.getModelWithId("textbox_year_university");

// Функция валидации ИИН (упрощенная - можно доработать)
const validateIIN = (iin) => {
  if (!iin || typeof iin !== "string") return false;
  // Убираем пробелы и проверяем что только цифры и длина 12
  const cleanIIN = iin.replace(/\s/g, "");
  return /^\d{12}$/.test(cleanIIN);
};

const getData = async (iin, isMock = false) => {
  

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
      return data; 
    }
  } catch (error) {
    console.error("Ошибка при запросе данных:", error);
    throw error;
  }
};

// форматирование даты с апишки
function formatApiDateToYear(apiDateStr) {
  if (!apiDateStr) return '';
  const safeDateStr = apiDateStr.includes('T') ? apiDateStr : apiDateStr.replace('+', 'T00:00:00+');
  const parsedDate = new Date(safeDateStr);
  if (isNaN(parsedDate.getTime())) return '';
  return parsedDate.getFullYear().toString();
}

const getLocalizedText = (locale) => {
  const texts = {
    ru: {
      search: "Поиск",
      searching: "Поиск...",
      invalidIIN: "Некорректный ИИН. Введите 12 цифр.",
      networkError: "Ошибка сети. Попробуйте позже.",
      noData: "Данные не найдены",
      fillIIN: "Введите ИИН для поиска",
      dataFilled: "Данные успешно заполнены"
    },
    kz: {
      search: "Іздеу",
      searching: "Іздеу...",
      invalidIIN: "Дұрыс емес ЖСН. 12 санды енгізіңіз.",
      networkError: "Желі қатесі. Кейінірек қайталаңыз.",
      noData: "Деректер табылмады",
      fillIIN: "Іздеу үшін ЖСН енгізіңіз",
      dataFilled: "Деректер сәтті толтырылды"
    },
    en: {
      search: "Search",
      searching: "Searching...",
      invalidIIN: "Invalid IIN. Enter 12 digits.",
      networkError: "Network error. Try again later.",
      noData: "Data not found",
      fillIIN: "Enter IIN to search",
      dataFilled: "Data successfully filled"
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

  // Блокировка кнопки поиск
  searchButton.prop("disabled", true);
  const originalText = searchButton.text();
  searchButton.text(texts.searching);

  
  AS.SERVICES.showWaitWindow();

  try {
    const res = await getData(iinValue.replace(/\s/g, ""), true);

    console.log('Полный ответ API:', res);

    if (res.status.code === "001" && res.mgovHighEducations) {
      const eduData = res.mgovHighEducations;
      
      // Заполнение полей формы данными из апишки
      try {
        
        if (listbox_type_education && eduData.templateCode) {
          
          const typeMapping = {
            "001": "Высшее образование",
            "002": "Послевузовское образование"
          };
          const typeValue = typeMapping[eduData.templateCode] || eduData.templateCode;
          listbox_type_education.setValue(typeValue);
          console.log('Заполнен тип образования:', typeValue);
        }

        
        if (textbox_speciality) {
          const speciality = currentLocale === "kz" 
            ? eduData.awardedQualificationKz 
            : eduData.awardedQualificationRu;
          if (speciality) {
            textbox_speciality.setValue(speciality);
            console.log('Заполнена специальность:', speciality);
          }
        }

     
        if (textarea_university) {
          const university = currentLocale === "kz" 
            ? eduData.universityNameKz 
            : eduData.universityNameRu;
          if (university) {
            textarea_university.setValue(university);
            console.log('Заполнен университет:', university);
          }
        }

        
        if (textbox_year_university && eduData.finishDateDiploma) {
          const year = formatApiDateToYear(eduData.finishDateDiploma);
          if (year) {
            textbox_year_university.setValue(year);
            console.log('Заполнен год окончания:', year);
          }
        }

      } catch (formFieldsError) {
        console.error("Ошибка при заполнении полей формы:", formFieldsError);
      }

      
      if (table_education) {
        try {
          const firstRowIndex = table_education.modelBlocks[0]?.tableBlockIndex;
          if (firstRowIndex !== undefined) {
            
            const universityComponent = model.playerModel.getModelWithId("textarea_university", "table_education", firstRowIndex);
            if (universityComponent) {
              const university = currentLocale === "kz" 
                ? eduData.universityNameKz 
                : eduData.universityNameRu;
              if (university) {
                universityComponent.setValue(university);
                console.log('Заполнен университет в таблице:', university);
              }
            }

           
            const diplomaNumberComponent = model.playerModel.getModelWithId("textbox_diploma_number", "table_education", firstRowIndex);
            if (diplomaNumberComponent && eduData.diplomaNumber) {
              diplomaNumberComponent.setValue(eduData.diplomaNumber);
              console.log('Заполнен номер диплома в таблице:', eduData.diplomaNumber);
            }
          }
        } catch (directAccessError) {
          console.warn("Не удалось заполнить через прямое обращение к таблице:", directAccessError);
        }

        console.log("Данные успешно загружены и заполнены");
      } else {
        console.warn("Таблица table_education не найдена");
      }

      
      searchButton.text(originalText);
      console.log("Все поля успешно заполнены, кнопка заблокирована");
      
    } else {
     
      const errorMessage = currentLocale === "kz" ? res.status.nameKz : res.status.nameRu;
      AS.SERVICES.showErrorMessage(errorMessage || texts.noData);

    
      searchButton.prop("disabled", false);
      searchButton.text(originalText);
      console.log("Ошибка при получении данных:", errorMessage);
    }
  } catch (error) {
    console.error("Ошибка при поиске:", error);
    AS.SERVICES.showErrorMessage(texts.networkError);

  
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
    const iinValue = model.getValue()?.trim();
    const hasValue = iinValue && iinValue.length > 0;
    
    
    if (hasValue && searchButton.prop("disabled")) {
      searchButton.prop("disabled", false);
    }
  };

  searchButton.on("click", function (e) {
    e.preventDefault();
    if (!jQuery(this).prop("disabled")) {
      handleSearch(jQuery(this));
    }
  });

  buttonContainer.append(searchButton);
  view.container.append(buttonContainer);

  view.textBox.on("input change", function () {
    updateButtonState();
  });

  view.textBox.on("valueChange", function (event) {
    updateButtonState();
  });

};

try {
  initSearchButton();
} catch (error) {
  console.error("Ошибка при инициализации кнопки поиска:", error);
}