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



    // Смена автора записей реестров при регистрации нового руководителя
    // new
    //
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

    var oldManagerID = userData.dischargeUserId;
    var newManagerID = userID;
    // var oldManagerID = 'd1934af5-fae8-4ea2-9ab4-f58750d755fe';
    // var newManagerID = '2ca997ca-f7c4-483e-bbba-e420574a2ab2';
    if (!oldManagerID || !newManagerID) {
        throw new Error("Не указаны обязательные параметры: oldManagerID или newManagerID");
    }

    // Выполнение смены руководителя
    executionStats = changeManagerInAllRegistries(oldManagerID, newManagerID);


    message =+ JSON.stringify(executionStats)

} catch (err) {
    result = false;
    message = err.message;
}