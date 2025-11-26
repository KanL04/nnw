var result = true;
var message = "ok";

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
    // { registryCode: 'form', fieldName: 'entity_author' },
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
try {
    let currentFormData = API.getFormData(dataUUID);
    // let entity_employee = UTILS.getValue(
    //     currentFormData,
    //     "entity_employee"
    // );
    let listbox_action = UTILS.getValue(
        currentFormData,
        "listbox_action"
    );

    // const requestUrl = "rest/api/filecabinet/user/save";
    // let textbox_lastname = UTILS.getValue(
    //     currentFormData,
    //     "textbox_lastname"
    // );
    // let textbox_firstname = UTILS.getValue(
    //     currentFormData,
    //     "textbox_firstname"
    // );
    // let textbox_patronymic = UTILS.getValue(currentFormData,
    //     "textbox_patronymic"
    // );
    // let textbox_iin = UTILS.getValue(currentFormData, "textbox_iin");
    // let textbox_address_email = UTILS.getValue(
    //     currentFormData,
    //     "textbox_address_email"
    // );
    // if (listbox_action.key == 3) {


    //     const params = {
    //         userID: entity_employee.key,
    //         lastname: textbox_lastname.value,
    //         firstname: textbox_firstname.value,
    //         patronymic: textbox_patronymic.value,
    //         pointersCode: 'IIN' + textbox_iin.value
    //     }
    //     let res = API.httpPostMethod(requestUrl, params);
    //     if (res.errorCode != 0)
    //         throw new Error(
    //             "Не удалось изменить документ.\n" + res.errorMessage
    //         );
    //     message += '/n' + textbox_patronymic.value;
    // }
    if (listbox_action.key == 4) {
        // Смена автора записей реестров при регистрации нового руководителя
        // new actualization 2025-11-25

        let reg = UTILS.getValue(currentFormData, "reglink_delete");
        if (!reg || !reg.hasOwnProperty('key')) throw new Error('Error - not found');
        message = JSON.stringify(listbox_action);

        let discharge_user_reg = API.getFormData(API.getAsfDataId(reg.key));

        // Получение организации и текущего руководителя
        let organization = discharge_user_reg.data;
        var orgItem = null;

        for (var i = 0; i < organization.length; i++) {
            if (organization[i].id === "reglink_organization") {
                orgItem = organization[i];
                break;
            }
        }

        let GetCurrentManager = discharge_user_reg.data;

        var Manageritem = null;

        for (var i = 0; i < GetCurrentManager.length; i++) {
            if (organization[i].id === "entity_author") {
                Manageritem = GetCurrentManager[i];
                break;
            }
        }


        let currentManager = Manageritem.key;

        let dischargeUserIIN = discharge_user_reg.data
        var IINI = null;

        for (var i = 0; i < dischargeUserIIN.length; i++) {
            if (dischargeUserIIN[i].id === "textbox_iin") {
                IIN = dischargeUserIIN[i];
                break;
            }
        }



        let dischargeUserRequest = API.checkExistence('IIN' + IIN.value);
        dischargedUserID = dischargeUserRequest.list[0].userID

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

        var oldManagerID = dischargedUserID;
        var newManagerID = currentManager;

        if (!oldManagerID || !newManagerID) {
            throw new Error("Не указаны обязательные параметры: oldManagerID или newManagerID");
        }

        // Выполнение смены руководителя
        var executionStats = changeManagerInAllRegistries(oldManagerID, newManagerID);
        message = JSON.stringify(executionStats);

        // }



        // let reglink_delete = UTILS.getValue(
        //     currentFormData,
        //     "reglink_delete"
        // );
        // let TakeUid = API.getAsfDataId(reglink_delete.key);
        // let TakeData = API.getFormData(TakeUid);
        // let lastname = '';
        // let firstname = '';
        // let iin = '';
        // let email = '';
        // let patronymic = '';

        // for (let i = 0; i < TakeData.data.length; i++) {
        //     const item = TakeData.data[i];
        //     switch (item.id) {
        //         case "textbox_lastname":
        //             lastname = item.value;
        //             break;
        //         case "textbox_firstname":
        //             firstname = item.value;
        //             break;
        //         case "textbox_iin":
        //             iin = item.value;
        //             break;
        //         case "textbox_address_email":
        //             email = item.value;
        //             break;
        //         case "textbox_patronymic":
        //             patronymic = item.value;
        //             break;
        //     }
        // }
        // const params = {
        //     userID: entity_employee.key,
        //     lastname: lastname,
        //     firstname: firstname,
        //     hasAccess: 'false',
        //     pointersCode: 'IIN' + iin + '111',
        //     login: email + '111',
        //     email: email + '111',
        //     patronymic: patronymic
        // }
        // let res = API.httpPostMethod(requestUrl, params);
        // if (res.errorCode != 0)
        //     throw new Error(
        //         "Не удалось изменить документ.\n" + res.errorMessage
        //     );
        // message += entity_employee.key;


    }


} catch (err) {
    log.error(err.message);
    result = false;
    message = "Ошибка:" + err.message;
}