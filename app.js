class SecureChat {
    constructor() {
        this.keyPair = null;
        this.jsEncrypt = new JSEncrypt({default_key_size: 2048});
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('generateKeys').addEventListener('click', () => this.generateKeys());
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
    }

    generateKeys() {
        this.jsEncrypt.getKey();
        
        const publicKey = this.jsEncrypt.getPublicKey();
        const privateKey = this.jsEncrypt.getPrivateKey();
        
        document.getElementById('publicKey').value = publicKey;
        document.getElementById('privateKey').value = privateKey;
    }

    generateSymmetricKey() {
        return CryptoJS.lib.WordArray.random(256/8).toString();
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const recipientPublicKey = document.getElementById('recipientPublicKey').value;
        const message = messageInput.value;

        if (!message || !recipientPublicKey) {
            alert('Please enter a message and recipient public key');
            return;
        }

        // Generate a one-time symmetric key
        const symmetricKey = this.generateSymmetricKey();

        // Encrypt the message with the symmetric key
        const encryptedMessage = CryptoJS.AES.encrypt(message, symmetricKey).toString();

        // Encrypt the symmetric key with recipient's public key
        const recipientEncrypt = new JSEncrypt();
        recipientEncrypt.setPublicKey(recipientPublicKey);
        const encryptedSymmetricKey = recipientEncrypt.encrypt(symmetricKey);

        // Combine the encrypted message and key
        const fullMessage = JSON.stringify({
            message: encryptedMessage,
            key: encryptedSymmetricKey
        });

        this.displayMessage(message, 'sent');
        messageInput.value = '';

        // In a real app, you would send fullMessage to a server here
        console.log('Encrypted message ready for transmission:', fullMessage);
    }

    receiveMessage(encryptedData) {
        try {
            const data = JSON.parse(encryptedData);
            
            // Decrypt the symmetric key using our private key
            const symmetricKey = this.jsEncrypt.decrypt(data.key);
            
            // Decrypt the message using the symmetric key
            const decryptedMessage = CryptoJS.AES.decrypt(data.message, symmetricKey)
                .toString(CryptoJS.enc.Utf8);

            this.displayMessage(decryptedMessage, 'received');
        } catch (error) {
            console.error('Error decrypting message:', error);
        }
    }

    displayMessage(message, type) {
        const messagesDiv = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

// Initialize the chat
const chat = new SecureChat(); 