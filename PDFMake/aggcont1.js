// Разработать автоматическое формирование печатного представления Договора соглашения сразу после регистрации пользователя.
// Отображение Договора соглашения
// При инициации регистрации система должна отображать пользователю текст Договора соглашения в неизменяемом виде.
// В текущей реализации уже существует кнопка «Пользовательское соглашение» — необходимо заменить выводимый текст на новый текст Договора соглашения.
// Ознакомление пользователя
// Пользователь просматривает текст договора. На этом шаге никаких дополнительных действий не требуется — далее пользователь переходит к подписанию.
// Подписание и регистрация пользователя через ЭЦП
// В системе уже реализован процесс регистрации через ЭЦП.
// В момент подписания ЭЦП система должна автоматически извлечь:
// ФИО пользователя,
// ИИН пользователя,
// данные подписи для генерации QR-кода.
// Эти данные должны быть подставлены в форму Договора соглашения.
// Формирование и регистрация Договора соглашения
// После успешного подписания ЭЦП система должна выполнить:
// присвоение договору уникального номера;
// фиксирование даты подписания;
// формирование PDF-версии договора с данными пользователя, текстом договора, ЭЦП QR-кодом;
// сохранение в реестре договоров соглашений.
// Предоставление доступа пользователю
// После регистрации договора система должна предоставить пользователю доступ:
// к просмотру зарегистрированного договора через реестр;
// к скачиванию PDF-версии;
// Казахскую версию договора соглашения также необходимо разработать.



import React, {useState, useEffect} from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Eye, Languages, FileCheck} from 'lucide-react';

// Текст договора на русском языке

const agreementTextRu = `
    Здесь будет текст договора на русском языке.
`;

// Текст договора на казахском языке
const agreementTextKz = `
    бла бла бла текст договора на казахском языке.
`;

const generateQRCode = (data) => {
  // Здесь должна быть реализация генерации QR-кода на основе переданных данных. попробовать использовать стороннюю библиотеку
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="150" fill="white"/>
      <text x="75" y="75" text-anchor="middle" font-size="12" fill="black">QR Code</text>
      <text x="75" y="90" text-anchor="middle" font-size="10" fill="gray">${data.substring(0, 10)}...</text>
    </svg>
  `)}`;
};

const AgreementRegistrationSystem = () => {
    const [stem, setStep] = useState(1);
    const [language, setLanguage] = useState('ru'); // 'ru' или 'kz'
    const [agreementText, setAgreementText] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [agreementData, setAgreementData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        // Загрузка текста договора в зависимости от выбранного языка
        try {
            const template = language === 'kz' ? agremeentTextKz : agreementTextRu;
            setAgreementText(template);
        } catch (err) {
            setError('Ошибка загрузки договора.');
        } finally {
            setLoading(false);
        }
        
    })
}

// Подписание договора через ЭЦП
const signAgreement = async () => {
    if (!agreedToTerms) {
        setError('Пожалуйста, согласитесь с условиями договора перед подписанием.');
        return;
    }

    setLoading(true);
    setError('');
    setStep(2);

    try {
        // Инициализация процесса ЭЦП
        await new Promise(resolve => setTimeout(resolve, 2000)); // эмуляция задержки
        // Получение данных пользователя и подписи
        const ecpData = {
            fio: '',
            iin: '',
            signatureData: 'данные подписи для QR-кода' + Date.now() 
        };

        setUserData(ecpData);

        // Формирование и регистрация договора

      const agreementNumber = `ЕКТРМ-${new Date().getFullYear()}
      ${String(new Date().getMonth() + 1).padStart(2, '0')}
      ${String(new Date().getDate()).padStart(2, '0')}-
      ${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
      
        const qrCode = generateQRCode(ecpData.signatureData);

        const filledTemplate = agreementText
        .replace('{{agreement_number}}', agreementNumber)
        .replace('{{user_fio}}', ecpData.fio)
        .replace('{{user_iin}}', ecpData.iin)
        .replace('{{signature_qr_code}}', new Date().toLocaleDateString('ru-RU'))
        .replace('{{QR_code}}', qrCode);

        setAgreementData({
            number: agreementNumber,
            date: new Date().toLocaleDateString('ru-RU'),
            template: filledTemplate,
            language: language

        });

        setStep(3);
    } catch (err) {
        setError('Ошибка при подписании договора: ' );
        setStep(1);
    } finally {
        setLoading(false);
    }
};

// Скачивание PDF версии договора
const downloadPDF = () => {
// HTML ДЛЯ ПЕЧАТИ
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
                <div  style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print();">Сохранить как PDF</button>
                    <button onclick="window.close();">Закрыть</button>
                    </div>
                    </body>
        </html>
    `);

    printWindow.document.close();
};

