// --- 1. СПИСОК ID КОМПОНЕНТОВ ---
// Мы используем частичные имена, чтобы умная функция нашла их, даже если есть суффиксы -b1
const COMPONENT_IDS = {
  speciality: "textbox_speciality",       // На форме: textbox_speciality-b1
  year: "textbox_year_university",        // На форме: textbox_year_university-b1
  university: "textarea_university",      // На форме: textarea_university-b1
  diploma: "textbox_diploma_number",      // На форме: textbox_diploma_number-b1
  type: "listbox_type_education",         // Обычно тоже имеет суффикс
  table: "table_education"
};

// --- 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const validateIIN = (iin) => {
  if (!iin || typeof iin !== "string") return false;
  const cleanIIN = iin.replace(/\s/g, "");
  return /^\d{12}$/.test(cleanIIN);
};

// Достает 4 цифры года из даты вида "2016-06-28"
function extractYear(dateStr) {
  if (!dateStr) return "";
  const str = String(dateStr);
  const match = str.match(/^(\d{4})/);
  return match ? match[1] : "";
}

// === УМНАЯ ФУНКЦИЯ ЗАПОЛНЕНИЯ (Ищет по части ID) ===
const smartSetValue = (partialId, value, label) => {
  if (value === undefined || value === null || value === "") {
    console.log(`[ПРОПУСК] Данных для "${label}" нет.`);
    return;
  }
  
  const strValue = String(value).trim(); // Превращаем в строку

  console.log(`🔍 Ищем поле для "${label}" с ID похожим на "${partialId}"...`);

  // 1. Ищем элемент через jQuery (по частичному совпадению ID)
  // Это найдет и "textbox_speciality", и "textbox_speciality-b1", и "cmp_textbox_speciality"
  let jqEl = jQuery(`[id*='${partialId}']`).first();

  if (jqEl.length > 0) {
    // Если нашли - пытаемся найти внутри input или textarea
    let input = jqEl.find("input, textarea, select").addBack("input, textarea, select").first();
    
    if (input.length > 0) {
      input.val(strValue);
      // Эмулируем ввод пользователя (важно!)
      input.trigger('input').trigger('change').trigger('blur');
      
      // Доп. событие для сложных форм
      try {
        input[0].dispatchEvent(new Event('input', { bubbles: true }));
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
      } catch(e){}

      console.log(`✅ [УСПЕХ] Поле "${label}" заполнено значением: "${strValue}"`);
      return;
    } else {
      // Если это просто текст (label)
      jqEl.text(strValue);
      console.log(`✅ [УСПЕХ] Текст "${label}" обновлен.`);
      return;
    }
  }

  // 2. Если jQuery не нашел, пробуем официальную модель (на всякий случай)
  try {
    const modelComp = model.playerModel.getModelWithId(partialId) || model.playerModel.getModelWithId(partialId + "-b1");
    if (modelComp && typeof modelComp.setValue === 'function') {
      modelComp.setValue(strValue);
      console.log(`✅ [MODEL] Поле "${label}" заполнено через API.`);
      return;
    }
  } catch (e) {}

  console.warn(`❌ [ОШИБКА] Поле с ID содержащим "${partialId}" не найдено на форме!`);
};

