const validator = require('validator');
const validate = (data)=>{
    const mandatoryField = ['firstName','emailId','password'];
    const isAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));

    if(!isAllowed){
        throw new Error("Field id Missing");
    }
    if(!validator.isEmail(data.emailId)){
        throw new Erro("Invalid Email");
    }
    if(!validator.isStrongPassword(data.password)){
        throw new Error('Weak Password');
    }
}

module.exports = validate;