import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Eye, Languages, FileCheck } from 'lucide-react';

// Текст договора на русском (полная версия из документа)
const AGREEMENT_TEXT_RU = `
<div style="font-family: 'Times New Roman', serif; padding: 30px; line-height: 1.8; max-width: 900px; margin: 0 auto;">
  <h1 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 10px;">ДОГОВОР СОГЛАШЕНИЯ ПОРТАЛА «Е-КТРМ» №{{AGREEMENT_NUMBER}}</h1>
  <p style="text-align: center; margin-bottom: 30px; color: #666;">(https://techreg.gov.kz/)</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">1. Общие положения</h2>
  
  <p><strong>1.1.</strong> Настоящий Договор соглашения (далее — Соглашение) регламентирует взаимоотношения между Владельцем и Пользователем веб-портала «Е-КТРМ».</p>
  
  <p><strong>1.2.</strong> В настоящем Соглашении используются следующие понятия:</p>
  <ol style="margin-left: 30px;">
    <li><strong>веб-портал «Е-КТРМ»</strong> (далее — Портал) — информационная система, обеспечивающая доступ к сервисам и данным в области технического регулирования, стандартизации, метрологии и аккредитации, включая функции по подаче заявок, регистрации, ведению и обмену сведениями в электронном формате;</li>
    <li><strong>компоненты Портала</strong> — функциональные части Портала, специализированные на предоставлении отдельных электронных услуг, информации и (или) сервисов;</li>
    <li><strong>электронная услуга (Услуга)</strong> — предоставление физическим и юридическим лицам информационных, интерактивных и транзакционных услуг с применением информационных технологий;</li>
    <li><strong>Владелец Портала</strong> — Министерство торговли и интеграции Республики Казахстан (МТИ РК);</li>
    <li><strong>Пользователь Портала</strong> — любое физическое или юридическое лицо, зарегистрированное на Портале, принявшее условия настоящего Соглашения и использующее его функционал для получения электронных услуг и информации;</li>
    <li><strong>субъект оказания услуг</strong> — физическое или юридическое лицо, предоставляющее электронные услуги посредством Портала;</li>
    <li><strong>электронная цифровая подпись (ЭЦП)</strong> — набор электронных цифровых символов, подтверждающий достоверность электронного документа, его принадлежность и неизменность содержания.</li>
  </ol>
  
  <p><strong>1.3.</strong> Все иные термины и определения, используемые в настоящем Соглашении, истолковываются в соответствии с законодательством Республики Казахстан.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">2. Предмет Соглашения</h2>
  
  <p><strong>2.1.</strong> Настоящий Договор соглашения является публичной офертой. Получая доступ к материалам Портала, Пользователь считается присоединившимся и принявшим все условия настоящего Соглашения.</p>
  
  <p><strong>2.2.</strong> Владелец вправе изменять условия настоящего Соглашения. Изменения вступают в силу через 3 (три) дня с момента размещения новой версии на Портале.</p>
  
  <p><strong>2.3.</strong> При несогласии с изменениями Пользователь обязан прекратить использование Портала.</p>
  
  <p><strong>2.4.</strong> Использование компонентов Портала осуществляется в соответствии с инструкциями, размещёнными на Портале.</p>
  
  <p><strong>2.5.</strong> За достоверность сведений, полученных через Портал, несут ответственность соответствующие услугодатели или субъекты оказания услуг.</p>
  
  <p><strong>2.6.</strong> Электронный адрес, указанный при регистрации, используется для отправки уведомлений о технических событиях, смене пароля и другой служебной информации.</p>
  
  <p><strong>2.7.</strong> Подписывая настоящий Договор соглашения, Пользователь даёт согласие на сбор, обработку, хранение и использование своих персональных данных для оказания услуг посредством Портала.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">3. Права и обязанности сторон</h2>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">3.1. Владелец Портала вправе:</h3>
  <p><strong>3.1.1.</strong> Проверять достоверность данных Пользователя при необходимости.</p>
  <p><strong>3.1.2.</strong> В случае нарушения Соглашения ограничивать или блокировать доступ Пользователя.</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">3.2. Пользователь вправе:</h3>
  <p><strong>3.2.1.</strong> Получать консультационную и техническую поддержку по вопросам использования Портала через Единый контакт-центр (1414).</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">3.3. Владелец Портала обязан:</h3>
  <p><strong>3.3.1.</strong> Обеспечивать конфиденциальность персональных данных Пользователя.</p>
  <p><strong>3.3.2.</strong> Поддерживать работоспособность Портала и его компонентов.</p>
  <p><strong>3.3.3.</strong> Руководствоваться действующим законодательством Республики Казахстан, включая Кодекс «О техническом регулировании и метрологии».</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">3.4. Пользователь обязан:</h3>
  <p><strong>3.4.1.</strong> Для работы с Порталом:</p>
  <ul style="margin-left: 30px;">
    <li>иметь ИИН (для физических лиц) или БИН (для юридических лиц);</li>
    <li>иметь действующую ЭЦП, выданную Национальным удостоверяющим центром РК;</li>
    <li>пройти регистрацию на Портале.</li>
  </ul>
  <p><strong>3.4.2.</strong> Предоставлять достоверные данные при регистрации.</p>
  <p><strong>3.4.3.</strong> Не предпринимать действий, нарушающих законодательство Республики Казахстан.</p>
  <p><strong>3.4.4.</strong> Не размещать информацию, противоречащую нормам морали и законодательства.</p>
  <p><strong>3.4.5.</strong> Не выдавать себя за других лиц и использовать только собственную ЭЦП.</p>
  <p><strong>3.4.6.</strong> Не использовать Портал в целях, противоречащих закону (в том числе экстремистских, террористических и иных запрещённых).</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">4. Ответственность сторон</h2>
  
  <p><strong>4.1.</strong> Стороны несут ответственность за нарушение условий настоящего Договора соглашения в соответствии с законодательством Республики Казахстан.</p>
  <p><strong>4.2.</strong> Владелец не несёт ответственности за временные технические сбои, вызванные причинами, не зависящими от него.</p>
  <p><strong>4.3.</strong> Владелец не отвечает за сбои связи или неисправности оборудования Пользователя.</p>
  <p><strong>4.4.</strong> Владелец не несёт ответственности за действия третьих лиц, услугодателей и других пользователей Портала.</p>
  <p><strong>4.5.</strong> Владелец не несёт ответственности за прямые или косвенные убытки, включая упущенную выгоду, вызванные:</p>
  <ul style="margin-left: 30px;">
    <li>использованием или невозможностью использования Портала;</li>
    <li>изменением условий настоящего Договора соглашения.</li>
  </ul>
  <p><strong>4.6.</strong> Пользователь несёт ответственность за достоверность предоставляемых данных и их своевременное обновление.</p>
  <p><strong>4.7.</strong> Пользователь принимает на себя риски, связанные с передачей данных третьим лицам.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">5. Прочие положения</h2>
  
  <p><strong>5.1.</strong> Все споры, возникающие из настоящего Договора соглашения, подлежат разрешению в соответствии с законодательством Республики Казахстан.</p>
  <p><strong>5.2.</strong> Бездействие Владельца при нарушении Соглашения другими пользователями не лишает его права предпринять соответствующие действия в будущем.</p>
  <p><strong>5.3.</strong> Пользователь подтверждает, что ознакомлен и согласен со всеми пунктами настоящего Договора соглашения.</p>
  
  <div style="margin-top: 50px; padding: 20px; background: #f9f9f9; border: 1px solid #ddd;">
    <p><strong>Ф.И.О. пользователя:</strong> {{USER_FIO}}</p>
    <p><strong>ИИН пользователя:</strong> {{USER_IIN}}</p>
    <p><strong>Дата подписания:</strong> {{SIGNATURE_DATE}}</p>
    <div style="margin-top: 20px;">
      <p><strong>Подпись Пользователя (ЭЦП):</strong></p>
      <img src="{{QR_CODE}}" alt="QR Code" style="width: 150px; height: 150px; margin-top: 10px;" />
    </div>
  </div>
</div>
`;

