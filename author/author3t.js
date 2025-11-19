

var message = "";
var result = true;

/**
 * Список реестров для обработки
 */
var REGISTRIES_TO_PROCESS = [
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
    'registry_scope_accreditation_information_security_management',
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
    'registry_oblasti_akkreditatsii_organa_po_validatsii_i_verifikatsii_parnikovyh_gazov'
];

// --- ФУНКЦИИ ---

function getEmployeeInfo(employeeUserID) {
    try {
        var url = "rest/api/registry/data_ext?";
        url += "registryCode=information_related_to_the_organization_and_personnel";
        url += "&field=entity_user";
        url += "&condition=TEXT_EQUALS";
        url += "&key=" + employeeUserID;
        
        var response = API.httpGetMethod(url);
        
        if (response && response.result && response.result.length > 0) {
            return { found: true, data: response.result[0] };
        }
        return { found: false };
    } catch (err) {
        return { found: false, error: err.message };
    }
}

function getEmployeeManager(employeeUserID) {
    try {
        var employeeInfo = getEmployeeInfo(employeeUserID);
        
        if (!employeeInfo.found) {
            return null;
        }
        
        var managerID = null;
        if (employeeInfo.data.fieldKey && employeeInfo.data.fieldKey.entity_manager) {
            managerID = employeeInfo.data.fieldKey.entity_manager;
        } else if (employeeInfo.data.fieldValue && employeeInfo.data.fieldValue.entity_manager) {
             managerID = employeeInfo.data.fieldValue.entity_manager;
        }

        return managerID;
    } catch (err) {
        return null;
    }
}

function getEmployeeRecords(registryCode, employeeUserID) {
    try {
        var url = "rest/api/registry/data_ext?";
        url += "registryCode=" + registryCode;
        url += "&field=entity_author";
        url += "&condition=TEXT_EQUALS";
        url += "&key=" + employeeUserID;
        url += "&loadData=false";
        url += "&count=100"; 
        
        return API.httpGetMethod(url);
    } catch (err) {
        return { data: [], count: 0 };
    }
}

function updateRecordAuthor(dataUUID, newManagerID) {
    try {
        var res = API.mergeFormData({
            uuid: dataUUID,
            data: [{
                id: "entity_author",
                type: "entity",
                key: newManagerID,
                value: "Автозамена"
            }]
        });
        return { success: true, uuid: dataUUID, result: res };
    } catch (err) {
        return { success: false, uuid: dataUUID, error: err.message };
    }
}

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
        
        if (!recordsResponse || !recordsResponse.result) {
            return stats;
        }
        
        var records = recordsResponse.result;
        stats.totalRecords = records.length;
        
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var updateResult = updateRecordAuthor(record.dataUUID, managerUserID);
            
            if (updateResult.success) {
                stats.successCount++;
            } else {
                stats.failedCount++;
                stats.errors.push(updateResult.error);
            }
        }
        
    } catch (err) {
        stats.errors.push("Ошибка реестра: " + err.message);
    }
    
    return stats;
}

function deleteEmployeeAccount(employeeUserID) {
    try {
        var employeeInfo = getEmployeeInfo(employeeUserID);
        if (employeeInfo.found && employeeInfo.data.dataUUID) {
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
        return { success: false, error: "Сотрудник не найден для удаления" };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

function processDismissal(employeeUserID, managerUserID, deleteAccount) {
    var totalStats = {
        startTime: new Date().toISOString(),
        employeeUserID: employeeUserID,
        managerUserID: managerUserID,
        registriesProcessed: 0,
        totalRecordsFound: 0,
        totalRecordsUpdated: 0,
        totalRecordsFailed: 0,
        accountDeleted: false,
        registryStats: [],
        globalErrors: []
    };
    
    try {
        if (!managerUserID) {
            managerUserID = getEmployeeManager(employeeUserID);
            if (managerUserID) {
                totalStats.managerUserID = managerUserID;
            } else {
                totalStats.globalErrors.push("Не удалось автоматически определить руководителя.");
                return totalStats;
            }
        }
        
        for (var i = 0; i < REGISTRIES_TO_PROCESS.length; i++) {
            var regCode = REGISTRIES_TO_PROCESS[i];
            var regStats = processRegistry(regCode, employeeUserID, managerUserID);
            
            totalStats.registriesProcessed++;
            totalStats.totalRecordsFound += regStats.totalRecords;
            totalStats.totalRecordsUpdated += regStats.successCount;
            totalStats.totalRecordsFailed += regStats.failedCount;
            totalStats.registryStats.push(regStats);
        }
        
        if (deleteAccount === true) {
            var delRes = deleteEmployeeAccount(employeeUserID);
            totalStats.accountDeleted = delRes.success;
            if (!delRes.success) totalStats.globalErrors.push("Ошибка удаления: " + delRes.error);
        }
        
        totalStats.success = (totalStats.totalRecordsFailed === 0 && totalStats.globalErrors.length === 0);
        totalStats.endTime = new Date().toISOString();
        
    } catch (err) {
        totalStats.globalErrors.push("Критический сбой: " + err.message);
        totalStats.success = false;
    }
    
    return totalStats;
}

// --- ЗАПУСК ---

try {
    // 1. Кого увольняем (ID из формы)
    var employeeUserID = execution.getVariable("dismissedEmployeeUserID"); 
    
    // 2. Новый руководитель (ID из формы)
    var managerUserID = execution.getVariable("managerUserID"); 
    
    // 3. Удалять ли аккаунт (Boolean)
    var shouldDeleteAccount = execution.getVariable("deleteEmployeeAccount"); 

    if (!employeeUserID) {
        throw new Error("Не получен ID увольняемого сотрудника");
    }

    var stats = processDismissal(employeeUserID, managerUserID, shouldDeleteAccount);
    
    message = "Обработано: " + stats.totalRecordsUpdated + ". Ошибок: " + stats.totalRecordsFailed;
    if (stats.accountDeleted) message += ". Статус сменен на Уволен.";
    
    // Если были ошибки, добавляем детали в message
    if (stats.globalErrors.length > 0) {
        message += " Ошибки: " + JSON.stringify(stats.globalErrors);
    }

} catch (err) {
    message = "Критическая ошибка скрипта: " + err.message;
    result = false;
}