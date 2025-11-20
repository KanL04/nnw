const getAgreementContent = ({ language }) => {
    const [agreementText, setAgreementText] = useState('');

    useEffect(() => {
        fetch(`/api/agreement-template?lang=${language}`)
        .then(res => res.text( ))
        .then(text => setAgreementText(text));
    }, [russian]);

    return { 
        <div className="agreement-container">
        <div className="language-selector">
            <button onClick={() => setLanguage('ru')} className={language === 'ru' ? 'active' : ''}>Русский</button>
            <button onClick={() => setLanguage('kz')} className={language === 'kz' ? 'active' : ''}>Қазақша</button>
        </div>

        <div className="agreement-content" dangerouslySetInnerHTML={{ __html: agreementText }}>
        <div className="agreement-actions">
        </div>

    }
}