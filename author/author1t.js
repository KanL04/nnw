var message;
var result = true;

function data_ext() {
    let url = "rest/api/registry/data_ext?";
    url += "registryCode=randomaizer_dlya_sbkts";
    url += "&fields=entity_user";
    url += "&fields=date_random";
    url += "&fields=textbox_count";
    return API.httpGetMethod(url);
}

function getCountValueByKim() {
    const dataExt = API.httpGetMethod('rest/api/registry/data_ext?registryCode=randomaizer_dlya_sbkts&fields=entity_user&fields=date_random&fields=textbox_count&field=entity_user&condition=TEXT_EQUALS&key=814c40cf-9cca-4eff-8ee0-61df24bc8969')
    return dataExt.recordsCount > 0 ? Number(dataExt.result[0].fieldValue.textbox_count || 0) : null
}

function getCountValueByAnar() {
    const dataExt = API.httpGetMethod('rest/api/registry/data_ext?registryCode=randomaizer_dlya_sbkts&fields=entity_user&fields=date_random&fields=textbox_count&field=entity_user&condition=TEXT_EQUALS&key=d2012e9a-70cd-4401-b287-096331570ac4')
    return dataExt.recordsCount > 0 ? Number(dataExt.result[0].fieldValue.textbox_count || 0) : null
}

function getDocumentByAnar() {
    const dataExt = API.httpGetMethod('rest/api/registry/data_ext?registryCode=randomaizer_dlya_sbkts&fields=entity_user&fields=date_random&fields=textbox_count&field=entity_user&condition=TEXT_EQUALS&key=d2012e9a-70cd-4401-b287-096331570ac4')
    return dataExt.result[0].dataUUID;
}
function getDocumentByKim() {
    const dataExt = API.httpGetMethod('rest/api/registry/data_ext?registryCode=randomaizer_dlya_sbkts&fields=entity_user&fields=date_random&fields=textbox_count&field=entity_user&condition=TEXT_EQUALS&key=814c40cf-9cca-4eff-8ee0-61df24bc8969')
    return dataExt.result[0].dataUUID;
}

function updateRecord(record) {
    record.fieldValue.textbox_count = parseInt(record.fieldValue.textbox_count, 10) + 1;
    record.fieldValue.date_random = new Date().toISOString().split('T')[0]; // sets today's date
    return record;
}

function filterRecords(records, date) {
    let filtered = [];

    for (let i = 0; i < records.length; i++) {
        if (records[i].fieldKey.entity_user !== "d2012e9a-70cd-4401-b287-096331570ac4" && records[i].fieldKey.entity_user !== "814c40cf-9cca-4eff-8ee0-61df24bc8969"){
            if (parseInt(records[i].fieldValue.textbox_count, 10) < 1) {
                filtered.push(records[i]);
            }
        }
    }
    return filtered;
}

function getFormattedDate() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // Месяцы начинаются с 0
    let day = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;

    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

try {
    let response = data_ext();
    let data = response;
    let today = new Date().toISOString().split('T')[0];
    let todayWithTime = getFormattedDate();

    let todaysRecords = filterRecords(data.result, today);

    message = JSON.stringify(todaysRecords.length)

    if (todaysRecords.length === 0) {
        let countValueByKim = getCountValueByKim(); // Число задач у Кима
        let countValueByAnar = getCountValueByAnar(); // Число задач у Анара

        let AnarDataUUID = getDocumentByAnar();




        let KimDataUUID = getDocumentByKim();

        countValueByKim = countValueByKim === null ? 0 : countValueByKim;
        countValueByAnar = countValueByAnar === null ? 0 : countValueByAnar;

        // message = JSON.stringify(countValueByAnar);

        let count = 0;



        // Если у обоих >= 10 — просто OK
        if (countValueByKim >= 10 && countValueByAnar >= 10) {
            message = "У обоих макс записей";
        } else {

            let selectedPerson;
            let countByAnar = countValueByAnar;
            let countByKim = countValueByKim;



            
             if (countValueByAnar < 10 && countValueByKim < 10) {
                // Если у обоих < 10 — выбираем рандомно
                if (countValueByAnar === 0 && countValueByKim === 0 ){
                    count++;
                }
                let randomIndex = Math.random() < 0.5 ? 0 : 1;
                if (randomIndex === 0) {
                    selectedPerson = {
                        key: "814c40cf-9cca-4eff-8ee0-61df24bc8969",
                        value: "Ким Николай Альфредович"
                    };
                } else {
                    selectedPerson = {
                        key: "d2012e9a-70cd-4401-b287-096331570ac4",
                        value: "Уалиева Анар"
                    };

                }
            } else if (countValueByKim < 10) {
                selectedPerson = {
                    key: "814c40cf-9cca-4eff-8ee0-61df24bc8969",
                    value: "Ким Николай Альфредович"
                };

            } else if (countValueByAnar < 10) {
                selectedPerson = {
                    key: "d2012e9a-70cd-4401-b287-096331570ac4",
                    value: "Уалиева Анар"
                };
            }

            if (selectedPerson.key === "d2012e9a-70cd-4401-b287-096331570ac4") { //ANAR
                countByAnar++;
                let res1 = API.mergeFormData({
                    uuid: AnarDataUUID,
                    data: [{
                        id: "textbox_count",
                        type: "textbox",
                        value: countByAnar
                        
                    }]
                });
                // message = JSON.stringify(res1)
            } else {
                countByKim++;
                let res2 = API.mergeFormData({
                    uuid: KimDataUUID,
                    data: [{
                        id: "textbox_count",
                        type: "textbox",
                        value: countByKim
                        

                    }]
                });
            }
            let res = API.mergeFormData({
                uuid: dataUUID,
                data: [{
                    id: "entity_random_user",
                    type: "entity",
                    key: selectedPerson.key,
                    value: selectedPerson.value
                }]
            });

            message = JSON.stringify(selectedPerson)

        }
    } else {
        let randomIndex = Math.floor(Math.random() * todaysRecords.length);
        let randomRecord = todaysRecords[randomIndex];
        let updatedRecord = updateRecord(randomRecord);


        let res = API.mergeFormData({
            uuid: dataUUID,
            data: [{
                id: "entity_random_user",
                type: "entity",
                key: updatedRecord.fieldKey.entity_user,
                value: updatedRecord.fieldValue.entity_user
            }]
        });

        let resultRandom = API.mergeFormData({
            uuid: updatedRecord.dataUUID,
            data: [
                {
                    id: "date_random",
                    type: "date",
                    key: todayWithTime,
                    value: today
                },
                {
                    id: "textbox_count",
                    type: "textbox",
                    value: updatedRecord.fieldValue.textbox_count
                }
            ]
        });

        message = JSON.stringify("Выбран случайный пользователь: " + updatedRecord.fieldValue.entity_user);
    }


} catch (err) {
    console.error(err);
    message = err.message;
}
