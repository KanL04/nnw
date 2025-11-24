var result = true;
var message = 'ok';

try {
    let currentFormData = API.getFormData(dataUUID);
    let reg = UTILS.getValue(currentFormData, "reglink_delete");

    if(!reg || !reg.hasOwnProperty('key')) throw new Error('Error - not found');

    let waybillFormData = API.getFormData(API.getAsfDataId(reg.key));

    UTILS.setValue(waybillFormData, "listbox_status", {
        type: "listbox",
        value: "Удалена",
        key: "0"
    });

    API.mergeFormData(waybillFormData);


    // Смена автора записей реестров с сотрудника на руководителя
    //
    function getRecordsByManager(registryCode, fieldName, employeeID) {
        try {
            var url = "rest/api/registry/data_ext?";
            url += "registryCode=" + registryCode;
            
            // Ищем userID (Автор документа)
            url += "&field=userID"; 
            
            url += "&condition=TEXT_EQUALS";
            url += "&key=" + employeeID; //  ID сотрудника
            url += "&loadData=false";

            var response = API.httpGetMethod(url);
            return response;
        } catch (err) {
            return { data: [], count: 0, error: err.message };
        }
    }

    function updateRecordManager(dataUUID, fieldName, managerID) {
        try {
            // Получаем данные формы, чтобы вытащить documentID
            var formData = API.getFormData(dataUUID);
            
            if (!formData || !formData.documentID) {
                 throw new Error("Не удалось определить documentID по dataUUID: " + dataUUID);
            }

            // Вызываем метод смены владельца (автора) на нового руководителя
            API.changeOwner(formData.documentID, managerID);

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
            var recordsResponse = getRecordsByManager(
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
                
                var updateResult = updateRecordManager(
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

    function changeManagerInAllRegistries(employeeID, managerID) {
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

    var employeeID = userData.dischargeUserId;
    var managerID = userID;
    
    if (!employeeID || !managerID) {
        throw new Error("Не указаны обязательные параметры: employeeID или managerID");
    }

    // Выполнение смены автора записей
    executionStats = changeManagerInAllRegistries(employeeID, managerID);


    message =+ JSON.stringify(executionStats)

} catch (err) {
    result = false;
    message = err.message;
}