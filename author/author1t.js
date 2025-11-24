/**
 * Скрипт автоматической смены автора записей при смене руководителя организации
 * Версия: 1.0
 */

var message;
var result = true;

/**
 * Конфигурация реестров с привязкой полей
 * Формат: { registryCode: 'код_реестра', fieldName: 'имя_поля_автора' }
 */
var REGISTRIES_CONFIG = [
    { registryCode: 'scope_accreditation', fieldName: 'entity_author' },
    { registryCode: 'passport_accreditation', fieldName: 'entity_author' },
    { registryCode: 'information_related_to_the_organization_and_personnel', fieldName: 'entity_user' },
    { registryCode: 'warehouse', fieldName: 'entity_author' },
    { registryCode: 'reg_passport_accreditation', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_conformity_processes_halal', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_quality_management_systems', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_enviromental_management_systems', fieldName: 'entity_author' },
    { registryCode: 'form_scope_accreditation_energy_management_system', fieldName: 'entity_author' },
    { registryCode: 'form3_accreditation_food_safety', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_information_security_management', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_ISMS', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_quality_management_system_medical_devices', fieldName: 'entity_author' },
    { registryCode: 'form', fieldName: 'entity_author' },
    { registryCode: 'register_accreditation_occupational_safety_management_system', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_laboratory', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_calibr_laboratory1', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_laboratory_medical', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_conformity_agriculture_GAP', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_staff_conformity', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_conformity_products_processes_services', fieldName: 'entity_author' },
    { registryCode: 'scope_audition_it_reg', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_proficiency_testing_provider', fieldName: 'entity_author' },
    { registryCode: 'register_new_management_scheme_application', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_inspection_body', fieldName: 'entity_author' },
    { registryCode: 'registry_social_responsibility_management_system', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_GHG_laboratory', fieldName: 'entity_author' },
    { registryCode: 'register_accreditation_food_products_safety', fieldName: 'entity_author' },
    { registryCode: 'register_accreditation_conformity_processes_products', fieldName: 'entity_author' },
    { registryCode: 'registry_obtain_accreditation_certificate_halal_parnikov', fieldName: 'entity_author' },
    { registryCode: 'registry_oblasti_akkreditatsii_organa_po_validatsii_i_verifikatsii_parnikovyh_gazov', fieldName: 'entity_author' }
];

/**
 * Получение всех записей старого руководителя из реестра
 * @param {string} registryCode - Код реестра
 * @param {string} fieldName - Имя поля с автором
 * @param {string} oldManagerID - UUID старого руководителя
 * @returns {Object} Ответ с данными записей
 */


function getRecordsByManager(registryCode, fieldName, oldManagerID) {
    try {
        var url = "rest/api/registry/data_ext?";
        url += "registryCode=" + registryCode;
        url += "&field=" + fieldName;
        url += "&condition=TEXT_EQUALS";
        url += "&key=" + oldManagerID;
        url += "&loadData=false";

        var response = API.httpGetMethod(url);
        return response;
    } catch (err) {
        return { data: [], count: 0, error: err.message };
    }
}

/**
 * Обновление автора записи
 * @param {string} dataUUID - UUID записи
 * @param {string} fieldName - Имя поля с автором
 * @param {string} newManagerID - UUID нового руководителя
 * @returns {Object} Результат обновления
 */

function updateRecordManager(dataUUID, fieldName, newManagerID) {
    try {

        var getFullName = API.getUserInfo(newManagerID)

        var res = API.mergeFormData({
            uuid: dataUUID,
            data: [{
                id: fieldName,
                type: "entity",
                value: getFullName.lastname + " " + getFullName.firstname + " " + getFullName.patronymic,
                key: newManagerID
            }]
        });
        return { success: true, uuid: dataUUID };
    } catch (err) {
        return { success: false, uuid: dataUUID, error: err.message };
    }
}

/**
 * Обработка одного реестра
 * @param {Object} registryConfig - Конфигурация реестра
 * @param {string} oldManagerID - UUID старого руководителя
 * @param {string} newManagerID - UUID нового руководителя
 * @returns {Object} Статистика обработки
 */

function processRegistry(registryConfig, oldManagerID, newManagerID) {
    var stats = {
        registryCode: registryConfig.registryCode,
        fieldName: registryConfig.fieldName,
        totalRecords: 0,
        successCount: 0,
        failedCount: 0,
        documentIDs: [],
        errors: []
    };

    try {
        var recordsResponse = getRecordsByManager(
            registryConfig.registryCode,
            registryConfig.fieldName,
            oldManagerID
        );

        if (recordsResponse.error) {
            stats.errors.push("Ошибка получения данных: " + recordsResponse.error);
            return stats;
        }

        if (!recordsResponse.data || recordsResponse.data.length === 0) {
            return stats;
        }

        var records = recordsResponse.data;
        stats.totalRecords = records.length;

        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var updateResult = updateRecordManager(
                record.dataUUID,
                registryConfig.fieldName,
                newManagerID
            );

            if (updateResult.success) {
                stats.successCount++;
                stats.documentIDs.push(record.documentID);
            } else {
                stats.failedCount++;
                stats.errors.push({
                    dataUUID: record.dataUUID,
                    documentID: record.documentID,
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
 * Основная функция смены руководителя
 * @param {string} oldManagerID - UUID старого руководителя
 * @param {string} newManagerID - UUID нового руководителя
 * @returns {Object} Общая статистика
 */
function changeManagerInAllRegistries(oldManagerID, newManagerID) {
    var totalStats = {
        startTime: new Date().toISOString(),
        oldManagerID: oldManagerID,
        newManagerID: newManagerID,
        registriesProcessed: 0,
        totalRecordsFound: 0,
        totalRecordsUpdated: 0,
        totalRecordsFailed: 0,
        registryStats: [],
        globalErrors: []
    };

    if (!oldManagerID || !newManagerID) {
        totalStats.globalErrors.push("Не указаны обязательные параметры: oldManagerID или newManagerID");
        return totalStats;
    }

    if (oldManagerID === newManagerID) {
        totalStats.globalErrors.push("Старый и новый ID руководителя не должны совпадать");
        return totalStats;
    }

    try {
        for (var i = 0; i < REGISTRIES_CONFIG.length; i++) {
            var registryConfig = REGISTRIES_CONFIG[i];

            var registryStats = processRegistry(registryConfig, oldManagerID, newManagerID);

            totalStats.registriesProcessed++;
            totalStats.totalRecordsFound += registryStats.totalRecords;
            totalStats.totalRecordsUpdated += registryStats.successCount;
            totalStats.totalRecordsFailed += registryStats.failedCount;

            if (registryStats.totalRecords > 0) {
                totalStats.registryStats.push(registryStats);
            }
        }

        totalStats.endTime = new Date().toISOString();
        totalStats.success = totalStats.totalRecordsFailed === 0;

    } catch (err) {
        totalStats.globalErrors.push("Критическая ошибка: " + err.message);
        totalStats.success = false;
    }

    return totalStats;
}

/**
 * Форматирование отчета
 * @param {Object} stats - Статистика выполнения
 * @returns {string} Отформатированный отчет
 */
function formatReport(stats) {
    var report = "=== ОТЧЕТ О СМЕНЕ РУКОВОДИТЕЛЯ ОРГАНИЗАЦИИ ===\n\n";
    report += "Старый руководитель (UUID): " + stats.oldManagerID + "\n";
    report += "Новый руководитель (UUID): " + stats.newManagerID + "\n";
    report += "Время выполнения: " + stats.startTime + " - " + (stats.endTime || "не завершено") + "\n\n";

    report += "--- ОБЩАЯ СТАТИСТИКА ---\n";
    report += "Обработано реестров: " + stats.registriesProcessed + "\n";
    report += "Всего найдено записей: " + stats.totalRecordsFound + "\n";
    report += "Успешно обновлено: " + stats.totalRecordsUpdated + "\n";
    report += "Ошибок при обновлении: " + stats.totalRecordsFailed + "\n";
    report += "Статус: " + (stats.success ? "УСПЕШНО" : "ЗАВЕРШЕНО С ОШИБКАМИ") + "\n\n";

    if (stats.globalErrors.length > 0) {
        report += "--- ГЛОБАЛЬНЫЕ ОШИБКИ ---\n";
        for (var i = 0; i < stats.globalErrors.length; i++) {
            report += (i + 1) + ". " + stats.globalErrors[i] + "\n";
        }
        report += "\n";
    }

    if (stats.registryStats.length > 0) {
        report += "--- ДЕТАЛИ ПО РЕЕСТРАМ ---\n\n";

        for (var j = 0; j < stats.registryStats.length; j++) {
            var regStats = stats.registryStats[j];

            report += "Реестр: " + regStats.registryCode + "\n";

            if (regStats.successCount > 0) {
                report += "В реестре " + regStats.registryCode + " изменен руководитель в записи с documentID: ";
                report += regStats.documentIDs.join(", ");
                report += "\n";
                report += "Автор изменен, общее количество измененных записей: " + regStats.successCount + "\n";
            }

            if (regStats.failedCount > 0) {
                report += "Ошибок при обновлении: " + regStats.failedCount + "\n";
                report += "Детали ошибок:\n";
                for (var k = 0; k < regStats.errors.length; k++) {
                    var err = regStats.errors[k];
                    if (typeof err === 'string') {
                        report += "  - " + err + "\n";
                    } else {
                        report += "  - dataUUID: " + err.dataUUID + ", documentID: " + err.documentID + ", ошибка: " + err.error + "\n";
                    }
                }
            }

            report += "\n";
        }
    }

    return report;
}



try {
    // Получение параметров
    // // Вариант 1: Из переменных процесса BPMN
    // var oldManagerID = processVariables.get("oldManagerID");
    // var newManagerID = processVariables.get("newManagerID");

    // Вариант 2: Из полей формы
    // var oldManagerID = formData.entity_old_manager;
    // var newManagerID = formData.entity_new_manager;

    // Вариант 3: Для тестирования
    var oldManagerID = "d1934af5-fae8-4ea2-9ab4-f58750d755fe";
    var newManagerID = "2ca997ca-f7c4-483e-bbba-e420574a2ab2";

    if (!oldManagerID || !newManagerID) {
        throw new Error("Не указаны обязательные параметры: oldManagerID или newManagerID");
    }

    // Выполнение смены руководителя
    var executionStats = changeManagerInAllRegistries(oldManagerID, newManagerID);
    // // Формирование отчета
    // var report = formatReport(executionStats);

    // // Установка результатов
    // message = report;
    // result = executionStats.success;

    // // Сохранение в переменные процесса
    // if (typeof processVariables !== 'undefined') {
    //     processVariables.set("managerChangeSuccess", executionStats.success);
    //     processVariables.set("managerChangeTotalRecords", executionStats.totalRecordsFound);
    //     processVariables.set("managerChangeUpdated", executionStats.totalRecordsUpdated);
    //     processVariables.set("managerChangeFailed", executionStats.totalRecordsFailed);
    // }
    message = JSON.stringify(executionStats)

} catch (err) {
    message = "КРИТИЧЕСКАЯ ОШИБКА: " + err.message;
    result = false;
}