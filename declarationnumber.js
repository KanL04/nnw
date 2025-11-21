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

try {
  let currentFormData = API.getFormData(dataUUID);
  let textbox_certificate_number = UTILS.getValue(currentFormData, "textbox_declaration_number");
  let textbox_number_att = UTILS.getValue(currentFormData, "textbox_number_att");
  let type_of_certification = UTILS.getValue(currentFormData, "listbox-type_of_certification");
  let listbox_Region_according_to_ST_RK_3_11 = UTILS.getValue(currentFormData, "listbox_Region_according_to_ST_RK_3_11");
  let textbox_accr_numb = UTILS.getValue(currentFormData, "textbox_accr_numb");
  let textbox_num_eokno = UTILS.getValue(currentFormData, "textbox_num_eokno");
  let radio_gde_cert = UTILS.getValue(currentFormData, "radio_gde_cert");
  /*
    radio_gde_cert
    value: "1" или "2"
    key: "В Едином окне" или "В Е-КТРМ"
  */

  let incrementedNumber = '00000';

  if(radio_gde_cert && radio_gde_cert.hasOwnProperty('value') && radio_gde_cert.value == '1') {
    if(textbox_num_eokno && textbox_num_eokno.hasOwnProperty('value')) {
      incrementedNumber = ('00000' + (Number(textbox_num_eokno.value) + 1)).slice(-5);
    }
  } else {
    let urlSearch = 'rest/api/registry/data_ext?registryCode=eaeu_production_conformity_declaration&fields=textbox_num&field=textbox_accr_numb&condition=TEXT_EQUALS&value=' + textbox_accr_numb.value;

    let res = API.httpGetMethod(urlSearch);
    let certificateNumber = getMaxCertificateNumber(res);

    incrementedNumber = ('00000' + (certificateNumber + 1)).slice(-5);
  }

  if (type_of_certification.key == "1") {
    textbox_certificate_number.value = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key + textbox_number_att.value.slice(-3) + ".13.12." + incrementedNumber;
  } else if (type_of_certification.key == "2" || type_of_certification.key == "3") {
    textbox_certificate_number.value = "ЕАЭС KZ." + listbox_Region_according_to_ST_RK_3_11.key + textbox_number_att.value.slice(-3) + ".13.12." + incrementedNumber;
  }

  API.mergeFormData({
    "uuid": dataUUID,
    "data": [
      textbox_certificate_number,
      {id: 'textbox_num', type: 'textbox', value: incrementedNumber}
    ]
  });

  message = "Номер сертификата сформирован: " + JSON.stringify(textbox_certificate_number.value);

} catch (err) {
  message = err.message;
}