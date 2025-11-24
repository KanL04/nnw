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

} catch (err) {
  result = false;
  message = err.message;
}