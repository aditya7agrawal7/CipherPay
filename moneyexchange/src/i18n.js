// i18n.js — RupeeFlow multilingual translations
// Languages: EN (English), HI (Hindi), ES (Spanish), FR (French), DE (German)

export const translations = {
  EN: {
    // Top Panel
    connected: 'Connected',
    disconnect: 'Disconnect',
    connectWallet: 'Connect Wallet',

    // Hero
    heroTitle: 'Connect your wallet, scan a QR code, and pay.',
    heroSubtitle: 'The merchant receives local currency instantly.',

    // Input screen
    youSend: 'You Send',
    youReceive: 'You Receive (Estimated)',
    minConversion: 'Minimum conversion is 5 USDC',
    continue: 'Continue',

    // Payment Methods
    chooseDepositMode: 'Choose Deposit Mode',
    selectTransfer: (amount) => `Select how you would like to transfer your ${amount} USDC.`,
    scanQR: 'Scan QR Code',
    instantWallet: 'Instant wallets transfer',
    manualEntry: 'Manual Data Entry',
    inputDetails: 'Input transaction details',

    // QR Panel
    sendExactly: (amount) => `Send exactly ${amount} USDC to:`,
    destinationUPI: 'Enter Destination UPI ID for Payout',
    confirmPayout: 'Confirm Payout',
    upiError: 'Enter a valid UPI ID (e.g. name@upi).',

    // Manual Entry
    upiId: 'UPI ID',
    ifscCode: 'IFSC Code',
    holderName: 'Holder Name',
    receiverName: 'Receiver Name',
    accountNumber: 'Account Number',
    txHash: 'USDC Transaction Hash (TxHash)',
    generateMock: 'Generate Mock Hash',
    verifyOffRamp: 'Verify & Off-Ramp',
    bankAccount: 'Bank Account',

    // Errors
    errUpi: 'Enter a valid UPI ID (e.g., name@upi).',
    errName: 'Name is required.',
    errAccountNum: 'Enter a valid account number.',
    errIfsc: 'Enter a valid IFSC code (e.g., IFSC0000123).',
    errTxHash: 'Enter a valid blockchain transaction hash.',

    // Simulation
    confirmingDeposit: 'Confirming Deposit',
    verifyingTx: 'Verifying transaction parameters on-chain and routing IMPS payment.',
    txSubmitted: 'Transaction Submitted',
    checkingValidity: 'Checking deposit validity',
    confirmingNetwork: 'Confirming on Network',
    validatingBlock: 'Validating block consensus depth',
    routingPayout: 'Routing INR Payout',
    dispatchingIMPS: 'Dispatching IMPS transaction to beneficiary',

    // Success
    paymentSent: 'Payment Sent Successfully!',
    conversionComplete: 'Your conversion from USDC to INR is complete.',
    exchanged: 'Exchanged:',
    deposited: 'Deposited:',
    rateApplied: 'Rate applied:',
    payoutTarget: 'Payout Target:',
    bankUTR: 'Bank UTR (Ref):',
    txHashLabel: 'Tx Hash:',
    makeAnotherPayment: 'Make Another Payment',

    // Back / Nav
    back: 'Back',

    // Footer
    footerCompliance: 'Fully compliant simulated IMPS transfers',
  },

  HI: {
    // Top Panel
    connected: 'जुड़ा हुआ',
    disconnect: 'डिस्कनेक्ट करें',
    connectWallet: 'वॉलेट जोड़ें',

    // Hero
    heroTitle: 'अपना वॉलेट कनेक्ट करें, QR कोड स्कैन करें, और भुगतान करें।',
    heroSubtitle: 'व्यापारी को तुरंत स्थानीय मुद्रा प्राप्त होता है।',

    // Input screen
    youSend: 'आप भेजें',
    youReceive: 'आपको मिलेगा (अनुमानित)',
    minConversion: 'न्यूनतम रूपांतरण 5 USDC है',
    continue: 'जारी रखें',

    // Payment Methods
    chooseDepositMode: 'जमा विधि चुनें',
    selectTransfer: (amount) => `चुनें कि आप अपने ${amount} USDC कैसे ट्रांसफर करना चाहते हैं।`,
    scanQR: 'QR कोड स्कैन करें',
    instantWallet: 'तत्काल वॉलेट ट्रांसफर',
    manualEntry: 'मैन्युअल डेटा प्रविष्टि',
    inputDetails: 'लेनदेन विवरण दर्ज करें',

    // QR Panel
    sendExactly: (amount) => `ठीक ${amount} USDC यहाँ भेजें:`,
    destinationUPI: 'भुगतान के लिए UPI ID दर्ज करें',
    confirmPayout: 'भुगतान की पुष्टि करें',
    upiError: 'मान्य UPI ID दर्ज करें (जैसे name@upi)।',

    // Manual Entry
    upiId: 'UPI आईडी',
    ifscCode: 'IFSC कोड',
    holderName: 'खाताधारक का नाम',
    receiverName: 'प्राप्तकर्ता का नाम',
    accountNumber: 'खाता संख्या',
    txHash: 'USDC लेनदेन हैश (TxHash)',
    generateMock: 'मॉक हैश बनाएं',
    verifyOffRamp: 'सत्यापित करें और Off-Ramp करें',
    bankAccount: 'बैंक खाता',

    // Errors
    errUpi: 'मान्य UPI ID दर्ज करें (जैसे, name@upi)।',
    errName: 'नाम आवश्यक है।',
    errAccountNum: 'मान्य खाता संख्या दर्ज करें।',
    errIfsc: 'मान्य IFSC कोड दर्ज करें (जैसे, IFSC0000123)।',
    errTxHash: 'मान्य ब्लॉकचेन ट्रांज़ैक्शन हैश दर्ज करें।',

    // Simulation
    confirmingDeposit: 'जमा की पुष्टि हो रही है',
    verifyingTx: 'ऑन-चेन लेनदेन मापदंडों को सत्यापित किया जा रहा है और IMPS भुगतान रूट किया जा रहा है।',
    txSubmitted: 'लेनदेन सबमिट हुआ',
    checkingValidity: 'जमा की वैधता जाँची जा रही है',
    confirmingNetwork: 'नेटवर्क पर पुष्टि हो रही है',
    validatingBlock: 'ब्लॉक सहमति गहराई को मान्य किया जा रहा है',
    routingPayout: 'INR भुगतान रूट हो रहा है',
    dispatchingIMPS: 'लाभार्थी को IMPS लेनदेन भेजा जा रहा है',

    // Success
    paymentSent: 'भुगतान सफलतापूर्वक भेजा गया!',
    conversionComplete: 'USDC से INR का रूपांतरण पूर्ण हुआ।',
    exchanged: 'विनिमय किया:',
    deposited: 'जमा किया:',
    rateApplied: 'लागू दर:',
    payoutTarget: 'भुगतान लक्ष्य:',
    bankUTR: 'बैंक UTR (संदर्भ):',
    txHashLabel: 'Tx हैश:',
    makeAnotherPayment: 'एक और भुगतान करें',

    // Back / Nav
    back: 'वापस',

    // Footer
    footerCompliance: 'पूरी तरह अनुपालन-आधारित अनुकरणीय IMPS ट्रांसफर',
  },

  ES: {
    connected: 'Conectado',
    disconnect: 'Desconectar',
    connectWallet: 'Conectar Billetera',

    heroTitle: 'Conecta tu billetera, escanea un código QR y paga.',
    heroSubtitle: 'El comerciante recibe la moneda local al instante.',

    youSend: 'Envías',
    youReceive: 'Recibes (Estimado)',
    minConversion: 'La conversión mínima es de 5 USDC',
    continue: 'Continuar',

    chooseDepositMode: 'Elige Modo de Depósito',
    selectTransfer: (amount) => `Selecciona cómo deseas transferir tus ${amount} USDC.`,
    scanQR: 'Escanear Código QR',
    instantWallet: 'Transferencia instantánea de billetera',
    manualEntry: 'Entrada Manual de Datos',
    inputDetails: 'Ingresa los detalles de la transacción',

    sendExactly: (amount) => `Envía exactamente ${amount} USDC a:`,
    destinationUPI: 'Ingresa UPI ID de destino para el pago',
    confirmPayout: 'Confirmar Pago',
    upiError: 'Ingresa un UPI ID válido (ej. nombre@upi).',

    upiId: 'UPI ID',
    ifscCode: 'Código IFSC',
    holderName: 'Nombre del Titular',
    receiverName: 'Nombre del Receptor',
    accountNumber: 'Número de Cuenta',
    txHash: 'Hash de Transacción USDC (TxHash)',
    generateMock: 'Generar Hash de Prueba',
    verifyOffRamp: 'Verificar y Retirar',
    bankAccount: 'Cuenta Bancaria',

    errUpi: 'Ingresa un UPI ID válido (ej., nombre@upi).',
    errName: 'El nombre es obligatorio.',
    errAccountNum: 'Ingresa un número de cuenta válido.',
    errIfsc: 'Ingresa un código IFSC válido (ej., IFSC0000123).',
    errTxHash: 'Ingresa un hash de transacción blockchain válido.',

    confirmingDeposit: 'Confirmando Depósito',
    verifyingTx: 'Verificando parámetros de transacción en cadena y enrutando pago IMPS.',
    txSubmitted: 'Transacción Enviada',
    checkingValidity: 'Comprobando validez del depósito',
    confirmingNetwork: 'Confirmando en la Red',
    validatingBlock: 'Validando profundidad de consenso de bloque',
    routingPayout: 'Enrutando Pago INR',
    dispatchingIMPS: 'Despachando transacción IMPS al beneficiario',

    paymentSent: '¡Pago Enviado Exitosamente!',
    conversionComplete: 'Tu conversión de USDC a INR está completa.',
    exchanged: 'Intercambiado:',
    deposited: 'Depositado:',
    rateApplied: 'Tasa aplicada:',
    payoutTarget: 'Destino del Pago:',
    bankUTR: 'UTR Bancario (Ref):',
    txHashLabel: 'Hash Tx:',
    makeAnotherPayment: 'Hacer Otro Pago',

    back: 'Atrás',
    footerCompliance: 'Transferencias IMPS simuladas totalmente conformes',
  },

  FR: {
    connected: 'Connecté',
    disconnect: 'Déconnecter',
    connectWallet: 'Connecter le Portefeuille',

    heroTitle: 'Connectez votre portefeuille, scannez un QR code et payez.',
    heroSubtitle: 'Le marchand reçoit la monnaie locale instantanément.',

    youSend: 'Vous Envoyez',
    youReceive: 'Vous Recevez (Estimé)',
    minConversion: 'La conversion minimum est de 5 USDC',
    continue: 'Continuer',

    chooseDepositMode: 'Choisir le Mode de Dépôt',
    selectTransfer: (amount) => `Sélectionnez comment transférer vos ${amount} USDC.`,
    scanQR: 'Scanner le QR Code',
    instantWallet: 'Transfert de portefeuille instantané',
    manualEntry: 'Saisie Manuelle',
    inputDetails: 'Saisir les détails de la transaction',

    sendExactly: (amount) => `Envoyez exactement ${amount} USDC à :`,
    destinationUPI: 'Entrez l\'UPI ID de destination pour le paiement',
    confirmPayout: 'Confirmer le Paiement',
    upiError: 'Entrez un UPI ID valide (ex. nom@upi).',

    upiId: 'UPI ID',
    ifscCode: 'Code IFSC',
    holderName: 'Nom du Titulaire',
    receiverName: 'Nom du Destinataire',
    accountNumber: 'Numéro de Compte',
    txHash: 'Hash de Transaction USDC (TxHash)',
    generateMock: 'Générer un Hash de Test',
    verifyOffRamp: 'Vérifier et Retirer',
    bankAccount: 'Compte Bancaire',

    errUpi: 'Entrez un UPI ID valide (ex., nom@upi).',
    errName: 'Le nom est obligatoire.',
    errAccountNum: 'Entrez un numéro de compte valide.',
    errIfsc: 'Entrez un code IFSC valide (ex., IFSC0000123).',
    errTxHash: 'Entrez un hash de transaction blockchain valide.',

    confirmingDeposit: 'Confirmation du Dépôt',
    verifyingTx: 'Vérification des paramètres de transaction on-chain et routage du paiement IMPS.',
    txSubmitted: 'Transaction Soumise',
    checkingValidity: 'Vérification de la validité du dépôt',
    confirmingNetwork: 'Confirmation sur le Réseau',
    validatingBlock: 'Validation de la profondeur de consensus du bloc',
    routingPayout: 'Routage du Paiement INR',
    dispatchingIMPS: 'Envoi de la transaction IMPS au bénéficiaire',

    paymentSent: 'Paiement Envoyé avec Succès !',
    conversionComplete: 'Votre conversion de USDC en INR est terminée.',
    exchanged: 'Échangé :',
    deposited: 'Déposé :',
    rateApplied: 'Taux appliqué :',
    payoutTarget: 'Cible du Paiement :',
    bankUTR: 'UTR Bancaire (Réf) :',
    txHashLabel: 'Hash Tx :',
    makeAnotherPayment: 'Effectuer un Autre Paiement',

    back: 'Retour',
    footerCompliance: 'Transferts IMPS simulés entièrement conformes',
  },

  DE: {
    connected: 'Verbunden',
    disconnect: 'Trennen',
    connectWallet: 'Wallet verbinden',

    heroTitle: 'Verbinden Sie Ihr Wallet, scannen Sie einen QR-Code und bezahlen Sie.',
    heroSubtitle: 'Der Händler erhält sofort die lokale Währung.',

    youSend: 'Sie Senden',
    youReceive: 'Sie Erhalten (Geschätzt)',
    minConversion: 'Mindestumrechnung beträgt 5 USDC',
    continue: 'Weiter',

    chooseDepositMode: 'Einzahlungsmethode Wählen',
    selectTransfer: (amount) => `Wählen Sie, wie Sie Ihre ${amount} USDC übertragen möchten.`,
    scanQR: 'QR-Code Scannen',
    instantWallet: 'Sofortige Wallet-Übertragung',
    manualEntry: 'Manuelle Dateneingabe',
    inputDetails: 'Transaktionsdetails eingeben',

    sendExactly: (amount) => `Senden Sie genau ${amount} USDC an:`,
    destinationUPI: 'Ziel-UPI-ID für Auszahlung eingeben',
    confirmPayout: 'Auszahlung Bestätigen',
    upiError: 'Geben Sie eine gültige UPI-ID ein (z.B. name@upi).',

    upiId: 'UPI-ID',
    ifscCode: 'IFSC-Code',
    holderName: 'Kontoinhaber',
    receiverName: 'Empfängername',
    accountNumber: 'Kontonummer',
    txHash: 'USDC-Transaktions-Hash (TxHash)',
    generateMock: 'Test-Hash generieren',
    verifyOffRamp: 'Verifizieren & Abheben',
    bankAccount: 'Bankkonto',

    errUpi: 'Geben Sie eine gültige UPI-ID ein (z.B., name@upi).',
    errName: 'Name ist erforderlich.',
    errAccountNum: 'Geben Sie eine gültige Kontonummer ein.',
    errIfsc: 'Geben Sie einen gültigen IFSC-Code ein (z.B., IFSC0000123).',
    errTxHash: 'Geben Sie einen gültigen Blockchain-Transaktions-Hash ein.',

    confirmingDeposit: 'Einzahlung Bestätigen',
    verifyingTx: 'Transaktionsparameter werden on-chain verifiziert und IMPS-Zahlung weitergeleitet.',
    txSubmitted: 'Transaktion Eingereicht',
    checkingValidity: 'Einzahlungsgültigkeit prüfen',
    confirmingNetwork: 'Im Netzwerk Bestätigen',
    validatingBlock: 'Block-Konsenustiefe validieren',
    routingPayout: 'INR-Auszahlung Weiterleiten',
    dispatchingIMPS: 'IMPS-Transaktion an Begünstigten senden',

    paymentSent: 'Zahlung Erfolgreich Gesendet!',
    conversionComplete: 'Ihre Konvertierung von USDC zu INR ist abgeschlossen.',
    exchanged: 'Ausgetauscht:',
    deposited: 'Eingezahlt:',
    rateApplied: 'Angewandter Kurs:',
    payoutTarget: 'Auszahlungsziel:',
    bankUTR: 'Bank-UTR (Ref):',
    txHashLabel: 'Tx-Hash:',
    makeAnotherPayment: 'Weitere Zahlung Durchführen',

    back: 'Zurück',
    footerCompliance: 'Vollständig konforme simulierte IMPS-Transfers',
  },
};

/**
 * Returns a translation string for the given language and key.
 * Falls back to English if the key is missing in the selected language.
 * @param {string} lang - Language code ('EN', 'HI', etc.)
 * @param {string} key - Translation key
 * @param  {...any} args - Arguments for function-based translations
 */
export function t(lang, key, ...args) {
  const langMap = translations[lang] || translations['EN'];
  const fallback = translations['EN'];
  const val = langMap[key] ?? fallback[key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}
