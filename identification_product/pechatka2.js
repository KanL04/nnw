try {
    // подтягивание библиотеки
    if (!model.EVENTpdfMakeLibLoaded) {
        let pdfMakeLib = model.playerModel.getModelWithId('pdfMakeLib');
        pdfMakeLib.on('pdfMakeLibLoaded', () => { model.pdfFuncInst = pdfMakeLib.pdfFunc })
        model.EVENTpdfMakeLibLoaded = true
    }
    let savedApiData = {
        plastic: {},
        labels: {},
        brass: {},
        metal: {}
    }
    // запуск печатки
    if (!model.EVENTclickedButton) {
        model.on("clickedButton", async () => {
            let
                UTILS = model.pdfFuncInst.UTILS,
                COMP = model.pdfFuncInst.Comp,
                TextFrom = model.pdfFuncInst.TextFrom,
                Blocks = model.pdfFuncInst.Blocks,
                IMAGE = model.pdfFuncInst.Images;

            const getModel = (...args) => model.playerModel.getModelWithId(...args);
            const CUR_DATE = (new Date().getFullYear() + "").substring(2);
            const DOC_DATE = getModel('date_verifications')?.getValue()?.substring(2, 4) || CUR_DATE

            let reglinkPlasticSealsModel = getModel('reglink_plastic_seals');
            let reglinkSelfAdhesiveLabelsModel = getModel('reglink_self_adhesive_labels');
            let reglinkBrassMarks = getModel('reglink_brass_marks');
            let reglinkMetalStamps = getModel('reglink_metal_stamps')

            let fields = [
                'textbox_name_departments_of_the_verification_laboratory',
                'textbox_number_of_the_accreditation_certificate',
                'textbox_number_of_the_accreditation_certificate',
                'textbox_certificate_number',
                'textbox_name_measuring_instruments',
                'textbox_name_type_ru',
                'textbox_factory_number',
                'textbox_measuring_range_measuring_instruments',
                'textarea_manufacturers_name_country',
                'listbox_in_quality',
                'textbox_by_class',
                'textbox_address',
                'entity_head_of_the_laboratory',
                'textbox_fio_user',
                'entity_author',
                'textbox_legal_address',
                'textbox_dynamic_traceability_code',
                'textbox_date_of_manufacture',
                'date_verifications',
                'textbox_name_of_the_organization',
                'date_valid_until',
                'reglink_self_adhesive_labels',
                'reglink_plastic_seals',
                'textbox_code_of_the_verification_laboratory'
            ]
            let fieldsVal = UTILS.getFieldsVal(fields)
            const getFieldText = (fieldCode) => fieldsVal[fieldCode] || " ";


            const findNumYear = async (savedApiBlock, docId, fieldsId) => {
                fieldsId.push('textbox_application_number')
                savedApiBlock[docId] = await UTILS.getRegData(docId, fieldsId)

                let appNumAsf = savedApiBlock?.[docId]?.['textbox_application_number'];
                if (!appNumAsf || !appNumAsf.value) return;
                const urlSearchParams = new URLSearchParams()
                urlSearchParams.set('registryCode', 'register_production_of_verification_stamps')

                urlSearchParams.append('fields', 'numericinput_year')

                urlSearchParams.append('field', 'textbox_application_number')
                urlSearchParams.append('condition', 'TEXT_EQUALS')
                urlSearchParams.append('value', appNumAsf.value)

                let prodResp = await AS.FORMS.ApiUtils.simpleAsyncGet(`rest/api/registry/data_ext?${urlSearchParams.toString()}`)
                let numYear = prodResp?.result?.[0]?.fieldKey?.numericinput_year;

                if (numYear) {
                    savedApiBlock[docId]['numYear'] = numYear
                }
            }

            const getRegDataWithSave = async (savedApiBlock, docIds, fieldsId) => {
                let responseAsf = []
                if (docIds) {
                    if (Array.isArray(docIds)) {
                        for (let i = 0; i < docIds.length; i++) {
                            if (savedApiBlock[docIds[i]]) {
                                responseAsf.push(savedApiBlock[docIds[i]])
                            } else {
                                await findNumYear(savedApiBlock, docIds[i], fieldsId)
                                responseAsf.push(savedApiBlock[docIds[i]])
                            }
                        }
                    } else {
                        if (savedApiBlock[docIds]) {
                            responseAsf.push(savedApiBlock[docIds])
                        } else {
                            await findNumYear(savedApiBlock, docIds, fieldsId)
                            responseAsf.push(savedApiBlock[docIds])
                        }
                    }
                }
                return responseAsf
            }

            let plasticSealsAsf = await getRegDataWithSave(savedApiData.plastic, reglinkPlasticSealsModel.value, ['date_application'])
            let selfAdhesiveLabelsAsf = await getRegDataWithSave(savedApiData.labels, reglinkSelfAdhesiveLabelsModel.value, ['date_application'])
            let brassMarksAsf = await getRegDataWithSave(savedApiData.brass, reglinkBrassMarks.value, ['date_application'])
            let metalStampsAsf = await getRegDataWithSave(savedApiData.metal, reglinkMetalStamps.value, [
                'check_size_metal_stamps', 'check_size_metal_stamps_1', 'check_size_metal_stamps_2',
                'check_size_metal_stamps_3', 'check_quarter', 'textbox_mark', 'textbox_mark_1',
                'textbox_mark_2', 'textbox_mark_3', 'date_application'
            ])
            // ----------- START Custom IMG's
            const getFirstQR = (text, index) => {
                let date = selfAdhesiveLabelsAsf[index]?.['numYear']?.substring(2, 4) || selfAdhesiveLabelsAsf[index]['date_application']?.key?.substring(2, 4) || DOC_DATE
                return [
                    COMP.IMG.getIMG('firstQR', 60, 60),
                    COMP.PlainText.getPlainText(
                        text,
                        'center',
                        [10, -22, 0, 0],
                        6
                    ),
                    COMP.PlainText.getPlainText(
                        getFieldText("textbox_code_of_the_verification_laboratory") + " " + date,
                        'center',
                        [10, 0, 0, 6],
                        6
                    ),
                ]
            }
            const getA14LL = (type, index) => {
                const getMarkText = (type) => {
                    if (type === "A") {
                        return "A"
                    } else {
                        if (reglinkMetalStamps.value) {
                            return (metalStampsAsf[index]['textbox_mark']?.value || '') +
                                (metalStampsAsf[index]['textbox_mark_1']?.value || '') +
                                (metalStampsAsf[index]['textbox_mark_2']?.value || '') +
                                (metalStampsAsf[index]['textbox_mark_3']?.value || '') +
                                (metalStampsAsf[index]['check_quarter']?.value || '')
                        } else {
                            return ""
                        }
                    }
                }

                let date;
                if (type === "A") {
                    date = brassMarksAsf[index]['numYear']?.substring(2, 4) || brassMarksAsf[index]['date_application']?.key?.substring(2, 4) || DOC_DATE
                } else {
                    date = metalStampsAsf[index]['numYear']?.substring(2, 4) || metalStampsAsf[index]['date_application']?.key?.substring(2, 4) || DOC_DATE
                }

                return [
                    COMP.IMG.getIMG('A14LL', 60, 60),
                    {
                        font: "Arial",
                        text: [
                            date[0],
                            {fontSize: 16, text: getFieldText("textbox_code_of_the_verification_laboratory")},
                            date[1]
                        ],
                        fontSize: 22,
                        bold: true,
                        alignment: 'center',
                        margin: [0, -44, 0, 0],
                    },
                    {
                        font: "Arial",
                        text: getMarkText(type),
                        fontSize: 16,
                        alignment: 'center',
                        margin: [0, -5, 0, 2],
                    }
                ]
            }
            const getPlastic = (text, index) => {
                let date =  plasticSealsAsf[index]['numYear']?.substring(2, 4) || plasticSealsAsf[index]['date_application']?.key?.substring(2, 4) || DOC_DATE
                return [
                    COMP.IMG.getIMG('plastic', 60, 73),
                    {
                        text: text,
                        fontSize: 6,
                        alignment: 'center',
                        margin: [0, -16, 0, 0],
                    },
                    {
                        text: getFieldText("textbox_code_of_the_verification_laboratory") + " " + date,
                        fontSize: 6,
                        alignment: 'center',
                        margin: [0, 0, 0, 4],
                    },
                ]
            }

//START Custom Tables
            const getTableEntity = () => {
                return COMP.Table.getTable(
                    ['auto', 'auto'],
                    [
                        [
                            COMP.PlainText.getPlainText("Руководитель отдела (лаборатории)"),
                            [
                                COMP.PlainText.getField(getFieldText("entity_head_of_the_laboratory"), 'center'),
                                COMP.IMG.getUnderLine(158),
                            ],
                        ],
                        [
                            COMP.PlainText.getPlainText("Поверитель"),
                            [
                                COMP.PlainText.getField(getFieldText("entity_author"), 'center'),
                                COMP.IMG.getUnderLine(158),
                            ],
                        ]
                    ],
                    [0, 12, 0, 0]
                )
            }

//START Custom blocks
            const getUserBlock = () => {
                let userText,
                    listbox_user = getModel("listbox_user");

                if (listbox_user.getValue()[0] === "1") {
                    userText = getFieldText("textbox_fio_user") + getFieldText("textbox_address");
                } else {
                    userText = getFieldText("textbox_name_of_the_organization") + getFieldText("textbox_legal_address");
                }

                return [
                    COMP.PlainText.getField(userText, 'center'),
                    COMP.IMG.getUnderLine(419),
                    COMP.PlainText.getUnderText("(фамилия, имя, отчество (при наличии) для физических лиц, наименование и адрес для юридических лиц)"),
                ]
            }
            const getA14LLBlock = () => {
                let brassAndMetal = []
                if (reglinkBrassMarks.textValue) brassAndMetal.push("A");
                if (reglinkMetalStamps.textValue) brassAndMetal.push("G");
                return brassAndMetal.map((el, index) => getA14LL(el, index))
            }

            const getReglinksStamps = () => {
                let labels = getModel('reglink_self_adhesive_labels')
                let seals = getModel('reglink_plastic_seals')
                let marks = getModel('reglink_brass_marks')
                let stamps = getModel('reglink_metal_stamps')
                let body = [];
                if(labels && labels.textValue){
                    body.push(COMP.PlainText.getPlainText("СЛ - " + labels.textValue, [0, 0, 0, 2]),)
                }
                if(seals && seals.textValue){
                    body.push(COMP.PlainText.getPlainText("ПП - " + seals.textValue, [0, 0, 0, 2]),)
                }
                if(marks && marks.textValue){
                    body.push(COMP.PlainText.getPlainText("ЛК - " + marks.textValue, [0, 0, 0, 2]),)
                }
                if(stamps && stamps.textValue){
                    body.push(COMP.PlainText.getPlainText("МК - " + stamps.textValue, [0, 0, 0, 2]),)
                }
                return body
            }


            model.dd = {
                content: [
                    //Main Content
                    [
                        COMP.Table.getTable([76, 30, '*'],
                            [
                                [
                                    [COMP.IMG.getIMG('firstIMG', 76, 64)], '',
                                    [
                                        COMP.PlainText.getField(getFieldText("textbox_name_departments_of_the_verification_laboratory"), 'center'),
                                        COMP.IMG.getUnderLine(370),
                                        COMP.PlainText.getUnderText("(наименование подразделения поверочной лаборатории)"),

                                        COMP.PlainText.getField(getFieldText("textbox_number_of_the_accreditation_certificate"), 'center', [0, 10, 0, 2]),
                                        COMP.IMG.getUnderLine(370),
                                        COMP.PlainText.getUnderText("(номер аттестата аккредитации)"),

                                    ],
                                ],
                                [
                                    COMP.PlainText.getPlainText([{
                                        bold: true,
                                        text: getFieldText("textbox_number_of_the_accreditation_certificate")
                                    },
                                        "\nVERIFICATION", "\nLABORATORY"], 'center', [0, 4, 0, 2], 8), '',
                                    COMP.PlainText.getPlainText("СЕРТИФИКАТ о поверке средств измерений № " + getFieldText("textbox_certificate_number"),
                                        'center', [0, 2, 0, 2], 12, true),
                                ]
                            ]
                        ),
                        [
                            COMP.PlainText.getField(getFieldText("textbox_name_measuring_instruments"), 'center'),
                            COMP.IMG.getUnderLine(518),
                            COMP.PlainText.getUnderText("(наименование средства измерений)"),
                        ],

                        COMP.Table.getTable([90, '*'],
                            [
                                [
                                    COMP.PlainText.getPlainText("Тип", 'left', [0, 1, 0, 0]),
                                    [
                                        COMP.PlainText.getDejaField(getFieldText("textbox_name_type_ru")),
                                        COMP.IMG.getUnderLine(419),
                                    ]

                                ],
                                [
                                    COMP.PlainText.getPlainText("заводской номер", 'left', [0, 1, 0, 0]),
                                    [
                                        COMP.PlainText.getField(getFieldText("textbox_factory_number")),
                                        COMP.IMG.getUnderLine(419),
                                    ]
                                ]
                            ]
                        ),
                        [
                            COMP.PlainText.getDejaField(getFieldText("textbox_measuring_range_measuring_instruments"), 'center'),
                            COMP.IMG.getUnderLine(518),
                            COMP.PlainText.getUnderText("(диапазон измерений средства измерений)"),
                        ],
                        COMP.Table.getTable([90, '*', 87, 68],
                            [
                                [
                                    COMP.PlainText.getPlainText("Изготовитель", 'left', [0, 1, 0, 0]),
                                    [
                                        COMP.PlainText.getField(getFieldText("textarea_manufacturers_name_country")),
                                        COMP.IMG.getUnderLine(239),
                                    ],
                                    COMP.PlainText.getPlainText("Дата изготовления", 'left', [0, 1, 0, 0]),
                                    [
                                        COMP.PlainText.getField(getFieldText("textbox_date_of_manufacture"), 'center'),
                                        COMP.IMG.getUnderLine(69),
                                    ]

                                ],
                            ]
                        ),
                        COMP.Table.getTable([90, '*'],
                            [
                                [
                                    COMP.PlainText.getPlainText("наименование юридического/n (физического) лица", 'left', [0, 1, 0, 0]),
                                    getUserBlock(),
                                ],
                            ]
                        ),
                        COMP.PlainText.getPlainText("Поверка проведена в соответствии"),
                        [
                            COMP.PlainText.getDejaField(
                                await TextFrom.getFromRegFromDyn(
                                    'table_list_of_regulatory_documents',
                                    'reglink_list_of_regulatory_documents',
                                    ['flcode', 'flname']
                                )
                            ),
                            COMP.IMG.getUnderLine(518),
                            COMP.PlainText.getUnderText("(обозначение и наименование методики поверки)"),
                        ],
                        COMP.PlainText.getPlainText("C использованием эталонов единиц величин"),
                        Blocks.getDynTable(
                            'table_name_of_the_verification_method',
                            [
                                'textbox_list_used_standart',
                                'textbox_serial_number',
                                'textarea_metrological_characteristics'
                            ]
                        ),
                        Blocks.getDynTable(
                            'table_name_of_the_verification_method_1',
                            [
                                'textbox_list_used_standart_1',
                                'textbox_number_standard_sample',
                                'textarea_metrological_characteristics_1'
                            ]
                        ),
                        Blocks.getDynTable(
                            'table_measuring_instruments',
                            [
                                'textbox_list_used_standart_3',
                                'textbox_serial_number_3',
                                'textarea_metrological_characteristics_3'
                            ]
                        ),
                        COMP.PlainText.getUnderText('(обозначение эталона единицы величины, заводской номер, метрологические характеристики)'),
                        COMP.PlainText.getPlainText("На основании результатов поверки средство измерений признано годным и допущено к применению по классу точности "),

                        COMP.Table.getTable([136, 44, '*'],
                            [
                                [
                                    [
                                        COMP.PlainText.getField(getFieldText("textbox_by_class")),
                                        COMP.IMG.getUnderLine(136),
                                    ],
                                    COMP.PlainText.getPlainText(" ", [0, 0, 0, 2]),
                                    [
                                        COMP.PlainText.getField(await TextFrom.getListBoxText(getModel("listbox_in_quality"), 'approved_for_use_as', 'ru')),
                                        COMP.IMG.getUnderLine(321),
                                    ],

                                ]
                            ]
                        ),
                        COMP.Table.getTable([201, '*'],
                            [
                                [
                                    COMP.PlainText.getPlainText("Информация о прослеживаемости измерений:", [0, 0, 0, 2]),
                                    [
                                        COMP.PlainText.getDejaField(getFieldText("textbox_dynamic_traceability_code")),
                                        COMP.IMG.getUnderLine(321),
                                    ],
                                ],
                            ]
                        ),
                        COMP.Table.getTable([73, 101, 10, 89, 101],
                            [
                                [
                                    COMP.PlainText.getPlainText("Дата поверки:", [0, 0, 0, 2]),
                                    [
                                        COMP.PlainText.getField(getFieldText("date_verifications")),
                                        COMP.IMG.getUnderLine(101),
                                    ],
                                    '',
                                    COMP.PlainText.getPlainText("Действителен до:", [0, 0, 0, 2]),
                                    [
                                        COMP.PlainText.getField(getFieldText("date_valid_until")),
                                        COMP.IMG.getUnderLine(101),
                                    ],
                                ],
                            ]
                        )
                    ],

                    // !!!!!!!!!!!!!!!!!!!!!!!! IMAGESES !!!!!!!!!!!!!!!!!!
                    [
                        COMP.Table.getTable(
                            [316, 60],
                            [[getTableEntity(), '']],
                            [0, 0, 0, 5],
                        ),
                        COMP.PlainText.getPlainText("Информация о поверительном клейме: ", [0, 0, 0, 2]),
                        ...getReglinksStamps(),
                        COMP.Table.getTable(
                            [60, 60],
                            [getA14LLBlock()],
                            [0, 0, 0, 5],
                        ),
                        reglinkPlasticSealsModel && UTILS.generateImgByGroupedData(UTILS.groupIntoChunks(reglinkSelfAdhesiveLabelsModel.textValue.split(', '), 5), getFirstQR, 5, 60),
                        reglinkPlasticSealsModel && UTILS.generateImgByGroupedData(UTILS.groupIntoChunks(reglinkPlasticSealsModel.textValue.split(', '), 5), getPlastic, 5, 60),
                    ],
                ],
                background: [
                    UTILS.generateImgByGroupedData(UTILS.groupIntoChunks(TextFrom.getQRTextArrFromTable(), 3),
                        (QR_text, pos) => {
                            return COMP.IMG.getIMG(UTILS.generateQR(QR_text), 100, 100, {absolutePosition: { x: 485 - pos * 110, y: 730 } })
                        }, 3, 100
                    ),
                ],
                images: {
                    "firstIMG": "data:image/jpeg;base64,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",
                    "A14LL": "data:image/jpeg;base64,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",
                    "underline": IMAGE.underline,
                    "firstQR": "data:image/jpeg;base64,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",
                    "plastic": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAcHBwcIBwgJCQgMDAsMDBEQDg4QERoSFBIUEhonGB0YGB0YJyMqIiAiKiM+MSsrMT5IPDk8SFdOTldtaG2Pj8ABBwcHBwgHCAkJCAwMCwwMERAODhARGhIUEhQSGicYHRgYHRgnIyoiICIqIz4xKysxPkg8OTxIV05OV21obY+PwP/CABEIAW0BLAMBIgACEQEDEQH/xAAdAAEAAgIDAQEAAAAAAAAAAAAABwgFBgECBAMJ/9oACAEBAAAAALIg1+Ksa79Du6Dv0Hfp36d96kfuAOISx0z5gcDng54HPDn4x/E9h8tyAjHHS+AAAB4q42bAcVtslyAAAAiHbdxAVysaAAAAatosxgK7WJAAAAMBG8zgK7WJAAAAMHGszBhoU8mhb4AAA5Dhj8Htchybzha52RyoAAAAHWJ8LOle5x+8HYua9mAAAABWyyNcbIVTmTYay2xyAAAAAQHOFfbG1WkSY65bJNghjTnEkRxNep5giL7PhZL2gECTpXix1WMXnu8oySKyzJo29xVFm6Z2Rtsw0O7j58ZOfrAIJm+vFjasxHsW8ZeyQrNk6zWywW7Z3N1cs94YahjEWUnD3AEEzfXixlV8LMNeLOScKyzPpG5xbjcrPtRJ113Wd5+OBm7KAEEzfXixtRbSZKq9js+Ik0LtzJejeKOZH3fC65xwsX7ACBJ0rxY3XK5/CX5YCtszVTymcivb5fxejSnIVdcdibj5AAgSdK8WOAGhVV33W9n3jX8NpfTctR2aI7LzZ7gCCZvrxY4AeWuGy4HpgJflKu3ylGsO5fC2YAQJOleLHADiLos2Xfums5TW66S/NFY5dz0s/cAgmb68WOAHwhSS9OjPfpRgvR5g3SGvhFm02tywBBM313seAPhoerYviue85W2moQdIkat3m/1gEEzfXixwAq96nxzEAcznFcj7v6q42G16b8sAQTN9eLHACsm4QRYjUNMkzE6u03OeGeqp3yyQBAk6V4scAKzZittqcBlvD4MNYmmdrtWwNZf0LygBBM314scAKubl18/h37VaszdZSCtM6fDx2/zABBM314scAMT4fR5snx8PJ7sh5sYy3y9/cAgSdK8WOAAAAACCZvrxY4AavqHxlP1AI6x/pkwAQTN9eLHACK5H1/57iBxEEuw/MYAgmb68WOAHyjb37+AYTRdw2UAQTN9eLHAwuQ9LjWtlDjtwDWdlc9gQTN9eLHAjHWcZn85gHz8fzz+HnaGPj39vfNYf7eXNSHyEEzfXixwMLrXjzmEz3T6+Txa1r86Qx9NyyHh2jH/LV9w2cECTpXex4AA4c8ORw5AQTN9eLHAAAAABAk6V4scAAAAAEEzfXixwAAAAAQJOleLHAAAAABAk6V4scAAAAAECTpXixwAAAAAQJOleLHAAAAABAk6V1siAAAAAEATnFOyb7yAAAAA6VetJ1rfmtl57cc8OeOXHLj7fEHLqd3R5I5m3djBYb7gAAAA+W3/V/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/8QAPBAAAAYCAAMFBQgCAQIHAAAAAQIDBAUGAAcRNVYSFyEwNwgUIDFBEBMVFjRAUFEiNjIjVBgmM0JSVWH/2gAIAQEAAQwA+ER4ZN2qAgUu3JyCSOPd8QiZxBjEO3OBvt1/7KoOBvl50lnf6/6UHA30/wClhwN9P+lhwN9P+lhzv9f9KDnf6/6UHA30/wCljYG+XnSWBvl50lgb6f8ASw53+v8ApQcDfLzpLA30/wClhwN9P+lhwN8vOks7/X/Sg4G+n/Sw53+v+lBzv6e9LDiO/AA5Sua0oQkFtymy5gRFydmqRQqhAMQQMUPEPKERAfAMvmzF2zwYGuE+/ka7p4XhwkbY7UcuY6uwEYkUjGJaoh2C52QzsF/rOwX+s7IZ2QzshnZDOyX+s7IZ2QzshnYL/WdkM7IZ2QzshnYL/WdkM7IZ2S/0GLtWrggkXbpKFsWqqfMlU7DIGSpXF01U+TI6ML+Fg5uPnY1B+wVA6QeTtK3nrcD2Gx+D3VlFJDMCSz9PjJAUAD9xwyRj2UkxXYvESqoQy7zWV8GIcqiMQHkG4/TJdP8AN2427BTidqUAAOAfuuz48c3ZAle1UJApOC+vpk01TId2c4GV+Mc1cX3nZtxWU/5h+7uyJV6jPpH+WjVRPTFSCPk6j9Rbn+8txR/Ks6bh4aJ4fk935OovUa5/vLeThUpwc0R/p7z4RyZsETBNBdyTsiCT/eiiix0ISAUXzvc2GIeFYLlbnrfATkpKtYFQ64ba2EHyq5M729idMEwNt7D6XJgba2GHyq5MDbWww+VXJgbb2H0wXA21sMPlVyYG29idMEzvc2J0wTA21sPpguBtvYnTBM73NidMEwNt7D6XJgbb2H0uTA21sPpgmBtvYYB4Vcmd7exOmCZ3t7E6YJne3sTpgmBtrYfTBc73NidMEzvc2J0wTO9zYnTBM73NidMEzvb2J0wTO9vYfS5M72th9MFyT2VfpGNdsla0BU6fbrrVIw7BjXTKpl3Pb2ZuL+rk7Fa23WrCoRsJhYug8QD7LFOtICJdSTof+nXa5L7Ll1ZubXUJHRMFEQ7YiEexRQJ+/OQihRKcoGLeNTQ00gq6ikCspHVV2fndr1aeMf3wM3k+XWXgIFE2Q0U1iIliwbk7Kb58zjmqrp2uRFCZ3wxbLHJFRYuQZb8c9vg9giCnWLfA2hqK0c5/z/e8M3EyGCtUDZWYdgzZYrhqgsUfDaw8dn1HPHNkzclbLejXI8RFCq6vrEGzT+/ZpvXspS6nJtTIuYZqBbLBS2tLM0eR7gxm0PJtpWKZyCA8Sfvd/wDJoPIE4FgYn+9seqdQw/8AxMOanIDjY0ouoHE9S2m/m7X+BnjkUiGMBQExhAC7YulUm4UY5k7+9e6ft8SpBx1e95N7/wDBsXZUvU5tswZMkFg75rr06jnfTd+n0s757r0+jmtL3IXAksZ42RSGV3fYGMpIsiMGhiUmyKWGtspFyCCS2xNgytVeRaUc1QcFvVwka5X2UgyaprKktsibXQWQWyXvdAt0hZq+8kHjZJFVPeFsWFQiEM2VwNz3bp9LO+m79PpYvvG3tyAK0K3SCKenexUe6OUCm8nf/I4HK/yGHzbHqnUMV8Ez5pz/AH+azWAgTZ5zCPANnbMO+OrCQioghTtMkfxxXk+o4QGtavr1alU5Ji5fHWD5fBtseGx67lzvMdTyszvmjlYA39WADlMjkNaGNsqsnJNG66KXs/HEUbJiFWe2m7zsczXRSUDQ9pHxCYjsi10tTJHZT5DP1alsSCtz5Vg0ZuEjzUk2h4V+/WQ7aNWtMbZ4R8+YNVEEtC8ysYZJ7qrsXIPGC8Y/OqhvWurKpJJxMiA7/DhDweVn/W4PyvaF5LBZX+Qw+bY9U6hi3/pKZpz1AmsXdO28zImaqnTUoclDQlnbrzjETpbCc3tnKyMs1fvE4bVCl4fzLSRfOni8WHwbf9SK/ntAiIoV7AEeA5p700ls9nzwbWTELLquFlXa6blq3fsti0189QZtJhNRaarUFNEIpJxqTg+rZyHr9qlVpJ0DZB3JQD+uLP3KiasVWD1VWFejWvugZaD5rZMuZhC2T2Rhh/EWOb/5NBZVv9ag/K9oXksFlf5DD5tj1TqGKB/iYM0+IFv8wBvnRI5Qdltvv2ZxS2XrVOeSPKRaRSSKs1Ym1bXgHrdb3TTxQ/IUcI/L4NuAAbGr2WynV22kaEkXahQHSdDD5Pn+RcBDVasyUdHuTmR9n7/BCyZsmhV1mxeSkU5crv8AW+vIEWcJNv3SyMm4ct0SmBZdMmU6lspyySiE2Dls2t8Yzh9WyTBioc7fR/8Aps1mhVCJSlhE5wDJPUNKkX7p8s8egqhpeiIrJKkfvu1vxVI8RBgQ5BGuKCFbgyh4eV7QvJYLK/yGHzbHqnUMHjxyeI9oGyTSBEhFCEmYqcYJPWDoiyahyJFMdQ4EJtK3ks8iyg4fiujUocIKuRkZ9fg2Bq9e2yyD9OTTbAbQT3qJERH2fXwfOeRwfZ9fk8fzAjmvKGvTSSRFHxHIOa+OuJZ5b3Ln3xNWJGcc95ZVgSbbBu6FveRzhJkLYAmkdqMkK63SFgexQgwWpX0SKv3xtGk7dUliAfhh9BPe2oIT6OD7PzzqBHA0C86gRzuDf9gS/mBHIxqZjGsWZjgcfJ3/AMjgcr/IYfNseqdQ+y01OItEcLJ+A8XWq7/X3R1YRyK6Y03bk6IIPhd/dUTVrCsnB67VB0/D5fDtuyTERd2BG0mu2bV2512yquEop4dY9utFkb2iaQRm3qacDE7WsLAH8ZIvFUApW6f+9c5NS9hXUVj5KUcr5AU/Y8vAlPFqKDGa312rEsJIlkiGh1JlzET5BYa/SKhL151ZyX2Pr8+/XXJbKlbAl2BqeQjJhZLXDVhs2XlVzppxmx/utgrSC8s7GG2HsFeTnwWr809IyrSexrKLosVKvVRiUnKUWxTdCIuPJ3/yOByv8hh82x6p1D7BD7BAPjuVArliVUkH5F/v6ROWyIWenr7YVj3SBqh6urNi8ALDVbLsKMigQgW6x2RL5t8nzj1hyN17r2aFNRdcx5KbkLtT5FWErDBU0Wa/beEBAY1ThAq3yvyTmQYRLkq4ubz+ZRsQxLj3/vH2xw8WJgCWtFxu6KbVZD3rJSp09jQAeHXAs6wTI4kGSBwHsWWEfa9RQVpbNdQ8Wu5Xi49Z0Xgv5PtC8lgsr/IYfNseqdQ8t+A+4vM0B4Pp3JjSLaTln8gNhOmKlyPqww1hBkEkQPaBddNJZqJz79sZd3wAmSWylo+8NqwWMIfDGEAHHG+3KDldAK4mOf8AiCddNp5S7kpb4CQemZFaDR7srTpGQclYEdGtdJSka89vIPxIfXOskrHHN5s8odAfngBw8rf/ACOByv8AIYfNseqdQ8swAICAhl/pMnMtGJK4KLJXun2YI86yOnYKktSQtsag7k6tN0y1keDGxKABX7fTpGwrxMbHgi8mtfTj3YzWxJHb+57JqNosbyMWhXwIJ7mjWjOoRYpM0CLQkO6mpRpGNRKC7DUV/ZHTBKQRTStErVKoyaLyUUgJXIyFytjpjErqJta3ZI/WccNfn+2LwN4Uv/4PcZu0XjNq6R49jyfaF5LBZX+Qw+bY9U6h5bsTEauTFEQNqC42GxuZZOUd/fgvdqe1XVbup9mkrMq6bnXxnslIRy69vsMJVDswoMggkFZkdWMDtpUskzQlEZqIXjTSSL9E7LZOy3TZ1Fkqs+kckwhtyys0m8jGv3CFMplcg69FzMvHEaSIX6ih87KyzctmgJeHiE4uTQdHiG1ZQqbF1WxQUtc64n3ViamtYLFX2WzobZrGjVzoCevcPy5B+V7QvJYLK/yGHzbHqnUPLcAQ6aqJlCkGmUOJqC7xVlIqLDL6YgZSTeP1Jxchx0JAdRrZ3CRQjwTsS+SjRNjJvWhTdosdsiVZ1NWtEYoHQ1vr2NtLaQWkHqzXG4oJN0kQXL2dkiH5CnzEzWutIW0wq8lJLuC53I0c/gk7f5U41pAbg/DklRFHb7YXl/aJF4iQdEV8vzmnZMj2pGbBm0TP2ieT7QvJYLK/yGHzbHqnUPL3MRdW7RLRJyZIT6NsfUyI4OjLJ1MjjjSVhbILrnsqQhoJRVVGxCdU58sX+wzeV+Rbxc3Gvl0hUTlGhtqiDyA4RxKtWZexzTiKbyYInstyaQtUd0Rykuu/0qTt0N0kBgA2u6HNVSVkHL+SScBsNU5LzYBIbgOkxIvTFRWD7w++110EIFNNU5Mrhh/L0KIiPHyfaF5LBZX+Qw+bY9U6h5e3B47Gr2bkss7AIQx4p+dsPehfuoV81xNSs7QJR3KPDuV/Z9H/AKFjylRMdMbQlWci1Iu3tMHrZsjJQjOPapzlAUJr5hKtbScGC2lDgrdpE/HiF/19cJW4TT1jEnWbjI36hj+GA5Wjxg7Ptexqrpxcq6XM91rsV+6WdOopVRfXcHL1yiySD5AzZ3MWScmwR/E5BV1laMBK5CcPEfJ3/wAjgcr/ACGHzbHqnUPL2/6kV/N+IKqoQJUUjnwGD3h+kXzUaaqWt5cihDkH2exAELJlmrbai+9WmBKuvJJQ6UnAq7EfEVTmoUWG0W7t7aFyt1dHkIlc5QCD4Wl++jK9KPmKYKObPYpa0TLVeXRIirWKPXacuu6ZLrEPH3+fVvy0MskgSJ2bsuZhZhWJjhZqNR+Q5X/9fg/K9oXksFlf5DD5tj1TqHl7odJtL5DuTgIl7/q3w5RIZ3+Vn/6iRx7viursnSBIp+A+z9+nsuVvZLactL2BJGnRPszZLVgWcrB49UVBAPl/iOaI8bRJZPSxIWIfyh0TKkXiA2msWxtVCsCbE2O2tjFmxTYHbi+2Yi7oaVY/DTgen6rkrXEDJISSCCV6145p6DJVd+k4GuGE1ehPK9oXksFlf5DD5tj1TqHlyVegJRYqz6MQcKfkqmAHhXmWfkSm9PMcGlU7p5jkfCxEX98EexRag1gYVi9UeNo5BJ0/q9ckHB3DyJbLrBSaiHj+AMgCPr8HGKmWYRjdso5atnbdVu5RIskwiYyMROgxZpN0hpdOHtG/AWfaGlU4PlAMsYRkfGoC3YtU26MlDREsmknIMEXJUkk0Uk0kygUnk7/5HA5X+Qw+bY9U6h5g8eOcfKEc4+Z7QvJYLK/yGHzbHqnUPLtlobVuPByqmZZYrPbEqkDlaXYwwOZrYNSIDmZK1mIti9bP2bd21VBRD4xHLLb5JGWLAV5iR5K/ge0ziCxriyTPEW+djpltB2toig4AfK9oXksFlf5DD5tj1TqHl7HEY6bqE8uiKjBm6bPG5HLVci6NwsEVCQr0785BHXUc7iqXCtXYGKv8f1DIZ41gtiWdnKCCBw4iHEPENiPW0y/gK7H8F5EBAfK9oXksFlf5DD5tj1TqHlrt0HKSiK6RVEnWqIEFTnjZGSjAhtbVuMdkenBw/dgHDyBAMna5DT7MWsmzKuTuojSnEiVhnCN69UYGupKEjGnYMAAHle0LyWCyv8hh82x6p1D47DONoGIdyTkhjJtHRHbRu4IAAAG4iIcQ48fn/fa+fAQ4lsxC3H8vC1HtAbwEQ4DnbL4+IZ2vAcA4D4gICAm//c7XiAcQziOCcADiIgAdrgIBxDBNw+YgACP1HhwAQEvEPEAOAiYoGAcnLMERL19gLUVRFQCiHEQDAVTAR4qFDO2Am4FEBwPi9oXksFlf5DD5tj1TqHx7ejWbumP3KpBFSfA9ZqtajYIFUjrVeWBAfcKdKtHk6/sriPpEK/XMydq65jmYoOYWVex72aifxja5GqztdFF1HN6lf6ojELOSNwg28/sy0s37l0LGyGfuLSStNGLxzGow9qjJBk8gqw9jBWaBcb1Nxsg6XJGysIFev1Ibs3zoWQ+HhxHISLbXiWsL+acOBQho1SF2ylHBIunDaswiF1UmpideOVwiGysDdlaqR8u5iabMhXGllhJVU4jrpm7GGXmXwn982GsKFkoSoImVyoKhZZV9JzCihJK5QdNj3ArLRq7yXoVMPXUXDl0uY74Pi9oXksFlf5DD5tj1TqHx2OERn4R9FqqmTKajKPq6SHnJY7wytLtDlD3J5eHSrKWpURJQzGOA6zYy9Hn3/wBy2m7g5dsyVgpLcSfI44Fnap+KWGuS4OxSyPrXuVrmp0HXayxU5KWkG0sykV42UTpUm6etHM9ZV5FO5LxLG0g7LKP4ORgWa85foiSTl3cun7tJlmjuQkgFjLvImLs8ssyn39edUGNXdXd/Og+eSDZSivGck9f16xLxmV2npxL51Ju5BeRk7jQGtllGb0Hp22SjGSVbtU4uQIxGerIy0rXZEHIJZJVUFbEwn2Dz3R2lQrM3mJCWbWogOoWMszFyqaVsBH6QfFv/AJHA5X+Qw+bY9VKj5HD4OH2cM4ZwwxCGLwOUDABClAAAAAMMmmcOBygYAAA8M4Zw+wQDOGdn7OAfH7QvJYLK/wAhh82x6p1D+E3/AMjgcr/IYfNseqdQ/hPaF5LBZX+Qw+bY9U6h/Cb/AORwOV/kMPm2PVOofwm/+RwOV/kMPm2PVOofwm/+RwOV/kMPm2PVOofwm/8AkcDlf5DD5tj1TqH8Jv8A5HA5X+Qw+bcAG+xKm6P4EL4lAePH+D3+cgRkCj8zw6Ypw0WQ/wDy3ZXFZKAbyTUnFbXVxb2authE4A9KPh/AnUKmBjHMBSyrkdjbJZtWvEY0oABSgAcAOQhyHIcoGLZqHYqjLnn6gc50ITfMYJCozcau2XJuig/V26wNz0D6vXWF3ZQyh+qXwNz0D6vXWF3ZQyh+qXwNz0D6vXWBuegfV66wu7KGUP1S+BuegfV66wu7KGUP1S+F3ZQyh+qXwNz0D6vXWF3ZQyh+qXwu7KGUP1S+BuegfV66zvuoP/ducDdGv/q7c4G6Nf8A1ducDdGv/q7c4G6Nf/V25wNz0D6vXWBujX/1ducLuyhlD9Uvhd2UMofql8Dc9A+r11gbnoH1eusDc9A+r11hd2UMofql8LuyhlD9UvgbnoH1eusDc9A+r11jndtJRS7SRna55K23TY6v4XBMDtI+j0lhUowW6Qiq6+zhkpVaxLHE76Farm7sqAPa/wDLqGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGd1lA6eQzusoHTyGJa5oqCgHTrzXig2bN0ypIIkST+z//xABBEAACAgEBBgIGBwUIAQUAAAABAgADBBESExQhc7IwMQVBUXK00xAgIlBhcbMjMkBCkhUkUmJ0g5PSgTNjgpHR/9oACAEBAA0/APrepPNz+QE9rEVzrt8uddvlzrt8udc/LnXPy51z8uddvlzrt8udc/LnXb5c67fLnXPy512+XOu3y51z8udc/LnXb5c67fLnXPy512+XOuflz2rfqewRjyXIASEagg6gjxHIRrVG0ElnM0Bu94vkVrGv8MfMMgYTTlbjjYH9Msfz5lP/ANR5Z/UrDzVvYR4WbrXT7V9rzLG3q3nUp/irlKurTPYbB/BuSv4Xo/QMOkNtv4zAtDjptBXurPfr5eCOK0/5v4xsG2JnWeD/AHn9f+M4K2ca3g/3n9f+MOFbONf6w8tfNj7FE9T2E9qzo2TO296j1OVG2+3ynRsnRsnRsnRsnRsnStnRsnRsnRsnStnRsnRsnRsnRsnRsnRsnRsnRsnRsnStnRsnRsnRsnRsnRsnRsnStl9TIxFNnk0e42FrKXM/KyqHktV/IE/g300rqF9bt6lER9EQdiRfUo5/mT9wEaEEagxBqNjlXZMbUUM/mdjzrP0ZJNrr/wCdhJRSqStSzu50Ag5b6190J7arecUftKX5On8fYw2z7Xpllav/AFDWbrE+If6KbxUqep7PWxnnZdcNsfkghHmiBGH4grH1el/ao86nmTUrqPZr/HcVZ2Q4VHYJusP4loBKqsuwfmbAIGv/AGgfn+ygGpJ8gJjZYI0Q90rFx2Ch8tS31bMYWavrrqSROnbOlbOnbMY1bG7/AM8x8u6oE6+SPLS4ZUbkNDMmtzYW1JUgy+2tSjAnzGs4RrdzodnbDESq50CICBoq6xPYrmdK2dK2HyLq4l+PXawXy1ddfC4u3snA0dgm6w/iWmyZwmV+qIGzYDsX3p52n/Akt500U8mCe14iMoFrgro31d1j/qzJJC7nY9X5kT3a/wDvAt9OlumuqJr6iYXx5xmY5a3XTQWGe/bPSB31RxgHCLV1dJXVvdbwmkxqWsatAOYX1AGIXrK2KoYkL/kmwkx7mrYoE01WO4QMQk4uztn9n436Y8Li7OycFR2CbrD+JabJnB5X6oj3316p+8Q5I0iHZAPLcP6mYGW2pw9tdulZDiFLRt2Wapt/V3WN+rN5d9HEZf6Qm3jTeWJe4VtrXU7UvcIiaHmxlKMK2fXlrDRbXWf/AJy6gtYx12TXAX2hWCBt6TdJ3Tjbe6cRV3CcZb2TgKOweFxdnZOCo7BN1h/EtNDrDjZSj/knF5D6vWdByJERft1+q8CG5Gr3ysDW6H90Q23d/wBXdY/6sxixTc2qmpadev8A6Qpfb+2sVm2nTSbeNLs0mykWCznYxLclEW/epQbVA5HlqhEKMQGYLqB7NYotet9d0C237XEoxNipnIYlS04l+yFEmRa1jgX1gatEcMNb64MqzsgwMf8ATHhcXZ2TgaOwTdYfxLfQ9xvT2WVW/vCONdARqp9jRRqWJ0A/EmU2/wDNcZRSA/4u3M/VTHFWwULTpGdMzpmZRq5qhAXYl99qLj1gq2t59rTHG/4NgWcjHmLU40ZgddTrMNEvNtn2wwQbMxcMg2gaA6trHyj2TpGdIzptOk0x6K6tfLXYUL4XF29k4KjsE3WH8S30Lq1Vyfv1t7Vnqtx7d009fEXhUnqP8lX4J9bhaHetGIXk5lCg2Bq3TuleXaqqtrAACFympzNjmJ/rxKLmVq3tNih0JEvDjd8UET+kmPcjUhgl2iqJRaXvNKcId0vJhtvBkivJxrLt6jctYEG/SmxKELhpdZu0KoX5ga+qPdYUTmQFP+ScNWNEL0/blIBs28wp3GJQgt1ba+2Bz5+FxdvZOCo7BN1h/Et4dOKyqa32eSAmWIBbpSbdBLdw+RQLhytsIFg2JvXIYY+85z8cOXpvsmpcjmLX5vylABpJoN3N+Z+1P9GZcjK5fGZho51M3ot14ZtjUDSf6QzFbfaUU/aX+WCpDZSb+avrzBSWX1owHI6MwBmYSuVtpv8AkkfGqa0abOjsoJGnhcXZ2TgqOwTdYfxLeHw9naZuKpk3vbscPrprE0v37vuDrZOuf+kupyrSPYXlt9NZvNumm9gBMR2XU5M/1Mqd69gPtg6JMivYKtaa9NG1mYBk8HutQm2fLalObpuRUG13Wh8Ti7eycFR2CbrD+Jbw/XK7SbSh3Oo/NZ/q7Iv7VrRUMglH8gXeYxrD73GRebynehnGOqD9kdDzErvocgv9vSuUVuLRvmr1JM4qtHsRBqTsTIfZQsSqwWBnSvIcAy6zYG7x0Y6gTMtZ8eixylQQDXTSG1skigbabFs6UvqWxdeR0cajwuLs7JwNHYJusP4lvDSl2B9hAlFSFOQWVsVdGcAgiFQm2byvITIDnLND77mn7mu3LaAb7DaQdu0avFQs14bVAF/GPU+/3OzbzgYWou4CTGrNl99rMprIM6oleYXcVNqQNiDGUqlLl7S/832IdyLd+m6O52oXcX7ty04GjsHhcXZ2TgqOwTd4fxLeHZWy6nTkGGkyECsLCJk2mxlATzae4k6KTHyLagxHnu2Kgy2myoPr9vSyY9tSIAAA8qRUB2h5KNIaIMk0qlJCckE6yTFutrR30B5pLcXGrLINfNzPxRJRSlaN7Qg0B8Li7OycDR2CbrD+Jbw7sWlNdSACbCJ/uT/clVbOdNuBsecfkfqGY+Slj1r5sB+c9HKa7kv+wXazpylXZrHd9CEOh00mNTuHyV51Ek7cObkL/UgmRRsIEZyQduDLbQiDPt5tz9Qhe8w4NHYPC4uzsnBUdgm6w/iW8PdY36sussDlQJ7qQWZSbbaDkKxNcab/AD2KP7Q0toKYtQDamxuazMcPjqeZcIpEOLc3/wBvLrgUcFeeiCXaXbnRGlShnA3ay06u5dYj5Nw/olIIr2/5dYcDHJ/4x4XF29k4KjsE3WH8S3h7rG/Vge4nQazptN/l/pia0SzIIKW/ta9Lzq3JZi1PkCsEpSHxv3NUMwCK8cUOKQRYNTrtxMOzvlFBapSpcFvyECpUFSs16KT+MyECOb7hpBc4F+7I1QDkduW4YLOQbDrZ9H9nY3YPC4uzsnA0dgm6w/iW8OnHpcgeZC2Ez/bn+3LaXQE7E3mNMY3A2lw2u5bSXYpTfajT9qJ+c4A9wmLSXKAgEzC0qNNg22cp9uY2SXZmfUNyKxaK6t/vP8BguerYYEnVJku4AQEAbAnAY/YPC4uzsnBUdgm6w/iW8NV2Q1iBuU6QnSE6Qlmm3u12ddJZtF7lXRzt8zqYwANjoCTpOlGXZZq10JEsXZdHGoIjHVkrXQEkaQ/+2J05tFtisaDUyskoLBroTEUKqjyAA0AHhcXb2TgaOwTdYfxLfcnF2dk4KjsE3WH8S3h2uK8bHT966w+QEY8sZK97Yo/zmLyuyMcbF1I9pEvQPW48iD4JTbtL8qcZT5Gyee5XH1rmUSMTNp/9C4+z8D4fF2dk4GjsE3WH8S3h4GTYuSQNQm9GgeWDVLEbaDCW0uleP5vczjQACCos6nzTbJYDwfS1ld2He3IWKBzTX6OPqyGKc+Hrr8yT4fF2dk4GjsE3WH8S3h2KVdGGqsD7RHYk1Yt5WuL5XZlm9K+EP3D5Mh9qET1UjJj/AL9zHbtf82Ph8XZ2TgqOwTdYfxLfXoTUovm3q0EtqR9NdSNoa6HT6RDgDKF2vLzI0+gef4fUPl9J9X0D1w+X4wHmJ6TydyH102IfadJr7R4HF2dk4KjsE3WH8S318UK1RBIAJYCemL6RcVsIc7aDaCO37pM0Oxmf2ttPt+156VvNWfbUwD6V+pWEodWNz2taLeqrQ+g0NxosNbOA7T0mL0voe1rUbSU49FhoS5kV3M9G4CWcJTk8O9hPtc+YldwN6WekBdRdV6wUY+c9EVVBMWqw1i135l30mRfa4xrbi4Rv+p+jCznxMXDS0oiBOWpCxfRLPSt9hcoD/JE9I3Y2PiJc1VVKV/gkzvRz3rVdZtvQRyI1noIvfSz8zZivzWemLzkuhPJK/wCRIuexCJzZjPR97VV+jD9kYS+okfzu09IWa4+HVfYHutPasyx+1QOWqpHmK01+vxdnZOCo7BN1h/Et9fITTbXzWUOjYmTVWKbKN2NBDycJQiWuvsLzAKNhZFba2VMnr1MQgtRXUtBt08ttxF9HriCjT2EnXWejGcirZ129vSZ9dVe6A5KK5RXu1yaQCHT2OpmM4enGSsUV7a+TPsTcqjZYxjfi5KepXmGlhysq3H4emr/AlUNIVcUV8w4/m25bYOIS3DN2Nkn1WJFw91xuTVudu4nmKx/gEzHNmRQa1uqL+0AzIAV8q0AaJ6lRR5REFOSieWRTqH2DKrULa1CwNWv8gHqnozJN2xs6l5WDXlAJtJk1exxMpudj4gsZE9SISeQjIAlYxxTst9fi7eycDR2CbvD+Jb+B9hGsHkANNPo/Ea/wHF2dk4KjsE3WH8S33JxdvZOCo7BN1h/Et9ycXZ2TgaOwTdYfxLfcnF29k4GjsE3WH8S33JxdvZOCo7BN1h/Et9ycXb2TgqOwTdYfxLfcnF29k4GjsE3WH8S33JxdvZOCo7BBVRz6d5MP3Gci1ouJSPy0QT0cxd+m8xVFeTX+Xk4+4lGrMeQAHmTMDkbB/gQ6s8AjLoVPMEGa7dlAGpT/ALJF5O9Q2xOg06DToPOg06DzoNOg06DzoNOg86DzoNOg86DzoNOg86DzoPOg86DzoNOg86DzoPOg06DToNOg86DzoNOg09gpK90c6XP815boci/TQufYPYv1PLaZAGnvPPeee889557zz3nnvPPeee889557zz3nnvPPeee889557zz3nnvPPeee889557zz3nnvPPeee889557zz3nnvPAeW0C8HkqKFA/8D6f/xAAUEQEAAAAAAAAAAAAAAAAAAACA/9oACAECAQE/AFr/AP/EABQRAQAAAAAAAAAAAAAAAAAAAID/2gAIAQMBAT8AWv8A/9k="
                },
                styles: {},
                defaultStyle: {
                    font: 'Times'
                }
            }
            model.trigger("dataLoaded")
        })
        model.EVENTclickedButton = true
    }
} catch (e) {
    console.log(e)
}
