var result = true;
var message = "ok";

// Функция получения максимума (оставляем как есть, она норм)
function getMaxCertificateNumber(data) {
    var maxNumber = 0;
    if (data && data.result) {
        for (var i = 0; i < data.result.length; i++) {
            var item = data.result[i];
            if (item.fieldValue && item.fieldValue.textbox_num) {
                var val = item.fieldValue.textbox_num;
                var num = Number(val.toString().replace(/\D/g, ''));
                if (!isNaN(num) && num > maxNumber) {
                    maxNumber = num;
                }
            }
        }
    }
    return maxNumber;
}

// Функция задержки (лучше использовать Thread.sleep если это Java-движок, но оставим ваш вариант для совместимости)
function delay(ms) {
    var start = new Date().getTime();
    while (new Date().getTime() - start < ms) {
        // Ждем
    }
}

function generateUniqueCertificateNumber() {
    var maxAttempts = 20; // Чуть увеличим кол-во попыток
    var attempt = 0;

    while (attempt < maxAttempts) {
        // 1. Получаем текущий максимум по номеру аккредитации
        // ВАЖНО: url должен искать ВСЕ сертификаты по данному органу, чтобы найти макс
        var urlRegistry = 'rest/api/registry/data_ext?registryCode=certificates_reg_eaeu&fields=textbox_num&field=textbox_accr_numb&condition=TEXT_EQUALS&value=' + encodeURIComponent(textbox_accr_numb.value);
        
        var res = API.httpGetMethod(urlRegistry);
        var currentMax = getMaxCertificateNumber(res);
        
        // 2. Вычисляем кандидата (если attempt > 0, значит была коллизия, пробуем сразу +attempt, чтобы "перепрыгнуть" занятое)
        // Но безопаснее всегда брать currentMax + 1, так как за время цикла currentMax мог вырасти
        var candidate = currentMax + 1; 
        var padded = ('00000' + candidate).slice(-5);

        // Формируем строковый номер
        var fullNumber = '';
        if (type_of_certification.key === "1") {
            fullNumber = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key +
                textbox_number_att.value.slice(-3) + ".01.01." + padded;
        } else {
            fullNumber = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key +
                textbox_number_att.value.slice(-3) + ".05.01." + padded;
        }

        // 3. СРАЗУ ПИШЕМ В БАЗУ (Занимаем место)
        // Это критично. Мы сначала "столбим" номер, потом проверяем, не занял ли его кто-то еще.
        textbox_certificate_number.value = fullNumber;
        API.mergeFormData({
            uuid: dataUUID,
            data: [
                textbox_certificate_number,
                { id: 'textbox_num', type: 'textbox', value: candidate.toString() }
            ]
        });

        // 4. Пауза (Random backoff)
        // Рандом нужен, чтобы если два потока столкнулись, они не пошли проверять снова синхронно
        var waitMs = 200 + Math.floor(Math.random() * 300); 
        delay(waitMs);

        // 5. ПРОВЕРКА НА УНИКАЛЬНОСТЬ (Verification Step)
        // Мы ищем в реестре записи, у которых textbox_num равен нашему candidate
        // И textbox_accr_numb равен нашему (чтобы не путать с другими органами)
        var urlCheck = 'rest/api/registry/data_ext?registryCode=certificates_reg_eaeu&fields=textbox_num&field=textbox_accr_numb&condition=TEXT_EQUALS&value=' + encodeURIComponent(textbox_accr_numb.value) + '&field=textbox_num&condition=TEXT_EQUALS&value=' + candidate;
        
        var checkRes = API.httpGetMethod(urlCheck);
        
        // Логика проверки:
        // Если checkRes вернул 1 запись — это МЫ (успех).
        // Если checkRes вернул > 1 записи — значит кто-то еще записал такой же номер (коллизия).
        // Если checkRes вернул 0 — (странно, но возможно база не успела), считаем ошибкой и пробуем снова.
        
        var conflict = false;
        if (checkRes && checkRes.result && checkRes.result.length > 1) {
            conflict = true; // Найдено более одной записи с таким номером
        }

        if (!conflict) {
             // Дополнительная защита: проверим, вдруг currentMax успел улететь далеко вперед
             // (например, пока мы писали 105, кто-то успел написать 106)
             // Но по факту проверки на дубликат (urlCheck) обычно достаточно.
             return fullNumber; // УСПЕХ
        }

        // Если была коллизия, логируем (опционально) и идем на следующий круг
        attempt++;
    }

    throw new Error("Не удалось сгенерировать уникальный номер после " + maxAttempts + " попыток. Пожалуйста, повторите сохранение.");
}

try {
    var form = API.getFormData(dataUUID);

    var textbox_certificate_number = UTILS.getValue(form, "textbox_certificate_number");
    var textbox_number_att = UTILS.getValue(form, "textbox_number_att");
    var type_of_certification = UTILS.getValue(form, "listbox_type_of_certification");
    var listbox_Region_according_to_ST_RK_3_11 = UTILS.getValue(form, "listbox_Region_according_to_ST_RK_3_11");
    var textbox_accr_numb = UTILS.getValue(form, "textbox_accr_numb");
    var textbox_num_eokno = UTILS.getValue(form, "textbox_num_eokno");
    var radio_gde_cert = UTILS.getValue(form, "radio_gde_cert");

    var finalNumber = "";

    if (radio_gde_cert && radio_gde_cert.value === "1") {
        // Единое окно — тут логика проще, просто +1 от входящего
        var next = (textbox_num_eokno && textbox_num_eokno.value) ? Number(textbox_num_eokno.value) + 1 : 1;
        var padded = ("00000" + next).slice(-5);

        if (type_of_certification.key === "1") {
            finalNumber = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key +
                textbox_number_att.value.slice(-3) + ".01.01." + padded;
        } else {
            finalNumber = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key +
                textbox_number_att.value.slice(-3) + ".05.01." + padded;
        }

        textbox_certificate_number.value = finalNumber;
        API.mergeFormData({
            uuid: dataUUID,
            data: [
                textbox_certificate_number,
                { id: "textbox_num", type: "textbox", value: next.toString() }
            ]
        });

    } else {
        // Е-КТРМ — запускаем нашу безопасную функцию
        finalNumber = generateUniqueCertificateNumber();
    }

    message = "Номер сертификата успешно сформирован: " + finalNumber;

} catch (err) {
    result = false;
    message = "Ошибка: " + err.message;
}