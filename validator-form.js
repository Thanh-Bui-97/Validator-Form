// Nguyên tắc khi sử dụng thư viện:
//1. thẻ input thì phải có name và value, để có thể get
//2. Mẫu gọi:
// Validator ({
//    form: '#sign-in-form',                       --Tên form --
//    error: '.form-main-message',                 --Thẻ Warning Message --
//    formInput: '.form-main-group',               --Thẻ cha của từng nhóm input --
//    rules: [
//       Validator.isRequired('#email'),           --Các rules/Cách gọi --
//       Validator.isEmail('#email'),              --Validator.isRequired('-CSS selector-', thuộc tính riêng , customOutputMessage)
//       Validator.isRequired('#remember'),        --                                      VD: number - nếu là minLength -
//       Validator.isRequired('#province'),        --                                      VD: callback - nếu là isConfirmed -
//       Validator.isRequired('#password'),        --                                         -callback return ra values của input cần confirmate
//       Validator.minLength('#password', 7),
//       Validator.isRequired('#password-comfirmation'),
//       Validator.isConfirmed('#password-comfirmation', function () {
//          return document.querySelector('#sign-in-form #password').value;
//       }, 'The values has erorr, please try again'),
//       Validator.isRequired('input[name="gender"]')
//    ]
// })
//
//

function Validator(object) {
   //object {
      //Nhét cái chung vào form, cái riêng vào rules
      //    form: '';
      //    rules: [isRequired, isEmail, minLength...];
   //}

   //Chú ý: trường hợp 1 input nhưng có nhiều rules
   //vd: Validator.isEmail('#email');
   //    Validator.required('#email');
   // ý tưởng: tạo Object chứa các rules với key/values là css selector/array các test
   var selectedRules = {};

   //lấy form cần validate
   var formElement = document.querySelector(object.form);
   if (formElement) {

      //1. Xử lý từng ô input
      //lặp qua mỗi rules và xử lý từng rules (event...)
      object.rules.forEach(function (rule) {

         //1.1. Tập hợp tất cả rules nhét vào object selectedRules
         if (typeof selectedRules[rule.selector] !== 'object') {
            // Nếu không phải mảng thì khai báo nó thành mảng,
            // nếu đã là mảng thì push cái mới vào mảng đó
            selectedRules[rule.selector] = [rule.test];
            //selectedRules = {
            //   #email: [f, f],
            //   #password: [f, f]
            //...
            //};
         } else {
            selectedRules[rule.selector].push(rule.test);
         };
      });

      //1.2. Chạy qua từng rule trong selectedRules,
      //Xử lý từng ô input
      for (const ruleCssSelector in selectedRules) {

         const inputTags = formElement.querySelectorAll(ruleCssSelector);
         let ruleTest = selectedRules[ruleCssSelector];

         for (const testFunction of ruleTest) {
            Array.from(inputTags).forEach(function (inputTag) {
               if (inputTag) {
                  //hàm validate sẽ chạy khi user nhập không đúng
                  //trong hàm validate là logic xử lý chung các loại lỗi xuất hiện
                  //còn đối với từng lỗi của từng selector thì chạy xử lý riêng

                  inputTag.onblur = function () {  //event khi blur mouse ra ngoài input
                     //Đứng từ đây lấy Values của inputTag
                     //chạy hàm test, hàm test nhận đối số là values
                     //hàm test kiểm tra xem nếu có lỗi thì thực hiện hàm
                     // test(value) => Nên tách ra 1 hàm riêng ở dưới để xứ lý
                     validate(inputTag, testFunction, ruleCssSelector);
                  };

                  //khi đang nhập - tức không thỏa điều kiện warningMessage
                  inputTag.oninput = function() {  //event khi đang nhập trong input
                     const messageTag = getParentElement(inputTag, object.formInput).querySelector(object.error);
                     messageTag.innerText = '';
                     getParentElement(inputTag, object.formInput).classList.remove('invalid');
                  };

                  //Khi thay đổi thông tin, dành cho thẻ select
                  inputTag.onchange = function () {
                     validate(inputTag, testFunction, ruleCssSelector);
                  }
               };
            });
         }
      };

      //2. Xử lý submit
      formElement.onsubmit = function(e) {   //event khi submit
         e.preventDefault();
         var formData = {};
         var isValidForm = true;

         //Chạy validate hết các test của các rule
         for (const ruleCssSelector in selectedRules) {

            let ruleTest = selectedRules[ruleCssSelector];
            const inputTags = formElement.querySelectorAll(ruleCssSelector);

            for (const testFunction of ruleTest) {
               Array.from(inputTags).forEach(function (inputTag) {
                  if (!validate(inputTag, testFunction, ruleCssSelector)) {
                     isValidForm = false;
                  };
               })
            }
         };

         if (isValidForm) {
            for (let i in selectedRules) {
               const inputTags = formElement.querySelectorAll(i);
               Array.from(inputTags).forEach(function (inputTag) {

                  switch (inputTag.type) {
                     case 'checkbox':
                        if (inputTag.checked) {
                           if (!Array.isArray(formData[inputTag.name])) {
                              formData[inputTag.name] = [];
                           }
                           formData[inputTag.name].push(inputTag.value)
                        };
                        break;
                     case 'radio':
                        if (inputTag.checked) {
                           formData[inputTag.name] = inputTag.value;
                        };
                        break;
                     default:
                        formData[inputTag.name] = inputTag.value;
                        break;
                  };
               });
            };
            console.log(formData);
         };
      };
   };

   function getParentElement(childElement, parentElementSelector) {
      while (childElement.parentElement) {
         if (childElement.parentElement.matches(parentElementSelector)) {
            return childElement.parentElement;
         }
         childElement = childElement.parentElement;
      }
   };

   function validate (inputTag, testFunction, ruleCssSelector) {
      const messageTag = getParentElement(inputTag, object.formInput).querySelector(object.error);
      var warningMessage; // = rule.test(inputTag.value); 'cũ'

      switch (inputTag.type) {
         case 'checkbox':
         case 'radio':
            warningMessage = testFunction(
               getParentElement(inputTag, object.formInput)       //Đứng từ thẻ cha
                  .querySelector(ruleCssSelector + ':checked')
            );
            break;
         default:
            warningMessage = testFunction(inputTag.value);
            break;
      };

      if (warningMessage) {
         messageTag.innerText = warningMessage;
         getParentElement(inputTag, object.formInput).classList.add('invalid');
      } else {
         messageTag.innerText = '';
         getParentElement(inputTag, object.formInput).classList.remove('invalid');
      };

      return !warningMessage; //-->boolean type
   };
};

