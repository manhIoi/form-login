// Đối tượng Validator
function Validator(options){

    var selectorRules = {}
    
    // hàm thực hiện validate
    function validate(inputElement,rule){
        var errorElement = inputElement.nextElementSibling
        var errorMessage = rule.test(inputElement.value) 
        
        var rules =selectorRules[rule.selector]

        for(var i =0; i<rules.length; i++){
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break;
        }

            if (errorMessage){
                errorElement.innerText= errorMessage;
                inputElement.parentElement.classList.add('invalid')
            }
            else {
                errorElement.innerText = ''
                inputElement.parentElement.classList.remove('invalid')
            }
        
        return !errorMessage
    }
    // lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    // khi submit form
    if (formElement) {

        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function (rule){
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement,rule)
                if (!isValid) {
                    isFormValid = false;
                }
            })
            var enableInput =formElement.querySelectorAll('[name]')
            console.log(enableInput);   
            if (isFormValid) {
                if (typeof options.onSubmit === 'function'){
                    var formValues =Array.from(enableInput).reduce(function(values, input){
                        return (values[input.name] = input.value)&& values
                    },{})
                    options.onSubmit(formValues)
                }
            }
        }


        // lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function (rule){

            // lưu lại các rule cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)
            if (inputElement) {
                // xử lí khi blur ra ngoài
                inputElement.onblur = function() {
                    // value: inputElement.value
                    // test func: rule.test
                    validate(inputElement,rule) 
                }
                // xử lí khi người dùng nhập input
                inputElement.oninput = function() {
                    // var errorElement = inputElement.nextElementSibling
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        })
    } 
}
// Định nghĩa rules
// Nguyên tắc của các rule
// 1. khi có lỗi thì trả ra mess lỗi
// 2. khi hợp lệ thì không trả gì có
Validator.isRequired = function(selector,message){
    return {
        selector: selector,
        test: function(value) {
             return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
            //  trim() loại bỏ space người dùng
        }
    }
}
Validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function(value) {
            var regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
            return regex.test(value) ? undefined : 'Email không hợp lệ'
        }
    }
}
Validator.minLength = function(selector,min){
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : 'Mật khẩu ít nhất 6 kí tự'
        }
    }
}
Validator.isSaConfirmed = function(selector, origin, message){
    return {
        selector: selector,
        test: function(value) {
            var originValue = origin();
            return value === originValue ? undefined : 'Nhập lại không chính xác'
        }
    }
}