var result = true;
var message = 'ok';

// Конфигурация реестров где нужно менять автора
var REGISTRIES_CONFIG = [
    { registryCode: "registry_applications", fieldName: "entity_author" },
    { registryCode: "registry_requests", fieldName: "entity_author" },
    { registryCode: "registry_waybills", fieldName: "entity_author" },
    // Добавьте другие реестры при необходимости
];

try {
    let currentFormData = API.getFormData(dataUUID);
    let employeeReg = UTILS.getValue(currentFormData, "reglink_delete");

    if (!employeeReg || !employeeReg.hasOwnProperty('key')) {
        throw new Error('Сотрудник для удаления не найден');
    }

    // ID сотрудника которого нужно удалить из организации
    let employeeID = employeeReg.key;

    // Получаем данные организации и руководителя
    let organizationData = UTILS.getValue(currentFormData, "entity_organization_copy1");
    if (!organizationData || !organizationData.key) {
        throw new Error('Не найдена информация об организации');
    }

    // Получаем данные организации
    let orgFormData = API.getFormData(API.getAsfDataId(organizationData.key));
    let managerData = UTILS.getValue(orgFormData, "entity_manager");
    
    if (!managerData || !managerData.key) {
        throw new Error('Не найден руководитель организации');
    }

    let managerID = managerData.key;

    // Проверка что не пытаемся удалить самого руководителя
    if (employeeID === managerID) {
        throw new Error('Невозможно удалить руководителя организации. Сначала назначьте нового руководителя.');
    }

    let executionStats = null;

    //  ФУНКЦИИ СМЕНЫ АВТОРА
    
    function getRecordsByEmployee(registryCode, fieldName, employeeID) {
        try {
         
            var url = "rest/api/registry/data_ext?";
            url += "registryCode=" + registryCode;
            url += "&field=" + fieldName;
            url += "&condition=TEXT_EQUALS";
            url += "&key=" + employeeID;
            url += "&loadData=false";

            var response = API.httpGetMethod(url);
            return response;
        } catch (err) {
            return { data: [], count: 0, error: err.message };
        }
    }

    function updateRecordAuthor(dataUUID, fieldName, managerID) {
        try {
            // 
            var managerInfo = API.getUserInfo(managerID);

            var res = API.mergeFormData({
                uuid: dataUUID,
                data: [{
                    id: fieldName,
                    type: "entity",
                    value: managerInfo.lastname + " " + managerInfo.firstname + " " + managerInfo.patronymic,
                    key: managerID
                }]
            });
            return { success: true, uuid: dataUUID };
        } catch (err) {
            return { success: false, uuid: dataUUID, error: err.message };
        }
    }

    function processRegistry(registryConfig, employeeID, managerID) {
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
            var recordsResponse = getRecordsByEmployee(
                registryConfig.registryCode,
                registryConfig.fieldName,
                employeeID
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
                var updateResult = updateRecordAuthor(
                    record.dataUUID,
                    registryConfig.fieldName,
                    managerID
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

    function changeEmployeeRecordsToManager(employeeID, managerID) {
        var totalStats = {
            startTime: new Date().toISOString(),
            employeeID: employeeID,
            managerID: managerID,
            registriesProcessed: 0,
            totalRecordsFound: 0,
            totalRecordsUpdated: 0,
            totalRecordsFailed: 0,
            registryStats: [],
            globalErrors: []
        };

        if (!employeeID || !managerID) {
            totalStats.globalErrors.push("Не указаны обязательные параметры: employeeID или managerID");
            return totalStats;
        }

        if (employeeID === managerID) {
            totalStats.globalErrors.push("ID сотрудника и руководителя не должны совпадать");
            return totalStats;
        }

        try {
            // Конфигурация реестров где нужно менять автора
            var REGISTRIES_CONFIG = [
                { registryCode: "registry_applications", fieldName: "entity_author" },
                { registryCode: "registry_requests", fieldName: "entity_author" },
                { registryCode: "registry_waybills", fieldName: "entity_author" },
                
            ];

            for (var i = 0; i < REGISTRIES_CONFIG.length; i++) {
                var registryConfig = REGISTRIES_CONFIG[i];

                var registryStats = processRegistry(registryConfig, employeeID, managerID);

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

    // ========== ВЫПОЛНЕНИЕ СМЕНЫ АВТОРА ==========
    
    executionStats = changeEmployeeRecordsToManager(employeeID, managerID);

    // ========== УДАЛЕНИЕ СОТРУДНИКА ИЗ ОРГАНИЗАЦИИ ==========
    
    let dischargeMessages = [];

    // 1. Снятие с должности
    try {
        let departmentData = UTILS.getValue(orgFormData, "entity_department");
        
        if (departmentData && departmentData.key) {
            
            let userPositions = API.httpGetMethod("rest/api/positions/user_positions?userID=" + employeeID);
            
            if (userPositions && userPositions.positions) {
                for (let i = 0; i < userPositions.positions.length; i++) {
                    let position = userPositions.positions[i];
                    
                    if (position.departmentID === departmentData.key) {
                        
                        let dischargeResult = API.httpGetMethod(
                            "rest/api/positions/discharge?positionID=" + position.positionID + 
                            "&userID=" + employeeID
                        );
                        
                        if (dischargeResult.errorCode == 0) {
                            dischargeMessages.push("Сотрудник снят с должности (Position ID: " + position.positionID + ")");
                        } else {
                            log.warn("Не удалось снять с должности: " + dischargeResult.errorMessage);
                        }
                    }
                }
            }
        }
    } catch (dischargeErr) {
        log.error("Ошибка при снятии с должности: " + dischargeErr.message);
    }

    // 2. Удаление из группы организации
    try {
        let groupCodeData = UTILS.getValue(orgFormData, "text_group_code");
        
        if (groupCodeData && groupCodeData.value) {
            // REST API для удаления пользователя из группы. Путь: rest/api/storage/groups/remove_user
            let removeResult = API.httpGetMethod(
                "rest/api/storage/groups/remove_user?groupCode=" + groupCodeData.value + 
                "&userID=" + employeeID
            );
            
            if (removeResult.result === "true" || removeResult.errorCode == 0) {
                dischargeMessages.push("Сотрудник удален из группы организации");
            } else {
                log.warn("Не удалось удалить из группы: " + (removeResult.errorMessage || "неизвестная ошибка"));
            }
        }
    } catch (groupErr) {
        log.error("Ошибка при удалении из группы: " + groupErr.message);
    }

    // Формируем итоговое сообщение
    let resultMessage = [];
    
    resultMessage.push("Сотрудник " + employeeID + " удален из организации");
    
    if (executionStats.totalRecordsUpdated > 0) {
        resultMessage.push("Смена автора: обновлено " + executionStats.totalRecordsUpdated + " записей");
    } else {
        resultMessage.push("У сотрудника не было записей для смены автора");
    }
    
    if (dischargeMessages.length > 0) {
        resultMessage.push(dischargeMessages.join(", "));
    }
    
    if (executionStats.globalErrors.length > 0) {
        resultMessage.push("Предупреждения: " + executionStats.globalErrors.join("; "));
    }

    message = resultMessage.join(" | ");

    // Сохраняем детальную статистику для логов
    log.info("Детальная статистика удаления: " + JSON.stringify(executionStats));

} catch (err) {
    result = false;
    message = "Ошибка удаления сотрудника: " + err.message;
    log.error(err);
}