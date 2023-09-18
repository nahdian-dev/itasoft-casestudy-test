exports.generateRekeningNumber = () => {
    const accountNumber = Math.floor(Math.random() * 10000000000);
    return accountNumber.toString();
}