// Просмотр зарегистрированного договора
const viewAgreement = () => {
    const viewWindow = window.open('', '', 'width=900,height=700');
    viewDocument.write(`
        <html>
        <head>
        <titlle>Просмотр договора ${agreementData.number}</title>
        <style>
        body { font-family: 'Times New Roman', serif; padding: 20px; }
        </style>
        </head>
        <body>
        ${agreementData.template}
        <div style="margin-top: 30px; text-align: center;">
        <button onclick="window.close();">Закрыть</button>
        </div>
        </body>
        </html>
    `);
    viewWindow.document.close();
};

return(
    <div className ="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6"> 
     <div className="max-w-6xl mx-auto">
        {/*Заголовок*/}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600"/>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Регистрация договора соглашения</h1>
                        <p className="text-gray-600">Портал «Е-КТРМ»</p>
                    </div>
                </div>

                {/* Переключение языка */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                    onClick={() => setLanguage('ru')}
                    className={`px-4 py-2 rounded-md transition-all ${
                        language === 'ru'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-graay-600 hover:text-gray-800'

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
                    Казахский
                  </button>
                </div>
            </div>

            {/*Индикатор этапов*/}
            <div className="mt-6 flex items-center justify-center space-x-4">
                <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={` w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= 1 ? 'bg-blue-600 text-whte' : 'bg-gray-200'
                    }`}>
                        1
                    </div>
                    <span className="font-medium">Ознакомление</span>
                </div>

                <div className={`w-16 h-1 ${step >= 2 ? 'text-blue-600' : 'text-gray-200'}`}>
                    <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={` w-8 h-8 rounded-full flex items-center justify-center ${
                            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}>
                            2   
                        </div>
                        <span className="font-medium">Завершено</span>
            </div>
          </div>
        </div>

        {/* Основной контент по этапам */}
        {step === 1 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Текст договора */}
                <div className="p-6 max-h-[600px] overflow-y-auto border-b">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )  : (
                        <div dangerouslySetInnerHTML={{ __html: agreementText }} />
                    )}
                </div>

                {/*Панель действий*/}
                <div className="p-6 bg-gray-50">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-200 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5"/>
                        <span calssName="text-red-800">{error}</span>
                    </div>
                )}

                <lavel className="flex items-start space-x-3 mb-6 cursor-pointer">
                    <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                        {language === "ru"
                        ? "Я ознакомлен(а) и согласен(на) с условиями договора соглашения портала «Е-КТРМ»."
                        : "Мен «Е-КТРМ» порталының келісім-шарт шарттарымен таныстым және келісемін."}
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
                        <FileCheck className="w-5 h-5"/>
                        <span>
                            {language === 'ru' 
                            ? 'Подписать через ЭЦП'
                            : 'ЭЦҚ арқылы келісім-шартқа қол қою'}
                        </span>
                    </button>

                    <p className="mt-4 text-sm text-gray-500 text-center">
                        {language === 'ru'
                        ? "После подписания договор будет зарегистрирован и сохранен в вашем личном кабинете."
                        : "Қол қойғаннан кейін шарт жүйеде тіркеледі және жеке кабинетіңізде сақталады."}
                    </p>
                </div>
            </div>
        )}

        {/* Этап 2: Подписание через ЭЦП */}
        {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-12  ">
                <div className="texxt-center">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-24 w-24 border-b-4  border-blue-600"></div>
                            <FileCheck className="w-12 h-12 text-blue-600 absolute top-1/2 left-1/2 transform - translate-x-1/2 -translate-y-1/2"/>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        {language === 'ru'
                        ? 'Подписание договора...'
                        : 'Келісім-шартқа қол қою...'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {language === 'ru'
                        ? 'Пожалуйста, подтвердите подписание с помощью вашей ЭЦП'
                        : 'Өтінеміз, ЭЦҚ көмегімен қол қоюды растаңыз.'}
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
        {/* Этап 3: Договор зарегистрирован */}
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

