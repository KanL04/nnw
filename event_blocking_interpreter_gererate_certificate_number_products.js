// var result = true;
// var message = "ok";

// function getMaxCertificateNumber(data) {
//     let maxNumber = 0;

//     data.result.forEach(function (item) {
//         if (item.fieldValue && item.fieldValue.textbox_num) {
//             let certificateNumber = Number(item.fieldValue.textbox_num);
//             if (!isNaN(certificateNumber) && certificateNumber > maxNumber) {
//                 maxNumber = certificateNumber;
//             }
//         }
//     });

//     return maxNumber;
// }

// try {
//     let currentFormData = API.getFormData(dataUUID);
//     let textbox_certificate_number = UTILS.getValue(currentFormData, "textbox_certificate_number"); //555514
//     let textbox_number_att = UTILS.getValue(currentFormData, "textbox_number_att"); // KZ.O.02.E0533
//     let type_of_certification = UTILS.getValue(currentFormData, "listbox_type_of_certification");
//     let listbox_Region_according_to_ST_RK_3_11 = UTILS.getValue(currentFormData, "listbox_Region_according_to_ST_RK_3_11");
//     let textbox_accr_numb = UTILS.getValue(currentFormData, "textbox_accr_numb");
//     let textbox_num_eokno = UTILS.getValue(currentFormData, "textbox_num_eokno");
//     let radio_gde_cert = UTILS.getValue(currentFormData, "radio_gde_cert");

//     /*
//       radio_gde_cert
//       value: "1" или "2"
//       key: "В Едином окне" или "В Е-КТРМ"
//     */
//     let incrementedNumber = '00000';

//     if (radio_gde_cert && radio_gde_cert.hasOwnProperty('value') && radio_gde_cert.value == '1') {
//         if (textbox_num_eokno && textbox_num_eokno.hasOwnProperty('value')) {
//             incrementedNumber = ('00000' + (Number(textbox_num_eokno.value) + 1)).slice(-5);
//         }
//     } else {
//         let urlSearch = 'rest/api/registry/data_ext?registryCode=certificates_reg_eaeu&fields=textbox_num&field=textbox_accr_numb&condition=TEXT_EQUALS&value=' + textbox_accr_numb.value;

//         let res = API.httpGetMethod(urlSearch);
//         let certificateNumber = getMaxCertificateNumber(res);
//         incrementedNumber = ('00000' + (certificateNumber + 1)).slice(-5);
//         message = JSON.stringify(urlSearch)
//     }

//       if (type_of_certification.key == "1") {
//         textbox_certificate_number.value = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key + textbox_number_att.value.slice(-3) + ".01.01." + incrementedNumber;
//       } else if (type_of_certification.key == "2" || type_of_certification.key == "3") {
//         textbox_certificate_number.value = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key + textbox_number_att.value.slice(-3) + ".05.01." + incrementedNumber;
//       }

//     //   API.mergeFormData({
//     //     "uuid": dataUUID,
//     //     "data": [
//     //       textbox_certificate_number,
//     //       {id: 'textbox_num', type: 'textbox', value: incrementedNumber.slice(-5)}
//     //     ]
//     //   });

//       message = "Номер сертификата сформирован: " + JSON.stringify(textbox_certificate_number.value); // ЕАЭС KZ.7500361.01.01.10658

// } catch (err) {
//     message = err.message;
// }



///new 17.11.2025
var result = true;
var message = "ok";

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



function delay(ms) {
    var start = new Date().getTime();
    while (new Date().getTime() - start < ms) {
        // пустой цикл — держит поток ровно ms миллисекунд
    }
}

function generateUniqueCertificateNumber() {
    var maxAttempts = 15;
    var attempt = 0;

    while (attempt < maxAttempts) {
        var url = 'rest/api/registry/data_ext?registryCode=certificates_reg_eaeu&fields=textbox_num&field=textbox_accr_numb&condition=TEXT_EQUALS&value=' + encodeURIComponent(textbox_accr_numb.value);
        var res = API.httpGetMethod(url);
        var currentMax = getMaxCertificateNumber(res);
        var candidate = currentMax + 1;
        var padded = ('00000' + candidate).slice(-5);

        var fullNumber = '';
        if (type_of_certification.key === "1") {
            fullNumber = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key +
                textbox_number_att.value.slice(-3) + ".01.01." + padded;
        } else {
            fullNumber = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key +
                textbox_number_att.value.slice(-3) + ".05.01." + padded;
        }

        textbox_certificate_number.value = fullNumber;

        API.mergeFormData({
            uuid: dataUUID,
            data: [
                textbox_certificate_number,
                { id: 'textbox_num', type: 'textbox', value: candidate.toString() }
            ]
        });


        var check = API.httpGetMethod(url);
        var realMax = getMaxCertificateNumber(check);

        if (realMax == currentMax || realMax == candidate) {
            return fullNumber;
        }

        attempt++;
        var waitMs = 300 + (attempt * 200) + Math.floor(Math.random() * 300);
        delay(waitMs);
    }

    throw new Error("Не удалось сгенерировать уникальный номер после " + maxAttempts + " попыток");
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
        // Единое окно — просто +1
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
        // Е-КТРМ — с защитой от гонки
        finalNumber = generateUniqueCertificateNumber();
    }

    message = "Номер сертификата успешно сформирован: " + finalNumber;

} catch (err) {
    result = false;
    message = "Ошибка генерации номера: " + err.message;
}