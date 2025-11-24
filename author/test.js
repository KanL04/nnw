var result = true;
var message = "ok";

try {
    // Получаем данные
    let currentFormData = API.getFormData(dataUUID);
    let userData = null;

    for (let i = 0; i < currentFormData.data.length; i++) {
        if (currentFormData.data[i].id === "userData") {
            userData = JSON.parse(currentFormData.data[i].value);
            break;
        }
    }

    if (!userData) throw new Error("Не найдены данные пользователя");
    if (!userData.createUserResult || !userData.createUserResult.userID) throw new Error("Не найден ID пользователя");

    let userID = userData.createUserResult.userID;
    let stateContext = userData.stateContext;
    let binVal = userData.formData.binVal;

    // Вспомогательные функции
    function checkIsIndividualChecked() {
        return stateContext.stateRegisterOperation === "INDIVIDUAL";
    }

    function checkIsIndividualEntrepreneurChecked() {
        return stateContext.stateRegisterOperation === "INDIVIDUAL_ENTREPRENEUR" || stateContext.stateRegisterOperation === "INDIVIDUAL_ENTREPRENEUR_ULL";
    }

    let messagesArray = [];

    // 1. СОЗДАНИЕ ДОЛЖНОСТИ "Сотрудники" для организаций (кроме ФЛ и Эксперт-Аудитор)
    if (!checkIsIndividualChecked() && stateContext.stateRegistrationTypeItem !== "expert_audit_reg") {
        // пишем так, т.к. в либе interpreter_library зашито слово "employee_" при создании
        let employeePositionCode = "user_" + binVal;
        let searchPosResult = API.searchPositions("employee_" + employeePositionCode);

        if (searchPosResult.length === 0 && userData.organization) {
            // Создаем должность "Сотрудники"
            let positionData = {
                departmentID: userData.organization.departmentID,
                nameRu: "Сотрудники",
                nameKz: "Сотрудники",
                nameEn: "Сотрудники",
                pointersCode: employeePositionCode
            };

            let createPosResult = API.createPosition(positionData);
            if (createPosResult.errorCode != 0) {
                throw new Error("Не удалось создать должность 'Сотрудники': " + createPosResult.errorMessage);
            }
            messagesArray.push("Создана должность 'Сотрудники'. Position ID: " + createPosResult.positionID);
        } else {
            messagesArray.push("Должность 'Сотрудники' уже существует");
        }
    }

    // 2. ДОБАВЛЕНИЕ В ГРУППУ
    let groupCode = stateContext.groupCode;

    let addGroupResult = API.httpGetMethod("rest/api/storage/groups/add_user?groupCode=" + groupCode + "&userID=" + userID);

    if (addGroupResult.result != "true") {
        throw new Error("Не удалось добавить пользователя в группу: " + addGroupResult.errorMessage);
    }
    messagesArray.push("Пользователь добавлен в группу: " + groupCode);

    // 3. НАЗНАЧЕНИЕ НА ДОЛЖНОСТЬ
    if (userData.positionID) {
        // Если есть увольняемый руководитель - снимаем его с должности
        if (userData.dischargeUserId) {
            let dischargeResult = API.httpGetMethod("rest/api/positions/discharge?positionID=" + userData.positionID + "&userID=" + userData.dischargeUserId);

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

            // var oldManagerID = userData.dischargeUserId;
            // var newManagerID = userID;
            var oldManagerID = 'd1934af5-fae8-4ea2-9ab4-f58750d755fe';
            var newManagerID = '2ca997ca-f7c4-483e-bbba-e420574a2ab2';
            if (!oldManagerID || !newManagerID) {
                throw new Error("Не указаны обязательные параметры: oldManagerID или newManagerID");
            }

            // Выполнение смены руководителя
            var executionStats = changeManagerInAllRegistries(oldManagerID, newManagerID);

            if (dischargeResult.errorCode == 0) {
                messagesArray.push("Предыдущий руководитель снят с должности");
            } else {
                log.warn("Не удалось снять предыдущего руководителя: " + dischargeResult.errorMessage);
            }
        }

        // Назначаем нового пользователя
        let appointResult = API.httpGetMethod("rest/api/positions/appoint?positionID=" + userData.positionID + "&userID=" + userID);

        if (appointResult.errorCode != 0) {
            throw new Error("Не удалось назначить на должность: " + appointResult.errorMessage);
        }
        messagesArray.push("Пользователь назначен на должность. Position ID: " + userData.positionID);
    }

    message = messagesArray.join("; ");

    // Обновляем статус
    userData.rolesSetupCompleted = true;

    API.mergeFormData({
        uuid: dataUUID,
        data: [
            {
                id: "userData",
                type: "textarea",
                value: JSON.stringify(userData)
            }
        ]
    });
} catch (err) {
    API.httpPostMethod("rest/api/v5/interpreter/run", {
        interpreterCode: "event_blocking_interpreter_registration_send_email_crash",
        dataUUID: dataUUID
    });

    result = false;
    message = err.message;
}