const getData = async (iin) => {
  try {
    var headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa('iNte9_nkT:GYDU?V5O~g'));
    
    const url = "https://techreg.gov.kz/EPVO_digital_docs/getdata?IIN=" + iin;

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      redirect: 'follow'
    });

    if (!response.ok) throw new Error("HTTP " + response.status);
    
    const rawData = await response.json();
    
    if (rawData["ns2:syncSendMessageResponse"]?.responseData?.data) {
      return rawData["ns2:syncSendMessageResponse"].responseData.data;
    }
    return rawData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const handleSearch = async (searchButton) => {
  const currentLocale = AS.OPTIONS.locale || "ru";
  const texts = {
    ru: { search: "Поиск", searching: "Ищем...", invalidIIN: "Неверный ИИН", noData: "Данные не найдены" },
    kz: { search: "Іздеу", searching: "Іздеу...", invalidIIN: "Қате ЖСН", noData: "Деректер жоқ" }
  };
  const t = texts[currentLocale] || texts.ru;
  
  const iinValue = model.getValue();
  if (!validateIIN(iinValue)) {
    AS.SERVICES.showErrorMessage(t.invalidIIN);
    return;
  }

  searchButton.prop("disabled", true).text(t.searching);
  AS.SERVICES.showWaitWindow();

  try {
    const res = await getData(iinValue.replace(/\s/g, ""));
    
    let studentData = null;
    if (res && res.studentInfos) {
      studentData = Array.isArray(res.studentInfos) ? res.studentInfos[0] : res.studentInfos;
    } else if (res && res.mgovHighEducations) {
      studentData = res.mgovHighEducations;
    }

    if (studentData) {
      console.log("Данные студента получены:", studentData);

      // --- 1. СПЕЦИАЛЬНОСТЬ (Извлекаем строку из nameRu/nameKz!) ---
      // Данные: { nameRu: "Землеустройство", ... }
      let specObj = studentData.educationProgramGroup;
      if (!specObj) specObj = studentData.educationProgram; // запасной вариант
      
      const specName = currentLocale === "kz" 
          ? (specObj ? specObj.nameKz : "") 
          : (specObj ? specObj.nameRu : "");
      
      console.log(`Специальность (строка): "${specName}"`);

      // --- 2. ГОД ОКОНЧАНИЯ ---
      const diplomaObj = studentData.diploma || {};
      const yearVal = extractYear(diplomaObj.finishOrderDate);
      console.log(`Год (строка): "${yearVal}"`);

      // --- 3. ВУЗ ---
      const uniObj = studentData.university;
      const uniName = currentLocale === "kz" 
          ? (uniObj ? uniObj.nameKz : "") 
          : (uniObj ? uniObj.nameRu : "");

      // --- 4. НОМЕР ДИПЛОМА ---
      const dipNum = diplomaObj.diplomaNumber || studentData.documentSeriesId;

      // --- 5. ТИП ОБРАЗОВАНИЯ ---
      const degreeObj = studentData.AcademicDegree || studentData.academicDegree;
      const degreeCode = degreeObj?.code;
      let typeVal = "001"; // Высшее
      if (String(degreeCode) === "2" || String(degreeCode) === "02") typeVal = "002"; // Послевузовское


      // --- ЗАПОЛНЕНИЕ ПОЛЕЙ (Ищем по части ID) ---
      
      smartSetValue(COMPONENT_IDS.speciality, specName, "Специальность");
      smartSetValue(COMPONENT_IDS.year, yearVal, "Год окончания");
      smartSetValue(COMPONENT_IDS.university, uniName, "ВУЗ");
      smartSetValue(COMPONENT_IDS.diploma, dipNum, "Номер диплома");
      smartSetValue(COMPONENT_IDS.type, typeVal, "Тип образования");

      // --- ЗАПОЛНЕНИЕ ТАБЛИЦЫ ---
      // Таблица требует особого подхода, так как ID строк динамические
      const table_education = model.playerModel.getModelWithId("table_education");
      if (table_education && table_education.modelBlocks && table_education.modelBlocks.length > 0) {
         try {
             const rowIndex = table_education.modelBlocks[0].tableBlockIndex;
             
             // Для таблицы используем стандартный API, так как мы знаем структуру блоков
             const tableUni = model.playerModel.getModelWithId("textarea_university", "table_education", rowIndex);
             if (tableUni && uniName) tableUni.setValue(String(uniName));
             
             const tableDip = model.playerModel.getModelWithId("textbox_diploma_number", "table_education", rowIndex);
             if (tableDip && dipNum) tableDip.setValue(String(dipNum));
             
         } catch(e) { console.warn("Таблица не заполнена:", e); }
      }

    } else {
      AS.SERVICES.showErrorMessage(t.noData);
    }
  } catch (err) {
    console.error(err);
    AS.SERVICES.showErrorMessage("Ошибка сервиса");
  } finally {
    searchButton.prop("disabled", false).text(t.search);
    AS.SERVICES.hideWaitWindow();
  }
};

const initSearchButton = () => {
  if (!view || !view.textBox) return;
  
  view.textBox.css({ width: "70%", display: "inline-block" });
  const btnDiv = jQuery("<div></div>").css({ display: "inline-block", width: "25%", marginLeft: "10px" });
  const btn = jQuery("<button>Поиск</button>").addClass("asf-button").css({ width: "100%", height: "28px" });
  
  btn.on("click", (e) => { e.preventDefault(); handleSearch(btn); });
  btnDiv.append(btn);
  view.container.append(btnDiv);
};

try { initSearchButton(); } catch(e) { console.error(e); }