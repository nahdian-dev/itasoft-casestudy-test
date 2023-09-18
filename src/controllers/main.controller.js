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
        no_rekening: rekeningNumber,
        nominal: 0
    }

    // CHECK DATA IS EXISTS
    const customers = JSON.parse(fs.readFileSync(customerPath));

    const isNIKExists = customers.some(item => item.nik === value.nik);
    const isPhoneExists = customers.some(item => item.phone === value.phone);

    if (isNIKExists || isPhoneExists) {
        throw new CustomApiError(400, 'NIK atau No. Telpone sudah tersedia!');
    }

    // STORE DATA
    fs.readFile(customerPath, function (err, data) {
        if (data.length === 0) {
            fs.writeFileSync(customerPath, JSON.stringify([customerData], null, 2));
        }

        customers.push(customerData);
        fs.writeFileSync(customerPath, JSON.stringify(customers, null, 2));
    });

    // RESPONSE
    res.status(200).json({
        is_success: true,
        status_code: 200,
        no_rekening: rekeningNumber
    });
}

const tabung = (req, res) => {
    // VALIDASI BODY
    const schema = Joi.object({
        no_rekening: Joi.string().required(),
        nominal: Joi.number().required()
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        throw new CustomApiError(400, `Terjadi Error ketika validasi body: ${error.details[0].message}`)
    }

    // CHECK NO REKENING
    const customerPath = path.join('src', 'data', 'customers.json');
    const customers = JSON.parse(fs.readFileSync(customerPath));
    const isREKExists = customers.some(item => item.no_rekening === value.no_rekening);

    if (!isREKExists) {
        throw new CustomApiError(400, 'Nomor Rekening Tidak Terdaftar!');
    }

    // UPDATE NOMINAL
    let currentSaldo = 0;
    for (let index = 0; index < customers.length; index++) {
        if (customers[index].no_rekening === value.no_rekening) {
            customers[index].nominal += value.nominal;
            const updateNominal = JSON.stringify(customers, null, 2);

            fs.writeFileSync(customerPath, updateNominal);
            currentSaldo = customers[index].nominal;
        }
    }

    // RESPONSE
    res.status(200).json({
        is_success: true,
        status_code: 200,
        saldo: currentSaldo
    });
}


const tarik = (req, res) => {
    // VALIDASI BODY
    const schema = Joi.object({
        no_rekening: Joi.string().required(),
        nominal: Joi.number().required()
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        throw new CustomApiError(400, `Terjadi Error ketika validasi body: ${error.details[0].message}`)
    }

    // CHECK NO REKENING
    const customerPath = path.join('src', 'data', 'customers.json');
    const customers = JSON.parse(fs.readFileSync(customerPath));
    const isREKExists = customers.some(item => item.no_rekening === value.no_rekening);

    if (!isREKExists) {
        throw new CustomApiError(400, 'Nomor Rekening Tidak Terdaftar!');
    }

    // UPDATE NOMINAL
    let currentSaldo = 0;

    for (let index = 0; index < customers.length; index++) {
        if (customers[index].no_rekening === value.no_rekening) {
            if (customers[index].nominal < value.nominal) {
                throw new CustomApiError(400, 'Saldo tidak cukup!');
            }
            customers[index].nominal -= value.nominal;
            const updateNominal = JSON.stringify(customers, null, 2);

            fs.writeFileSync(customerPath, updateNominal);
            currentSaldo = customers[index].nominal;
        }
    }

    // RESPONSE
    res.status(200).json({
        is_success: true,
        status_code: 200,
        saldo: currentSaldo
    });
}

const saldo = (req, res) => {
    // CHECK NO REKENING
    const customerPath = path.join('src', 'data', 'customers.json');
    const customers = JSON.parse(fs.readFileSync(customerPath));
    const isREKExists = customers.some(item => item.no_rekening === req.params.no_rekening);

    if (!isREKExists) {
        throw new CustomApiError(400, 'Nomor Rekening Tidak Terdaftar!');
    }

    // UPDATE NOMINAL
    let currentSaldo = 0;

    for (let index = 0; index < customers.length; index++) {
        if (customers[index].no_rekening === req.params.no_rekening) {
            currentSaldo = customers[index].nominal;
        }
    }

    // RESPONSE
    res.status(200).json({
        is_success: true,
        status_code: 200,
        saldo: currentSaldo
    });
}

module.exports = { daftar, tabung, tarik, saldo };