// Текст договора на казахском (полная версия)
const AGREEMENT_TEXT_KZ = `
<div style="font-family: 'Times New Roman', serif; padding: 30px; line-height: 1.8; max-width: 900px; margin: 0 auto;">
  <h1 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 10px;">«Е-КТРМ» ПОРТАЛЫНЫҢ КЕЛІСІМ ШАРТЫ №{{AGREEMENT_NUMBER}}</h1>
  <p style="text-align: center; margin-bottom: 30px; color: #666;">(https://techreg.gov.kz/)</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">1. Жалпы ережелер</h2>
  
  <p><strong>1.1.</strong> Осы Келісім шарты (бұдан әрі -- Келісім) «Е-КТРМ» веб-порталының Иесі мен Пайдаланушысының арасындағы өзара қатынастарды реттейді.</p>
  
  <p><strong>1.2.</strong> Осы Келісімде төмендегі ұғымдар пайдаланылады:</p>
  <ol style="margin-left: 30px;">
    <li><strong>«Е-КТРМ» веб-порталы</strong> (бұдан әрі -- Портал) -- техникалық реттеу, стандарттау, метрология және аккредитация саласындағы сервистер мен деректерге қол жеткізуді қамтамасыз ететін ақпараттық жүйе. Портал өтінімдерді беру, тіркеу, жүргізу және мәліметтер алмасу функцияларын электрондық форматта жүзеге асырады;</li>
    <li><strong>Порталдың компоненттері</strong> -- Порталдың жекелеген электрондық қызметтерді, ақпаратты және (немесе) сервистерді ұсынуға арналған функционалдық бөліктері;</li>
    <li><strong>электрондық қызмет (Қызмет)</strong> -- ақпараттық технологияларды қолдану арқылы жеке және заңды тұлғаларға ақпараттық, интерактивті және транзакциялық қызметтер көрсету;</li>
    <li><strong>Портал Иесі</strong> -- Қазақстан Республикасының Сауда және интеграция министрлігі (ҚР СИМ);</li>
    <li><strong>Портал Пайдаланушысы</strong> -- Порталда тіркеліп, осы Келісім шарттың талаптарын қабылдаған және Порталдың функционалын электрондық қызметтер мен ақпарат алу үшін пайдаланатын жеке немесе заңды тұлға;</li>
    <li><strong>қызмет көрсетуші субъект</strong> -- Портал арқылы электрондық қызметтер көрсететін жеке немесе заңды тұлға;</li>
    <li><strong>электрондық цифрлық қолтаңба (ЭЦҚ)</strong> -- электрондық құжаттың шынайылығын, оның тиесілігін және мазмұнының өзгермегенін растайтын электрондық цифрлық белгілер жиынтығы.</li>
  </ol>
  
  <p><strong>1.3.</strong> Осы Келісімде пайдаланылған өзге терминдер мен анықтамалар Қазақстан Республикасының заңнамасына сәйкес түсіндіріледі.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">2. Келісім пәні</h2>
  
  <p><strong>2.1.</strong> Осы Келісім -- жария оферта болып табылады. Портал материалдарына қол жеткізу арқылы Пайдаланушы Келісім талаптарын толық қабылдаған болып есептеледі.</p>
  
  <p><strong>2.2.</strong> Портал Иесі Келісім талаптарын өзгертуге құқылы. Өзгерістер Порталда жаңа нұсқасы жарияланған соң 3 (үш)күннен кейін күшіне енеді.</p>
  
  <p><strong>2.3.</strong> Өзгерістермен келіспеген жағдайда Пайдаланушы Порталды пайдалануды тоқтатуға міндетті.</p>
  
  <p><strong>2.4.</strong> Портал компоненттерін пайдалану Порталда орналастырылған нұсқаулықтарға сәйкес жүзеге асырылады.</p>
  
  <p><strong>2.5.</strong> Портал арқылы алынатын мәліметтердің дұрыстығына тиісті қызмет көрсетушілер немесе қызмет көрсетуші субъектілер жауап береді.</p>
  
  <p><strong>2.6.</strong> Тіркеу кезінде көрсетілген электрондық пошта техникалық хабарламаларды, парольді өзгерту туралы және өзге де қызметтік ақпаратты жіберу үшін пайдаланылады.</p>
  
  <p><strong>2.7.</strong> Осы Келісімге қол қою арқылы Пайдаланушы өз персоналдық деректерін жинауға, өңдеуге, сақтауға және Портал арқылы қызмет көрсету мақсатында пайдалануға келісім береді.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">3. Тараптардың құқықтары мен міндеттері</h2>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">3.1. Портал Иесінің құқықтары:</h3>
  <p><strong>3.1.1.</strong> Қажет болған жағдайда Пайдаланушының деректерінің дұрыстығын тексеру.</p>
  <p><strong>3.1.2.</strong> Келісім талаптары бұзылған кезде Пайдаланушының қол жеткізуін шектеу немесе бұғаттау.</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">3.2. Пайдаланушының құқықтары:</h3>
  <p><strong>3.2.1.</strong> 1414 Бірыңғай байланыс орталығы арқылы Порталды пайдалану мәселелері бойынша консультациялық және техникалық қолдау алу.</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">3.3. Портал Иесінің міндеттері:</h3>
  <p><strong>3.3.1.</strong> Пайдаланушының персоналдық деректерінің құпиялығын қамтамасыз ету.</p>
  <p><strong>3.3.2.</strong> Портал мен оның компоненттерінің жұмысқа қабілеттілігін қолдау.</p>
  <p><strong>3.3.3.</strong> Қазақстан Республикасының қолданыстағы заңнамасын, оның ішінде «Техникалық реттеу және метрология туралы» Кодексін басшылыққа алу.</p>
  
  <h3 style="font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">3.4. Пайдаланушының міндеттері:</h3>
  <p><strong>3.4.1.</strong> Порталды пайдалану үшін:</p>
  <ul style="margin-left: 30px;">
    <li>ЖСН (жеке тұлғалар үшін) немесе БСН (заңды тұлғалар үшін) болуы;</li>
    <li>ҚР Ұлттық куәландырушы орталығының жарамды ЭЦҚ-сы болуы;</li>
    <li>Порталда тіркелуден өту.</li>
  </ul>
  <p><strong>3.4.2.</strong> Тіркеу кезінде дұрыс мәліметтер ұсыну.</p>
  <p><strong>3.4.3.</strong> Қазақстан Республикасының заңнамасын бұзатын әрекеттер жасамау.</p>
  <p><strong>3.4.4.</strong> Мораль және заң талаптарына қайшы ақпарат жарияламау.</p>
  <p><strong>3.4.5.</strong> Өзгелердің атынан әрекет етпеу және тек өзінің ЭЦҚ-сын пайдалану.</p>
  <p><strong>3.4.6.</strong> Порталды заңға қайшы мақсаттарда (оның ішінде экстремистік, террористік және өзге тыйым салынған) пайдаланбау.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">4. Тараптардың жауапкершілігі</h2>
  
  <p><strong>4.1.</strong> Тараптар осы Келісім талаптарын бұзғаны үшін Қазақстан Республикасының заңнамасына сәйкес жауап береді.</p>
  <p><strong>4.2.</strong> Ие өзінің бақылауында емес себептерден туындаған уақытша техникалық ақаулар үшін жауапты емес.</p>
  <p><strong>4.3.</strong> Ие Пайдаланушының байланыс арналарының ақауларына немесе жабдығының істен шығуына жауап бермейді.</p>
  <p><strong>4.4.</strong> Ие үшінші тұлғалардың, қызмет көрсетушілердің немесе өзге пайдаланушылардың іс-әрекеттері үшін жауапты емес.</p>
  <p><strong>4.5.</strong> Ие Порталды пайдалану немесе пайдалана алмау салдарынан туындаған тікелей немесе жанама залалдарға, соның ішінде жіберілген пайданы жоғалтуға жауап бермейді.</p>
  <p><strong>4.6.</strong> Пайдаланушы ұсынған деректердің дұрыстығы мен өзектілігі үшін жауап береді.</p>
  <p><strong>4.7.</strong> Пайдаланушы деректерін үшінші тұлғаларға берумен байланысты тәуекелдерді өз мойнына алады.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">5. Өзге ережелер</h2>
  
  <p><strong>5.1.</strong> Осы Келісімнен туындайтын барлық даулар Қазақстан Республикасының заңнамасына сәйкес шешіледі.</p>
  <p><strong>5.2.</strong> Келісімді бұзған пайдаланушыларға қатысты Иенің әрекетсіздігі оның болашақта тиісті шаралар қолдану құқығынан айырмайды.</p>
  <p><strong>5.3.</strong> Пайдаланушы осы Келісімнің барлық тармақтарымен танысқанын және келісетінін растайды.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">6. Акцепт тәртібі және Келісімге қол жеткізу</h2>
  
  <p><strong>6.1.</strong> «Е-КТРМ» порталына (https://techreg.gov.kz/) тіркелу кезінде Пайдаланушы ЭЦҚ арқылы қол қою алдында осы Келісімнің мәтінімен танысуға міндетті.</p>
  
  <p><strong>6.2.</strong> ЭЦҚ арқылы қол қою Пайдаланушының барлық талаптармен келісетінін білдіреді және Қазақстан Республикасының заңнамасына сәйкес қағаз түріндегі құжатқа қол қоюмен теңестіріледі.</p>
  
  <p><strong>6.3.</strong> Қол қойылғаннан кейін Келісім Порталдың келісімдер реестрінде сақталады. Реестрде Пайдаланушы туралы мәліметтер, қол қою күні мен уақыты, сондай-ақ ЭЦҚ идентификаторы тіркеледі.</p>
  
  <p><strong>6.4.</strong> Пайдаланушы кез келген уақытта Келісімнің қолданыстағы нұсқасымен таныса алады және қол қойылған нұсқасын реестр арқылы жүктей алады.</p>
  
  <p><strong>6.5.</strong> «Е-КТРМ» порталының Иесі -- Қазақстан Республикасының Сауда және интеграция министрлігі.</p>
  
  <h2 style="font-size: 16px; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">7. Қорытынды ережелер</h2>
  
  <p><strong>7.1.</strong> Осы Келісім Пайдаланушы ЭЦҚ арқылы қол қойған сәттен бастап күшіне енеді.</p>
  
  <p><strong>7.2.</strong> Қол қойылған Келісім қағаз түріндегі құжатпен тең заңды күші бар және Пайдаланушының барлық талаптарды қабылдағанын растайды.</p>
  
  <p><strong>7.3.</strong> Қол қою туралы деректер, соның ішінде ЭЦҚ идентификаторы, күні мен уақыты Порталдың келісімдер реестрінде сақталады.</p>
  
  <p><strong>7.4.</strong> Пайдаланушы кез келген уақытта Порталдың келісімдер реестрінен қол қойылған Келісімді қарап, жүктей алады.</p>
  
  <div style="margin-top: 50px; padding: 20px; background: #f9f9f9; border: 1px solid #ddd;">
    <p><strong>Пайдаланушының Т.А.Ә.:</strong> {{USER_FIO}}</p>
    <p><strong>Пайдаланушының ЖСН:</strong> {{USER_IIN}}</p>
    <p><strong>Қол қою күні:</strong> {{SIGNATURE_DATE}}</p>
    <div style="margin-top: 20px;">
      <p><strong>Пайдаланушының қолтаңбасы (ЭЦҚ):</strong></p>
      <img src="{{QR_CODE}}" alt="QR Code" style="width: 150px; height: 150px; margin-top: 10px;" />
    </div>
  </div>
</div>
`;