Validator.isRequired = function (selector, customOutputMessage) {
   return {
      selector: selector,
      test: function (value) {  // nới này để kiểm tra bắt buộc nhập
         return value ? undefined :
         customOutputMessage || "You have to provide a values for this";
      }
   };
};

Validator.isEmail = function (selector, customOutputMessage) {
   return {
      selector: selector,
      test: function (value) {  // Nơi này để kiểm tra Email phải có gì
         const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
         return emailRegex.test(value) ? undefined :
         customOutputMessage || "May be you forgot @ somewhere, please try againt";
      }
   };
};

// Validator.minLength = function (selector, min, customOutputMessage) {
//    return {
//       selector: selector,
//       test: function (value) {
//          return value.length >= min ? undefined :
//          customOutputMessage || `At least ${min} characters, please!`;
//       }
//    };
// };
Validator.isPassword = function (selector, min, customOutputMessage) {
   return {
      selector: selector,
      test: function (value) {
         let validated = true;
         let passwordstrength = 0;

         if (value.length < min) {
            validated = false;
            return `Must have at least ${min} characters!`;
         } else {
            passwordstrength += 1;
         };
         if (!/\d+/g.test(value.match(/\d+/g)))  {
            validated = false;
            return `Must have at least one digit.`;
         } else {
            passwordstrength += 1;
         };
         if (!/[A-Z]/.test(value)) {
            validated = false;
            return `Must have at least one upper case`;
         } else {
            passwordstrength += 1;
         };

         // if (!/[a-z]/.test(value)) {
         //    validated = false;
         //    return `Must have at least one lower case`;
         // } else {
         //    passwordstrength += 1;
         // };
         // if (/[^0-9a-zA-Z]/.test(value)) {
         //    validated = false;
         //    return `Deo biet`;
         // } else {
         //    passwordstrength += 1;
         // };

         if (validated) {
            return undefined;
         }
         // if (!/^[a-zA-Z0-9]$/.test(value)) {
         //    validated = false;
         // } else {
         //    passwordstrength += 1;
         // };
      }
   };
};

Validator.isConfirmed = function (selector, getConfirmValue, customOutputMessage) {
   return {
      selector: selector,
      test: function (value) {
         return value === getConfirmValue() ? undefined :
         customOutputMessage || `Please this values have to be the same as above!`;
      }
   };
};