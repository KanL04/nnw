/**
 * Скрипт автоматической смены автора записей при увольнении сотрудника
 * Инициация: завершение заявки на актуализацию сведений о персонале
 * 
 * Процесс:
 * 1. Получить userID увольняемого сотрудника
 * 2. Получить userID его непосредственного руководителя
 * 3. Заменить автора во всех записях и заявках
 * 4. Удалить учетную запись сотрудника (если требуется)
 */

var message;
var result = true;

/**
 * Список реестров для обработки
 */
var REGISTRIES_TO_PROCESS = [
    // Область Аккредитации
    'scope_accreditation',
    'passport_accreditation',
    'information_related_to_the_organization_and_personnel',
    'warehouse',
    'reg_passport_accreditation',
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
 * Получение информации о сотруднике из реестра персонала
 * @param {string} employeeUserID - UUID сотрудника
 * @returns {Object} Информация о сотруднике
 */
function getEmployeeInfo(employeeUserID) {
    try {
        var url = "rest/api/registry/data_ext?";
        url += "registryCode=information_related_to_the_organization_and_personnel";
        url += "&field=entity_user";
        url += "&condition=TEXT_EQUALS";
        url += "&key=" + employeeUserID;
        
        var response = API.httpGetMethod(url);
        
        if (response && response.result && response.result.length > 0) {
            return {
                found: true,
                data: response.result[0]
            };
        }
        
        return { found: false };
    } catch (err) {
        console.error("Ошибка при получении информации о сотруднике: " + err.message);
        return { found: false, error: err.message };
    }
}

/**
 * Получение руководителя сотрудника
 * @param {string} employeeUserID - UUID сотрудника
 * @returns {string|null} UUID руководителя
 */
function getEmployeeManager(employeeUserID) {
    try {
        var employeeInfo = getEmployeeInfo(employeeUserID);
        
        if (!employeeInfo.found) {
            console.error("Сотрудник не найден в реестре персонала");
            return null;
        }
        
        // Предполагается, что в реестре есть поле с руководителем
        // Замените на актуальное имя поля
        var managerID = employeeInfo.data.fieldKey.entity_manager || 
                       employeeInfo.data.fieldValue.entity_manager;
        
        if (!managerID) {
            console.error("У сотрудника не указан руководитель");
            return null;
        }
        
        return managerID;
    } catch (err) {
        console.error("Ошибка при получении руководителя: " + err.message);
        return null;
    }
}

/**
 * Получение всех записей сотрудника из указанного реестра
 * @param {string} registryCode - Код реестра
 * @param {string} employeeUserID - UUID сотрудника
 * @returns {Object} Ответ с данными записей
 */
function getEmployeeRecords(registryCode, employeeUserID) {
    try {
        var url = "rest/api/registry/data_ext?";
        url += "registryCode=" + registryCode;
        url += "&field=entity_author";
        url += "&condition=TEXT_EQUALS";
        url += "&key=" + employeeUserID;
        url += "&loadData=false";
        
        var response = API.httpGetMethod(url);
        return response;
    } catch (err) {
        console.error("Ошибка при получении записей из реестра " + registryCode + ": " + err.message);
        return { data: [], count: 0 };
    }
}

/**
 * Обновление автора записи
 * @param {string} dataUUID - UUID записи
 * @param {string} newManagerID - UUID нового автора (руководителя)
 * @returns {Object} Результат обновления
 */
function updateRecordAuthor(dataUUID, newManagerID) {
    try {
        var res = API.mergeFormData({
            uuid: dataUUID,
            data: [{
                id: "entity_author",
                type: "entity",
                value: "",
                key: newManagerID
            }]
        });
        return { success: true, uuid: dataUUID, result: res };
    } catch (err) {
        console.error("Ошибка при обновлении записи " + dataUUID + ": " + err.message);
        return { success: false, uuid: dataUUID, error: err.message };
    }
}

/**
 * Обработка одного реестра
 * @param {string} registryCode - Код реестра
 * @param {string} employeeUserID - UUID увольняемого сотрудника
 * @param {string} managerUserID - UUID руководителя
 * @returns {Object} Статистика обработки
 */
function processRegistry(registryCode, employeeUserID, managerUserID) {
    var stats = {
        registryCode: registryCode,
        totalRecords: 0,
        successCount: 0,
        failedCount: 0,
        errors: []
    };
    
    try {
        var recordsResponse = getEmployeeRecords(registryCode, employeeUserID);
        
        if (!recordsResponse || !recordsResponse.data) {
            stats.errors.push("Не удалось получить данные из реестра");
            return stats;
        }
        
        var records = recordsResponse.data;
        stats.totalRecords = records.length;
        
        if (records.length === 0) {
            return stats;
        }
        
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var updateResult = updateRecordAuthor(record.dataUUID, managerUserID);
            
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
 * Удаление учетной записи сотрудника из организации
 * ВНИМАНИЕ: Эта функция должна быть адаптирована под вашу систему
 * @param {string} employeeUserID - UUID сотрудника
 * @returns {Object} Результат удаления
 */
function deleteEmployeeAccount(employeeUserID) {
    try {
        // ВАЖНО: Замените на актуальный API метод удаления пользователя
        // Это примерный вариант, требует уточнения
        
        // Вариант 1: Через API удаления записи из реестра персонала
        var employeeInfo = getEmployeeInfo(employeeUserID);
        if (employeeInfo.found && employeeInfo.data.dataUUID) {
            // Пометить запись как удаленную или деактивированную
            var res = API.mergeFormData({
                uuid: employeeInfo.data.dataUUID,
                data: [{
                    id: "status",
                    type: "textbox",
                    value: "Уволен"
                }]
            });
            
            return { success: true, result: res };
        }
        
        // Вариант 2: Через специальный API метод (если есть)
        // var result = API.deleteUser(employeeUserID);
        
        return { success: false, error: "Сотрудник не найден" };
        
    } catch (err) {
        console.error("Ошибка при удалении учетной записи: " + err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Основная функция обработки увольнения сотрудника
 * @param {string} employeeUserID - UUID увольняемого сотрудника
 * @param {string} managerUserID - UUID руководителя (опционально)
 * @param {boolean} deleteAccount - Удалить учетную запись после обновления
 * @returns {Object} Общая статистика
 */
function processDismissal(employeeUserID, managerUserID, deleteAccount) {
    var totalStats = {
        startTime: new Date().toISOString(),
        employeeUserID: employeeUserID,
        managerUserID: managerUserID || null,
        registriesProcessed: 0,
        totalRecordsFound: 0,
        totalRecordsUpdated: 0,
        totalRecordsFailed: 0,
        accountDeleted: false,
        registryStats: [],
        globalErrors: []
    };
    
    try {
        // Если руководитель не указан, пытаемся получить его автоматически
        if (!managerUserID) {
            console.log("Попытка автоматического определения руководителя...");
            managerUserID = getEmployeeManager(employeeUserID);
            
            if (!managerUserID) {
                totalStats.globalErrors.push("Не удалось определить руководителя сотрудника");
                return totalStats;
            }
            
            totalStats.managerUserID = managerUserID;
            console.log("Руководитель определен: " + managerUserID);
        }
        
        // Валидация
        if (!employeeUserID) {
            totalStats.globalErrors.push("Не указан ID увольняемого сотрудника");
            return totalStats;
        }
        
        if (employeeUserID === managerUserID) {
            totalStats.globalErrors.push("ID сотрудника и руководителя не должны совпадать");
            return totalStats;
        }
        
        console.log("Начало обработки увольнения сотрудника");
        console.log("Сотрудник: " + employeeUserID);
        console.log("Новый автор (руководитель): " + managerUserID);
        
        // Обрабатываем все реестры
        for (var i = 0; i < REGISTRIES_TO_PROCESS.length; i++) {
            var registryCode = REGISTRIES_TO_PROCESS[i];
            
            console.log("Обработка реестра: " + registryCode + " (" + (i + 1) + " из " + REGISTRIES_TO_PROCESS.length + ")");
            
            var registryStats = processRegistry(registryCode, employeeUserID, managerUserID);
            
            totalStats.registriesProcessed++;
            totalStats.totalRecordsFound += registryStats.totalRecords;
            totalStats.totalRecordsUpdated += registryStats.successCount;
            totalStats.totalRecordsFailed += registryStats.failedCount;
            totalStats.registryStats.push(registryStats);
            
            console.log("Реестр " + registryCode + ": найдено=" + registryStats.totalRecords + 
                       ", обновлено=" + registryStats.successCount + 
                       ", ошибок=" + registryStats.failedCount);
        }
        
        // Удаление учетной записи (если требуется)
        if (deleteAccount === true && totalStats.totalRecordsFailed === 0) {
            console.log("Удаление учетной записи сотрудника...");
            var deleteResult = deleteEmployeeAccount(employeeUserID);
            totalStats.accountDeleted = deleteResult.success;
            
            if (!deleteResult.success) {
                totalStats.globalErrors.push("Не удалось удалить учетную запись: " + (deleteResult.error || "неизвестная ошибка"));
            } else {
                console.log("Учетная запись успешно удалена");
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
    var report = "=== ОТЧЕТ ОБ ОБРАБОТКЕ УВОЛЬНЕНИЯ СОТРУДНИКА ===\n";
    report += "Время начала: " + stats.startTime + "\n";
    report += "Время окончания: " + (stats.endTime || "не завершено") + "\n";
    report += "Увольняемый сотрудник (UUID): " + stats.employeeUserID + "\n";
    report += "Новый автор - руководитель (UUID): " + stats.managerUserID + "\n";
    report += "\n--- ОБЩАЯ СТАТИСТИКА ---\n";
    report += "Обработано реестров: " + stats.registriesProcessed + "\n";
    report += "Всего найдено записей: " + stats.totalRecordsFound + "\n";
    report += "Успешно обновлено: " + stats.totalRecordsUpdated + "\n";
    report += "Ошибок при обновлении: " + stats.totalRecordsFailed + "\n";
    report += "Учетная запись удалена: " + (stats.accountDeleted ? "ДА" : "НЕТ") + "\n";
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
        if (regStats.totalRecords > 0) {
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
    }
    
    return report;
}

// =====================================================
// ТОЧКА ВХОДА: Выполнение скрипта
// =====================================================

try {
    // Получение параметров из контекста
    
    // Вариант 1: Из переменных процесса BPMN
    var employeeUserID = processVariables.get("dismissedEmployeeUserID");
    var managerUserID = processVariables.get("managerUserID"); // может быть null
    var shouldDeleteAccount = processVariables.get("deleteEmployeeAccount") === true;
    
    // Вариант 2: Из полей формы
    // var employeeUserID = formData.entity_dismissed_employee;
    // var managerUserID = formData.entity_manager; // опционально
    // var shouldDeleteAccount = formData.checkbox_delete_account === true;
    
    // Вариант 3: Для тестирования
    // var employeeUserID = "2ca997ca-f7c4-483e-bbba-e420574a2ab2";
    // var managerUserID = null; // будет определен автоматически
    // var shouldDeleteAccount = false;
    
    if (!employeeUserID) {
        throw new Error("Не указан ID увольняемого сотрудника");
    }
    
    console.log("=== НАЧАЛО ПРОЦЕССА УВОЛЬНЕНИЯ СОТРУДНИКА ===");
    console.log("Сотрудник: " + employeeUserID);
    console.log("Руководитель: " + (managerUserID || "будет определен автоматически"));
    console.log("Удалить учетную запись: " + shouldDeleteAccount);
    
    // Выполнение процесса
    var executionStats = processDismissal(employeeUserID, managerUserID, shouldDeleteAccount);
    
    // Формирование отчета
    var report = formatReport(executionStats);
    
    console.log(report);
    
    // Установка результатов
    message = report;
    result = executionStats.success;
    
    // Сохранение в переменные процесса
    if (typeof processVariables !== 'undefined') {
        processVariables.set("dismissalSuccess", executionStats.success);
        processVariables.set("dismissalTotalRecords", executionStats.totalRecordsFound);
        processVariables.set("dismissalUpdated", executionStats.totalRecordsUpdated);
        processVariables.set("dismissalFailed", executionStats.totalRecordsFailed);
        processVariables.set("dismissalAccountDeleted", executionStats.accountDeleted);
    }
    
    console.log("=== ПРОЦЕСС ЗАВЕРШЕН ===");
    
} catch (err) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: " + err.message);
    console.error(err.stack);
    message = "КРИТИЧЕСКАЯ ОШИБКА: " + err.message;
    result = false;
}