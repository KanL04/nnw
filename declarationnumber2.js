var result = true;
var message = "ok";

function getMaxCertificateNumber(data) {
    let maxNumber = 0;
    data.result.forEach(function (item) {
        if (item.fieldValue && item.fieldValue.textbox_num) {
            let certificateNumber = Number(item.fieldValue.textbox_num);
            if (!isNaN(certificateNumber) && certificateNumber > maxNumber) {
                maxNumber = certificateNumber;
            }
        }
    });
    return maxNumber;
}

function delay(ms) {
    var start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
}

try {
    let currentFormData = API.getFormData(dataUUID);
    let textbox_certificate_number = UTILS.getValue(currentFormData, "textbox_declaration_number");
    let textbox_number_att = UTILS.getValue(currentFormData, "textbox_number_att");
    let type_of_certification = UTILS.getValue(currentFormData, "listbox-type_of_certification");
    let listbox_Region_according_to_ST_RK_3_11 = UTILS.getValue(currentFormData, "listbox_Region_according_to_ST_RK_3_11");
    let textbox_accr_numb = UTILS.getValue(currentFormData, "textbox_accr_numb");
    let textbox_num_eokno = UTILS.getValue(currentFormData, "textbox_num_eokno");
    let radio_gde_cert = UTILS.getValue(currentFormData, "radio_gde_cert");

    let incrementedNumber = '00000';
    let maxRetries = 10;
    let retryCount = 0;
    let success = false;

    if (radio_gde_cert && radio_gde_cert.hasOwnProperty('value') && radio_gde_cert.value == '1') {
        // Для Единого окна просто инкрементируем номер
        if (textbox_num_eokno && textbox_num_eokno.hasOwnProperty('value')) {
            incrementedNumber = ('00000' + (Number(textbox_num_eokno.value) + 1)).slice(-5);
        }
    } else {
        // защита от race condition
        while (!success && retryCount < maxRetries) {
            // Делаем паузу перед повторной попыткой
            if (retryCount > 0) {
                let randomDelay = 100 + Math.floor(Math.random() * 300);
                delay(randomDelay);
            }

            // ГЕНЕРИРУЕМ НОВЫЙ НОМЕР
            let urlSearch = 'rest/api/registry/data_ext?registryCode=eaeu_production_conformity_declaration&fields=textbox_num&field=textbox_accr_numb&condition=TEXT_EQUALS&value=' + textbox_accr_numb.value;
            let res = API.httpGetMethod(urlSearch);
            let certificateNumber = getMaxCertificateNumber(res);
            incrementedNumber = ('00000' + (certificateNumber + 1)).slice(-5);

            // ФОРМИРУЕМ ПОЛНЫЙ НОМЕР ДЕКЛАРАЦИИ
            if (type_of_certification.key == "1") {
                textbox_certificate_number.value = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key + textbox_number_att.value.slice(-3) + ".13.12." + incrementedNumber;
            } else if (type_of_certification.key == "2" || type_of_certification.key == "3") {
                textbox_certificate_number.value = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key + textbox_number_att.value.slice(-3) + ".13.12." + incrementedNumber;
            }

            // СОХРАНЯЕМ ДАННЫЕ
            API.mergeFormData({
                "uuid": dataUUID,
                "data": [
                    textbox_certificate_number,
                    {id: 'textbox_num', type: 'textbox', value: incrementedNumber.slice(-5)}
                ]
            });

            // ДАЕМ ВРЕМЯ НА СОХРАНЕНИЕ В БД
            delay(100);

            // ПРОВЕРЯЕМ ПОСЛЕ СОХРАНЕНИЯ
            let urlCheck = 'rest/api/registry/data_ext?registryCode=eaeu_production_conformity_declaration&fields=textbox_num,textbox_declaration_number&field=textbox_accr_numb&condition=TEXT_EQUALS&value=' + textbox_accr_numb.value;
            urlCheck += '&field=textbox_num&condition=TEXT_EQUALS&value=' + incrementedNumber;
            
            let checkRes = API.httpGetMethod(urlCheck);
            
            // ЕСЛИ НАЙДЕНО БОЛЬШЕ ОДНОГО ЗАПИСИ - ПОВТОРЯЕМ
            if (checkRes.recordsCount > 1) {
                retryCount++;
                message = "Обнаружен дубликат на попытке " + retryCount + ", повтор...";
                continue;
            }
            
            success = true;
        }

        if (!success) {
            throw new Error("Не удалось сгенерировать уникальный номер после " + maxRetries + " попыток");
        }
    }

    message = "Номер декларации сформирован: " + textbox_certificate_number.value;

} catch (err) {
    result = false;
    message = "ОШИБКА: " + err.message;
}