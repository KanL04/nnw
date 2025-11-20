/**
 * Скрипт автоматической смены автора записей
 * Для реестра information_personal
 * Инициация: страница регистрации при смене руководителя
 */

var message;
var result = true;

/**
 * Конфигурация реестров для обработки
 * Полный список реестров из таблицы
 */
var REGISTRIES_TO_PROCESS = [
    // Область Аккредитации
    'scope_accreditation',
    'passport_accreditation',
    'information_related_to_the_organization_and_personnel',
    'warehouse',
    
    // Реестр Паспорт (аккредитация)
    'reg_passport_accreditation',
    
    // Реестры областей аккредитации
    'registr_scope_accreditation_conformity_processes_halal',
    'registry_scope_accreditation_quality_management_systems',
    'registry_scope_accreditation_enviromental_management_systems',
    'form_scope_accreditation_energy_management_system',
    'form3_accreditation_food_safety',
    'registrycode=registry_scope_accreditation_information_security_management',
    'registry_scope_accreditation_ISMS',
    'registry_scope_accreditation_quality_management_system_medical_devices',
    'form',
    'register_accreditation_occupational_safety_management_system',
    'registry_scope_accreditation_laboratory',
    'registry_scope_accreditation_calibr_laboratory1',
    'registry_scope_accreditation_laboratory_medical',
    'registr_scope_accreditation_conformity_agriculture_GAP',
    'registr_scope_accreditation_staff_conformity',
    'registr_scope_accreditation_conformity_products_processes_services',
    'scope_audition_it_reg',
    'registry_scope_accreditation_proficiency_testing_provider',
    'register_new_management_scheme_application',
    'registry_scope_accreditation_inspection_body',
    'registry_social_responsibility_management_system',
    'registry_scope_accreditation_GHG_laboratory',
    'register_accreditation_food_products_safety',
    'register_accreditation_conformity_processes_products',
    'registry_obtain_accreditation_certificate_halal_parnikov',
    'h_gazzov'
];

/**
 * Получение всех записей старого автора из указанного реестра
 * @param {string} registryCode - Код реестра
 * @param {string} oldUserID - UUID старого автора
 * @returns {Object} Ответ с данными записей
 */
function getRecordsByAuthor(registryCode, oldUserID) {
    var url = "rest/api/registry/data_ext?";
    url += "registryCode=" + registryCode;
    url += "&field=entity_author";
    url += "&condition=TEXT_EQUALS";
    url += "&key=" + oldUserID;
    url += "&loadData=false";
    
    try {
        var response = API.httpGetMethod(url);
        return response;
    } catch (err) {
        console.error("Ошибка при получении записей из реестра " + registryCode + ": " + err.message);
        return { data: [], count: 0 };
    }
}

/**
 * Обновление автора для одной записи
 * @param {string} dataUUID - UUID записи
 * @param {string} newUserID - UUID нового автора
 * @returns {Object} Результат обновления
 */
function updateRecordAuthor(dataUUID, newUserID) {
    try {
        var res = API.mergeFormData({
            uuid: dataUUID,
            data: [{
                id: "entity_author",
                type: "entity",
                value: "",
                key: newUserID
            }]
        });
        return { success: true, uuid: dataUUID, result: res };
    } catch (err) {
        console.error("Ошибка при обновлении записи " + dataUUID + ": " + err.message);
        return { success: false, uuid: dataUUID, error: err.message };
    }
}

/**
 * Обработка одного реестра - смена автора во всех записях
 * @param {string} registryCode - Код реестра
 * @param {string} oldUserID - UUID старого автора
 * @param {string} newUserID - UUID нового автора
 * @returns {Object} Статистика обработки
 */
function processRegistry(registryCode, oldUserID, newUserID) {
    var stats = {
        registryCode: registryCode,
        totalRecords: 0,
        successCount: 0,
        failedCount: 0,
        errors: []
    };
    
    try {
        // Получаем все записи старого автора
        var recordsResponse = getRecordsByAuthor(registryCode, oldUserID);
        
        if (!recordsResponse || !recordsResponse.data) {
            stats.errors.push("Не удалось получить данные из реестра");
            return stats;
        }
        
        var records = recordsResponse.data;
        stats.totalRecords = records.length;
        
        if (records.length === 0) {
            return stats; // Нет записей для обновления
        }
        
        // Обновляем каждую запись
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var updateResult = updateRecordAuthor(record.dataUUID, newUserID);
            
            if (updateResult.success) {
                stats.successCount++;
            } else {
                stats.failedCount++;
                stats.errors.push({
                    uuid: record.dataUUID,
                    error: updateResult.error
                });
            }
        }
        
    } catch (err) {
        stats.errors.push("Критическая ошибка: " + err.message);
    }
    
    return stats;
}

/**
 * Основная функция смены автора записей
 * @param {string} oldUserID - UUID старого руководителя/сотрудника
 * @param {string} newUserID - UUID нового руководителя
 * @param {Array} registriesToProcess - Массив кодов реестров (опционально)
 * @returns {Object} Общая статистика по всем реестрам
 */
function changeAuthorInAllRegistries(oldUserID, newUserID, registriesToProcess) {
    var totalStats = {
        startTime: new Date().toISOString(),
        oldUserID: oldUserID,
        newUserID: newUserID,
        registriesProcessed: 0,
        totalRecordsFound: 0,
        totalRecordsUpdated: 0,
        totalRecordsFailed: 0,
        registryStats: [],
        globalErrors: []
    };
    
    // Валидация входных параметров
    if (!oldUserID || !newUserID) {
        totalStats.globalErrors.push("Не указаны обязательные параметры: oldUserID или newUserID");
        return totalStats;
    }
    
    if (oldUserID === newUserID) {
        totalStats.globalErrors.push("Старый и новый userID не должны совпадать");
        return totalStats;
    }
    
    // Определяем список реестров для обработки
    var registries = registriesToProcess || REGISTRIES_TO_PROCESS;
    
    try {
        // Обрабатываем каждый реестр
        for (var i = 0; i < registries.length; i++) {
            var registryCode = registries[i];
            
            console.log("Обработка реестра: " + registryCode + " (" + (i + 1) + " из " + registries.length + ")");
            
            var registryStats = processRegistry(registryCode, oldUserID, newUserID);
            
            totalStats.registriesProcessed++;
            totalStats.totalRecordsFound += registryStats.totalRecords;
            totalStats.totalRecordsUpdated += registryStats.successCount;
            totalStats.totalRecordsFailed += registryStats.failedCount;
            totalStats.registryStats.push(registryStats);
            
            console.log("Реестр " + registryCode + ": найдено=" + registryStats.totalRecords + 
                       ", обновлено=" + registryStats.successCount + 
                       ", ошибок=" + registryStats.failedCount);
        }
        
        totalStats.endTime = new Date().toISOString();
        totalStats.success = totalStats.totalRecordsFailed === 0;
        
    } catch (err) {
        totalStats.globalErrors.push("Критическая ошибка выполнения: " + err.message);
        totalStats.success = false;
    }
    
    return totalStats;
}

/**
 * Форматирование отчета о выполнении
 * @param {Object} stats - Статистика выполнения
 * @returns {string} Отформатированный отчет
 */
function formatReport(stats) {
    var report = "=== ОТЧЕТ О СМЕНЕ АВТОРА ЗАПИСЕЙ ===\n";
    report += "Время начала: " + stats.startTime + "\n";
    report += "Время окончания: " + (stats.endTime || "не завершено") + "\n";
    report += "Старый автор (UUID): " + stats.oldUserID + "\n";
    report += "Новый автор (UUID): " + stats.newUserID + "\n";
    report += "\n--- ОБЩАЯ СТАТИСТИКА ---\n";
    report += "Обработано реестров: " + stats.registriesProcessed + "\n";
    report += "Всего найдено записей: " + stats.totalRecordsFound + "\n";
    report += "Успешно обновлено: " + stats.totalRecordsUpdated + "\n";
    report += "Ошибок при обновлении: " + stats.totalRecordsFailed + "\n";
    report += "Статус: " + (stats.success ? "УСПЕШНО" : "ЗАВЕРШЕНО С ОШИБКАМИ") + "\n";
    
    if (stats.globalErrors.length > 0) {
        report += "\n--- ГЛОБАЛЬНЫЕ ОШИБКИ ---\n";
        for (var i = 0; i < stats.globalErrors.length; i++) {
            report += (i + 1) + ". " + stats.globalErrors[i] + "\n";
        }
    }
    
    report += "\n--- ДЕТАЛИ ПО РЕЕСТРАМ ---\n";
    for (var j = 0; j < stats.registryStats.length; j++) {
        var regStats = stats.registryStats[j];
        report += "\nРеестр: " + regStats.registryCode + "\n";
        report += "  Найдено записей: " + regStats.totalRecords + "\n";
        report += "  Обновлено: " + regStats.successCount + "\n";
        report += "  Ошибок: " + regStats.failedCount + "\n";
        
        if (regStats.errors.length > 0) {
            report += "  Детали ошибок:\n";
            for (var k = 0; k < regStats.errors.length && k < 5; k++) {
                var err = regStats.errors[k];
                if (typeof err === 'string') {
                    report += "    - " + err + "\n";
                } else {
                    report += "    - UUID: " + err.uuid + ", Ошибка: " + err.error + "\n";
                }
            }
            if (regStats.errors.length > 5) {
                report += "    ... и еще " + (regStats.errors.length - 5) + " ошибок\n";
            }
        }
    }
    
    return report;
}

// =====================================================
// ТОЧКА ВХОДА: Выполнение скрипта
// =====================================================

try {
    // ВАЖНО: Получите эти значения из контекста формы/процесса
    // Например, из переменных процесса или полей формы
    
    // Вариант 1: Получение из переменных процесса (если запуск из BPMN)
    var oldUserID = processVariables.get("oldUserID");
    var newUserID = processVariables.get("newUserID");
    
    // Вариант 2: Получение из полей формы (если запуск со страницы)
    // var oldUserID = formData.entity_old_author; 
    // var newUserID = formData.entity_new_author;
    
    // Вариант 3: Жесткое указание для тестирования
    // var oldUserID = "2ca997ca-f7c4-483e-bbba-e420574a2ab2"; // Старый руководитель
    // var newUserID = "f968d1c4-2bf6-4c57-9e21-ba8e93f696ab"; // Новый руководитель
    
    if (!oldUserID || !newUserID) {
        throw new Error("Не указаны обязательные параметры: oldUserID или newUserID");
    }
    
    console.log("Начало процесса смены автора записей");
    console.log("Старый автор: " + oldUserID);
    console.log("Новый автор: " + newUserID);
    
    // Выполняем смену автора во всех реестрах
    var executionStats = changeAuthorInAllRegistries(oldUserID, newUserID);
    
    // Формируем отчет
    var report = formatReport(executionStats);
    
    console.log(report);
    
    // Устанавливаем результат для