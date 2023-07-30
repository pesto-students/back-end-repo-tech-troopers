const phoneNumberValidation = (phoneNumber) => {
    const phoneNumberRegex = /^\d{10}$/;
    return (phoneNumber.match(phoneNumberRegex)) ? true : false;
}

const checkForInvalid = (val) => {
    return Boolean(val) ? false : true;
}

const emailValidation = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true;
    }
    return false;
}

module.exports = {phoneNumberValidation, checkForInvalid, emailValidation}