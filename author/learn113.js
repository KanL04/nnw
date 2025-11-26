var result = true;
var message = "ok";


// РЕЕСТРЫ И ПОЛЯ ДЛЯ ОБНОВЛЕНИЯ
var REGISTRIES_CONFIG = [
    // 1 Группа. область аккредитации
    // { registryCode: 'scope_accreditation', fieldName: 'entity_author' },
    // { registryCode: 'passport_accreditation', fieldName: 'entity_author' },
    // { registryCode: 'information_related_to_the_organization_and_personnel', fieldName: 'entity_user' },
    // { registryCode: 'warehouse', fieldName: 'entity_author' },
    // 1 Группа. область аккредитации
    { registryCode: 'reg_passport_accreditation', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_conformity_processes_halal', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_quality_management_systems', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_environmental_management_systems', fieldName: 'entity_author' },
    { registryCode: 'form_scope_accreditation_energy_management_system', fieldName: 'entity_author' },
    { registryCode: 'form3_accreditation_health_safety', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_information_security_management', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_information_security_management_system', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_quality_management_system_medical_devices', fieldName: 'entity_author' },
    { registryCode: 'register_accreditation_occupational_safety_management_system', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_laboratory', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_calibr_laboratory1', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_laboratory_medical', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_conformity_agriculture_GAP', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_staff_conformity', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_conformity_products_processes_services', fieldName: 'entity_author' },
    { registryCode: 'scope_addition_il_reg', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_proficiency_testing_provider', fieldName: 'entity_author' },
    { registryCode: 'register_new_management_scheme_application', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_inspection_body', fieldName: 'entity_author' },
    { registryCode: 'registry_social_responsibility_management_system', fieldName: 'entity_author' },
    { registryCode: 'registry_scope_accreditation_GHG_laboratory', fieldName: 'entity_author' },
    { registryCode: 'register_accreditation_food_products_safety', fieldName: 'entity_author' },
    { registryCode: 'registr_scope_accreditation_conformity_processes_products', fieldName: 'entity_author' },
    { registryCode: 'registry_oblasti_akkreditatsii_organa_po_validatsii_i_verifikatsii_parnikovyh_gazov', fieldName: 'entity_author' },
    // 2 Группа. Cведения паспорта
    { registryCode: 'Deleting_scope', fieldName: 'entity_author' },
    { registryCode: 'registry_making_changes_to_passport_data', fieldName: 'entity_author' },
    { registryCode: 'list_used_standart', fieldName: 'entity_author' },
    { registryCode: 'registry_list_of_regulatory_documents_reest', fieldName: 'entity_author' },
    { registryCode: 'information_lithen', fieldName: 'entity_author' },
    { registryCode: 'information_personal', fieldName: 'entity_author' },
    { registryCode: 'information_industrial_premises', fieldName: 'entity_author' },
    { registryCode: 'details_measuring_instruments', fieldName: 'entity_author' },
    { registryCode: 'detalies_test_equipment', fieldName: 'entity_author' },
    { registryCode: 'information_equipment_laboratory_standardn', fieldName: 'entity_author' },
    { registryCode: 'reg_information_equipment', fieldName: 'entity_author' },
    { registryCode: 'reg_information_transport', fieldName: 'entity_author' },
    { registryCode: 'Deleting_passport_data', fieldName: 'entity_author' },
    // 3 группа. Сведения связанные с организацией и персоналом
    { registryCode: 'documents_sm_accreditation', fieldName: 'entity_author' },
    { registryCode: 'information_lithen', fieldName: 'entity_author' },
    { registryCode: 'information_structural_subdivisions', fieldName: 'entity_author' },
    { registryCode: 'information_organization', fieldName: 'entity_author' },
    // 4 группа .Метрология - склад
    { registryCode: 'registries_measurement_methods', fieldName: 'entity_supervisor' },
    { registryCode: 'reg_methods_verification_measuring_instruments', fieldName: 'entity_supervisor' },
    { registryCode: 'Verifiers_of_measuring_instruments', fieldName: 'entity_supervisor' },
    { registryCode: 'registries_measuring_methods_passed_metrological_certification', fieldName: 'entity_supervisor' },
    { registryCode: 'registries_approved_types_of_measuring_instruments', fieldName: 'entity_supervisor' },
    { registryCode: 'registries_approved_types_of_standard_samples', fieldName: 'entity_supervisor' },
    { registryCode: 'Scientists_keepers_of_the_state_standards_of_units_of_quantities', fieldName: 'entity_supervisor' },
    { registryCode: 'register_standards_of_units_of_quantities', fieldName: 'entity_supervisor' },
    { registryCode: 'Application_for_admission_to_the_use_of_foreign_type_CO', fieldName: 'entity_supervisor' },
    { registryCode: 'register_approved_types_of_measuring_instruments', fieldName: 'entity_author' },
    { registryCode: 'register_of_measuring_instruments_that_have_passed_metrological_certification', fieldName: 'entity_author' },
    { registryCode: 'application_for_extension_of_the_MVI', fieldName: 'entity_author' },
    { registryCode: 'measurement_methods', fieldName: 'entity_author' },
    { registryCode: 'register_of_approved_types_of_standard_samples', fieldName: 'entity_author' },
    { registryCode: 'register_of_application_consideration_for_certification_recertification_verifiers', fieldName: 'entity_author' },
    { registryCode: 'tehnicheskoe_zadanie_na_razrabotku_gso', fieldName: 'entity_author' },
    { registryCode: 'registry_application_scientists_keepers_state_standards', fieldName: 'entity_author' },
    { registryCode: 'registry_application_standards_of_units_of_quantities', fieldName: 'entity_author' },
    { registryCode: 'registry_cancellation_of_labels', fieldName: 'entity_author' },
    { registryCode: 'register_brass_brands', fieldName: 'entity_author' },
    { registryCode: 'register_metal_brands', fieldName: 'entity_author' },
    { registryCode: 'register_plastic_seals', fieldName: 'entity_author' },
    { registryCode: 'register_self_adhesive_labels', fieldName: 'entity_author' },
    { registryCode: 'registry_certificate_replacement', fieldName: 'entity_author' },
    { registryCode: 'register_production_of_verification_stamps', fieldName: 'entity_author' },
    { registryCode: 'registry_unsuitability_notice', fieldName: 'entity_author' },
    { registryCode: 'registry_certificate_revocation', fieldName: 'entity_author' },
    { registryCode: 'registry_certificate', fieldName: 'entity_author' },
    { registryCode: 'shablon_sertifikata_o_poverke', fieldName: 'entity_author' },



];
// --- ФУНКЦИИ --- для смены автора записей реестров
try {
    // Для получения данных формы текущего события
    let currentFormData = API.getFormData(dataUUID);
    // let entity_employee = UTILS.getValue(
    //     currentFormData,
    //     "entity_employee"
    // );

    // Действие из списка. UTILS.getValue возвращает объект поля(type, value, key)
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



// Извлекает  форму увольнения с данными уволенного сотрудника:
// Организация, текущий руководитель, ИИН уволенного сотрудника

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

// Поиск пользователя по ИИН и получаем userID увольняемого сотрудника
// Формирует поинтер IIN<номер> и получает userID

        let dischargeUserRequest = API.checkExistence('IIN' + IIN.value);
        dischargedUserID = dischargeUserRequest.list[0].userID

// поиск всех записей реестра, где автор = увольняемый сотрудник
        function getRecordsByManager(registryCode, fieldName, oldManagerID) {
            try {
                var url = "rest/api/registry/data_ext?";
                url += "registryCode=" + registryCode;
                url += "&field=" + fieldName;
                url += "&condition=TEXT_EQUALS";
                url += "&key=" + oldManagerID;
                // &loadData=false - чтобы не тянуть данные формы(полные данные), а только метаданные(DataUUID, documentID)
                url += "&loadData=false";

                var response = API.httpGetMethod(url);
                return response;
            } catch (err) {
                return { data: [], count: 0, error: err.message };
            }
        }
        function updateRecordManager(dataUUID, fieldName, newManagerID) {
            try {
                // Обновление автора записи. Получаем ФИО Руководителя
                // mergeForamData для частичного обновления и обновляем поле entity (автор) на руководителя

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

        // Обработка каждого реестра из списка по очереди. Получаем все записи, и вызываем для каждой записи updateRecordManager
        // + статистика по обработке totalRecords, successCount, failedCount, documentIDS, errors 
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

        // Обработка всех реестров. То есть обработка обязательных полей и проверка что ID не совпадают

        function changeManagerInAllRegistries(oldManagerID, newManagerID) {
            var totalStats = {
                // Общая статистика по всему процессу
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

                // Цикл обработки всех реестров из конфига REGISTRIES_CONFIG
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
        // var oldManagerID = 'd1934af5-fae8-4ea2-9ab4-f58750d755fe';
        // var newManagerID = '2ca997ca-f7c4-483e-bbba-e420574a2ab2';
        if (!oldManagerID || !newManagerID) {
            throw new Error("Не указаны обязательные параметры: oldManagerID или newManagerID");
        }

        // Выполнение смены руководителя
        var executionStats = changeManagerInAllRegistries(oldManagerID, newManagerID);
        // Увольнение сотрудника / поиск должности "сотрудника" и снятие по API.dichargePosition
        let getUserPosition = API.getUserInfo(dischargedUserID);
        var positions = getUserPosition.positions;
        var positionID = null;

        for (var i = 0; i < positions.length; i++) {
            if (positions[i].positionName === "Сотрудники") {
                positionID = positions[i].positionID;
                break;
            }
        }
        let doDischargePosition = API.dischargePosition(dischargedUserID, positionID);

        message = JSON.stringify(doDischargePosition);

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