// Компонент для генерации QR-кода (упрощенная версия)
const generateQRCode = (data) => {
  // В реальном приложении используй библиотеку qrcode.react или подобную
  // Для демо используем placeholder
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" fill="white"/>
      <text x="75" y="75" text-anchor="middle" font-size="12" fill="black">QR Code</text>
      <text x="75" y="90" text-anchor="middle" font-size="10" fill="gray">${data.substring(0, 10)}...</text>
    </svg>
  `)}`;
};

const AgreementRegistrationSystem = () => {
  const [step, setStep] = useState(1); // 1: просмотр, 2: подписание, 3: завершено
  const [language, setLanguage] = useState('ru');
  const [agreementText, setAgreementText] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [agreementData, setAgreementData] = useState(null);
  const [error, setError] = useState('');

  // Загрузка шаблона договора при изменении языка
  useEffect(() => {
    loadAgreementTemplate();
  }, [language]);

  const loadAgreementTemplate = async () => {
    setLoading(true);
    try {
      const template = language === 'kz' ? AGREEMENT_TEXT_KZ : AGREEMENT_TEXT_RU;
      setAgreementText(template);
    } catch (err) {
      setError('Ошибка загрузки договора');
    } finally {
      setLoading(false);
    }
  };

  // Симуляция подписания ЭЦП
  const handleECPSignature = async () => {
    if (!agreedToTerms) {
      setError('Необходимо согласиться с условиями договора');
      return;
    }

    setLoading(true);
    setError('');
    setStep(2);

    try {
      // Симуляция подписания через ЭЦП
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ecpData = {
        fio: 'Иванов Иван Иванович',
        iin: '123456789012',
        signatureData: 'BASE64_SIGNATURE_DATA_' + Date.now()
      };
      
      setUserData(ecpData);

      // Регистрация договора
      const agreementNumber = `ЕКТРМ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
      
      const qrCode = generateQRCode(ecpData.signatureData);
      
      const filledTemplate = agreementText
        .replace('{{AGREEMENT_NUMBER}}', agreementNumber)
        .replace('{{USER_FIO}}', ecpData.fio)
        .replace('{{USER_IIN}}', ecpData.iin)
        .replace('{{SIGNATURE_DATE}}', new Date().toLocaleDateString('ru-RU'))
        .replace('{{QR_CODE}}', qrCode);

      setAgreementData({
        number: agreementNumber,
        date: new Date().toLocaleDateString('ru-RU'),
        template: filledTemplate,
        language: language
      });

      setStep(3);
    } catch (err) {
      setError('Ошибка при подписании договора');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Скачивание PDF
  const handleDownloadPDF = () => {
    // Создаем HTML для печати
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Договор ${agreementData.number}</title>
          <style>
            body { font-family: 'Times New Roman', serif; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${agreementData.template}
          <div style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Печать / Сохранить как PDF</button>
            <button onclick="window.close()">Закрыть</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Просмотр договора в модальном окне
  const handleViewAgreement = () => {
    const viewWindow = window.open('', '', 'width=900,height=700');
    viewWindow.document.write(`
      <html>
        <head>
          <title>Просмотр договора ${agreementData.number}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 20px; }
          </style>
        </head>
        <body>
          ${agreementData.template}
          <div style="margin-top: 30px; text-align: center;">
            <button onclick="window.close()">Закрыть</button>
          </div>
        </body>
      </html>
    `);
    viewWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Регистрация договора соглашения
                </h1>
                <p className="text-gray-600">Портал «Е-КТРМ»</p>
              </div>
            </div>
            
            {/* Переключатель языка */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLanguage('ru')}
                className={`px-4 py-2 rounded-md transition-all ${
                  language === 'ru'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Русский
              </button>
              <button
                onClick={() => setLanguage('kz')}
                className={`px-4 py-2 rounded-md transition-all ${
                  language === 'kz'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Қазақша
              </button>
            </div>
          </div>

          {/* Индикатор этапов */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium">Ознакомление</span>
            </div>
            
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium">Подписание</span>
            </div>
            
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="font-medium">Завершено</span>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Текст договора */}
            <div className="p-6 max-h-[600px] overflow-y-auto border-b">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: agreementText }} />
              )}
            </div>

            {/* Панель действий */}
            <div className="p-6 bg-gray-50">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              <label className="flex items-start space-x-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {language === 'ru' 
                    ? 'Я ознакомлен(а) и согласен(на) с условиями Договора соглашения портала «Е-КТРМ»'
                    : '«Е-КТРМ» порталының Келісім шарты шарттарымен танысып, келісемін'}
                </span>
              </label>

              <button
                onClick={handleECPSignature}
                disabled={!agreedToTerms || loading}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                  agreedToTerms && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <FileCheck className="w-5 h-5" />
                <span>
                  {language === 'ru' 
                    ? 'Подписать через ЭЦП' 
                    : 'ЭЦҚ арқылы қол қою'}
                </span>
              </button>

              <p className="mt-4 text-sm text-gray-500 text-center">
                {language === 'ru'
                  ? 'После подписания договор будет зарегистрирован в системе'
                  : 'Қол қойғаннан кейін шарт жүйеде тіркеледі'}
              </p>
            </div>
          </div>
        )}

        {/* Этап 2: Процесс подписания */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600"></div>
                  <FileCheck className="w-12 h-12 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {language === 'ru' 
                  ? 'Подписание договора...' 
                  : 'Шартқа қол қою...'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'ru'
                  ? 'Пожалуйста, подтвердите подписание с помощью вашей ЭЦП'
                  : 'ЭЦҚ арқылы қол қоюды растаңыз'}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  {language === 'ru'
                    ? 'Извлекаем данные из сертификата ЭЦП и формируем договор...'
                    : 'ЭЦҚ сертификатынан деректерді алып, шартты қалыптастырамыз...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Этап 3: Договор подписан */}
        {step === 3 && agreementData && (
          <div className="space-y-6">
            {/* Успешное завершение */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="mb-4 flex justify-center">
                  <div className="bg-green-100 rounded-full p-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {language === 'ru' 
                    ? 'Договор успешно подписан!' 
                    : 'Шарт сәтті қол қойылды!'}
                </h2>
                <p className="text-gray-600">
                  {language === 'ru'
                    ? 'Ваш договор зарегистрирован в системе'
                    : 'Сіздің шартыңыз жүйеде тіркелді'}
                </p>
              </div>

              {/* Информация о договоре */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {language === 'ru' ? 'Номер договора' : 'Шарт номері'}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {agreementData.number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {language === 'ru' ? 'Дата подписания' : 'Қол қою күні'}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {agreementData.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {language === 'ru' ? 'ФИО' : 'Т.А.Ә.'}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {userData.fio}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {language === 'ru' ? 'ИИН' : 'ЖСН'}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {userData.iin}
                    </p>
                  </div>
                </div>
              </div>

              {/* Действия с договором */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleViewAgreement}
                  className="py-3 px-6 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>
                    {language === 'ru' ? 'Просмотреть' : 'Қарау'}
                  </span>
                </button>
                
                <button
                  onClick={handleDownloadPDF}
                  className="py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  <span>
                    {language === 'ru' ? 'Скачать PDF' : 'PDF жүктеу'}
                  </span>
                </button>
              </div>
            </div>

            {/* Информационное сообщение */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">
                    {language === 'ru' 
                      ? 'Важная информация:' 
                      : 'Маңызды ақпарат:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      {language === 'ru'
                        ? 'Договор доступен для просмотра и скачивания в личном кабинете'
                        : 'Шартты жеке кабинетте қарауға және жүктеп алуға болады'}
                    </li>
                    <li>
                      {language === 'ru'
                        ? 'Вы можете в любое время обратиться в службу поддержки по номеру 1414'
                        : 'Сіз кез келген уақытта 1414 нөміріне қолдау қызметіне хабарласа аласыз'}
                    </li>
                    <li>
                      {language === 'ru'
                        ? 'Подписанный договор имеет юридическую силу'
                        : 'Қол қойылған шарт заңды күшке ие'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Кнопка продолжения */}
            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="py-3 px-8 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
              >
                {language === 'ru' 
                  ? 'Перейти на главную' 
                  : 'Басты бетке өту'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgreementRegistrationSystem;