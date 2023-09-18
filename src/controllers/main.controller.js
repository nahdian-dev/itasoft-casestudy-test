const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const CustomApiError = require('../utilities/CustomApiError');
const rekeningUtility = require('../utilities/rekening.utility');

const daftar = (req, res) => {
    // VALIDASI BODY
    const schema = Joi.object({
        nama: Joi.string().min(5).max(16).required(),
        nik: Joi.string().length(16).regex(/^\d+$/),
        phone: Joi.string().pattern(/^[0-9]{10,15}$/)
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        throw new CustomApiError(400, `Terjadi Error ketika validasi body: ${error.details[0].message}`)
    }

    // GENERATE REK AND ID
    const id = uuidv4();
    const rekeningNumber = rekeningUtility.generateRekeningNumber();

    // STORE ARRAY OF OBJECT
    const customerPath = path.join('src', 'data', 'customers.json');
    const customerData = {
        id: id,
        nama: value.nama,
        nik: value.nik,
        phone: value.phone,
        rekening_number: rekeningNumber
    }

    // CHECK DATA IS EXISTS
    const fileData = JSON.parse(fs.readFileSync(customerPath));

    const isNIKExists = fileData.some(item => item.nik === value.nik);
    const isPhoneExists = fileData.some(item => item.phone === value.phone);

    if (isNIKExists || isPhoneExists) {
        throw new CustomApiError(400, 'NIK atau No. Telpone sudah tersedia!');
    }

    // STORE DATA
    fs.readFile(customerPath, function (err, data) {
        if (data.length === 0) {
            return fs.writeFileSync(customerPath, JSON.stringify([customerData], null, 2));
        }

        fileData.push(customerData);
        fs.writeFileSync(customerPath, JSON.stringify(fileData, null, 2));
    });

    // RESPONSE
    res.status(200).json({
        is_success: true,
        status_code: 200,
        rekening_number: rekeningNumber
    });
}

module.exports = { daftar };