const { createCipheriv, createDecipheriv, randomBytes } = require('crypto');

const KEY = randomBytes(8).toString('hex');

/* This little birdy ensures authenticity of encrypted sessions. */
const CANARY = 'canary🦜';

module.exports = {

    encryptSession: username => {
        const iv = randomBytes(8).toString('hex')
        const encodedSession = encodeURI(Buffer.from(iv + encrypt(username + '|' + CANARY, iv)).toString('base64'));
        return encodedSession;
    },

    decryptSession: session => {
        if (!session) return undefined;
        const decodedSession = Buffer.from(decodeURI(session), 'base64').toString('utf8');
        const [ iv, ct ] = [decodedSession.slice(0, 16), decodedSession.slice(16)];
        const [ username, canary ] = decrypt(ct, iv).split('|');
        if (CANARY === canary) return username;
        else null; // Session corrupted!
    }
}

const encrypt = (pt, iv) => {
    const cipher = createCipheriv('aes-128-ctr', KEY, iv)
    let enc = cipher.update(pt, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
}

const decrypt = (ct, iv) => {
    const decipher = createDecipheriv('aes-128-ctr', KEY, iv)
    let dec = decipher.update(ct, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}