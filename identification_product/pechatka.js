try {
    if (!model.pdfMakeLibPromise) {
        model.pdfMakeLibPromise = new Promise(resolve => {
            let pdfMakeLib = model.playerModel.getModelWithId("pdfMakeLib");
            pdfMakeLib.on("pdfMakeLibLoaded", () => {
                model.pdfFuncInst = pdfMakeLib.pdfFunc;
                model.EVENTpdfMakeLibLoaded = true;
                resolve();
            });
            if (model.EVENTpdfMakeLibLoaded) {
                resolve();
            }
        });
    }

    if (!model.EVENTclickedButton) {
        model.on("clickedButton", async () => {
            await model.pdfMakeLibPromise;

            let
                UTILS = model.pdfFuncInst.UTILS,
                COMP = model.pdfFuncInst.Comp;

            let PlainText = COMP.PlainText;

            // Поля для акта идентификации продукции
            let fields = [
                "counter_act",
                "date_date",
                "reglink_sa",
                "reglink_sa_structure",
                "textbox_name_ops",
                "textbox_address_1",
                "textbox_fac",
                "textarea_pro_name",
                "reglink_code",
                "check_pbhcdb",
                "textbox_qn1q28",
                "textbox_fbt2xo",
                "textbox_jcos15",
                "textbox_hwb1n7",
                "radio_adress_copy1",
                "textbox_l7vxty",
                "check_lh2gk7",
                "textbox_xuaspn",
                "textbox_g17plb",
                "textbox_bin",
                "textbox_name",
                "textbox_address",
                "textbox_faddres",
                "textbox_iin",
                "textbox_add",
                "textarea_nhm46l",
                "entity_OPS",
                "entity_expert"
            ];
            
            let fieldsVal = UTILS.getFieldsVal(fields);
            const getModelText = (fieldCode) => fieldsVal[fieldCode] || " ";

            model.dd = {
                content: [
            
                    {
                        columns: [
                            // Изображение
                            {
                                image: 'data:image/jpeg;base64,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',
                                width: 90, // Установим ширину, чтобы соответствовать QR-кодам
                                margin: [0, 0, 15, 0],
                            },
                            // QR-коды (старый блок QR-кодов перемещен сюда)
                            {
                                columns: [
                                    {
                                        text: '',
                                        width: '*'
                                    },
                                    {
                                        image: UTILS.generateQR("Product_Identification_Certificate"),
                                        width: 90,
                                        height: 90,
                                        margin: [0, 0, 15, 0]
                                    },
                                    {
                                        image: UTILS.generateQR(getModelText("entity_OPS") + " " + getModelText("date_date")),
                                        width: 90,
                                        height: 90,
                                        margin: [0, 0, 0, 0]
                                    }
                                ],
                                columnGap: 15,
                                width: 'auto' // Изменено с '60%' на 'auto', чтобы уместилось рядом с изображением
                            }
                        ],
                        columnGap: 15,
                        margin: [0, 0, 0, 20]
                    },

                    // Заголовок
                    PlainText.center('Акт идентификации продукции', { 
                        bold: true, 
                        fontSize: 14,
                        margin: [0, 0, 0, 10]
                    }),

                    PlainText.center('зарегистрирован в реестре данных', { 
                        fontSize: 11,
                        margin: [0, 0, 0, 3]
                    }),

                    PlainText.center('государственной системы технического регулирования', { 
                        fontSize: 11,
                        margin: [0, 0, 0, 10]
                    }),

                    PlainText.center(getModelText("date_date"), { 
                        fontSize: 11,
                        margin: [0, 0, 0, 5]
                    }),

                    PlainText.center('№ ' + getModelText("counter_act"), { 
                        bold: true,
                        fontSize: 11,
                        margin: [0, 0, 0, 15]
                    }),

                    // Основной текст
                    {
                        text: [
                            { text: 'Орган по подтверждению соответствия ', fontSize: 11 },
                            { text: getModelText("reglink_sa"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("reglink_sa_structure"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_name_ops"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_address_1"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_fac"), fontSize: 11, bold: true },
                            { text: '.', fontSize: 11 }
                        ],
                        alignment: 'justify',
                        margin: [0, 0, 0, 10]
                    },

                    PlainText.default('Настоящий акт идентификации продукции удостоверяет, что должным образом', { 
                        alignment: 'justify',
                        fontSize: 11,
                        margin: [0, 0, 0, 3]
                    }),

                    {
                        text: [
                            { text: 'идентифицированная продукция ', fontSize: 11 },
                            { text: getModelText("textarea_pro_name"), fontSize: 11, bold: true }
                        ],
                        alignment: 'justify',
                        margin: [0, 0, 0, 10]
                    },

                    {
                        text: [
                            { text: 'код ТН ВЭД ЕАЭС ', fontSize: 11 },
                            { text: getModelText("reglink_code"), fontSize: 11, bold: true }
                        ],
                        alignment: 'justify',
                        margin: [0, 0, 0, 10]
                    },

                    {
                        text: [
                            { text: 'изготовленная ', fontSize: 11 },
                            { text: getModelText("check_pbhcdb"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_qn1q28"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_fbt2xo"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_jcos15"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_hwb1n7"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("radio_adress_copy1"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_l7vxty"), fontSize: 11, bold: true },
                            { text: '.', fontSize: 11 }
                        ],
                        alignment: 'justify',
                        margin: [0, 0, 0, 10]
                    },

                    {
                        text: [
                            { text: 'подлежит/не подлежит обязательному подтверждению соответствия требованиям технического (-их) регламента (-ов) ', fontSize: 11 },
                            { text: getModelText("check_lh2gk7"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_xuaspn"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_g17plb"), fontSize: 11, bold: true }
                        ],
                        alignment: 'justify',
                        margin: [0, 0, 0, 10]
                    },

                    {
                        text: [
                            { text: 'Заявитель ', fontSize: 11 },
                            { text: getModelText("textbox_bin"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_name"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_address"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_faddres"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_iin"), fontSize: 11, bold: true },
                            { text: ', ', fontSize: 11 },
                            { text: getModelText("textbox_add"), fontSize: 11, bold: true },
                            { text: ',', fontSize: 11 }
                        ],
                        alignment: 'justify',
                        margin: [0, 0, 0, 10]
                    },

                    {
                        text: [
                            { text: 'Данный акт идентификации продукции оформлен на основании: ', fontSize: 11 },
                            { text: getModelText("textarea_nhm46l"), fontSize: 11, bold: true }
                        ],
                        alignment: 'justify',
                        margin: [0, 0, 0, 20]
                    },

                    // Блок подписей
                    {
                        columns: [
                            {
                                stack: [
                                    PlainText.default('Руководитель органа по подтверждению', { 
                                        fontSize: 11,
                                        margin: [0, 0, 0, 0]
                                    }),
                                    PlainText.default('соответствия или уполномоченное им лицо', { 
                                        fontSize: 11,
                                        margin: [0, 0, 0, 5]
                                    })
                                ],
                                width: '50%'
                            },
                            {
                                stack: [
                                    PlainText.default(getModelText("entity_OPS"), { 
                                        fontSize: 11,
                                        bold: true,
                                        margin: [0, 10, 0, 0]
                                    })
                                ],
                                width: '50%'
                            }
                        ],
                        margin: [0, 0, 0, 10]
                    },

                    {
                        columns: [
                            {
                                text: 'Эксперт-аудитор',
                                fontSize: 11,
                                width: '50%'
                            },
                            {
                                text: getModelText("entity_expert"),
                                fontSize: 11,
                                bold: true,
                                width: '50%'
                            }
                        ],
                        margin: [0, 0, 0, 20]
                    },

                    // Нижний текст
                    PlainText.default('Данный документ согласно пункту 1 статьи 7 Закона Республики Казахстан «Об электронном документе и электронной цифровой подписи», равнозначен документу на бумажном носителе.', { 
                        alignment: 'justify',
                        fontSize: 10,
                        italics: true,
                        margin: [0, 0, 0, 10]
                    }),

                    PlainText.default('Проверить статус действия и подлинность электронного документа Вы можете посредством сети интернет в реестре данных государственной системы технического регулирования.', { 
                        alignment: 'justify',
                        fontSize: 10,
                        italics: true,
                        margin: [0, 0, 0, 0]
                    })
                ],
                
                defaultStyle: {
                    font: "Times",
                    fontSize: 11
                },
                
                pageMargins: [70, 40, 40, 40]
                
            };

            model.trigger("dataLoaded");
        });
        model.EVENTclickedButton = true;
    }

} catch (e) {
    console.log(e);
}