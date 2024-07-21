const isValidIranianCardNumber = (cardNumber) => {
    if (!/^\d{16}$/.test(cardNumber)) {
        return false;
    }

    const sum = cardNumber.split('').reduce((acc, digit, index) => {
        let num = parseInt(digit);
        if ((index + 1) % 2 !== 0) {
            num *= 2;
            if (num > 9) num -= 9;
        }
        return acc + num;
    }, 0);

    return sum % 10 === 0;
};

module.exports = isValidIranianCardNumber;
