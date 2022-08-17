function Validator(object) {
   //object {
      //Nhét cái chung vào form, cái riêng vào rules
   //    form: '';
   //    rules: [isRequired, isEmail, minLength];
   //}

   var formElement = document.querySelector(object.form);
   if (formElement) {
      object.rules.forEach(function (rule) {
         console.log(rule);
         const inputTag = formElement.querySelector(rule.selector);

         if (inputTag) {
            //Hiện lỗi khi blur khỏi input
            //mà nhập khoảng trắng hoặc không nhập
            inputTag.onblur = function () {
               //Đứng từ đây lấy Values của inputTag
               //chạy hàm test, hàm test nhận đối số là values
               //hàm test kiểm tra xem nếu có lỗi thì thực hiện hàm
               // test(value) => Nên tách ra 1 hàm riêng ở dưới để xứ lý
               validate(inputTag, rule);
            }

            //khi đang nhập - tức không thỏa điều kiện warningMessage
            inputTag.oninput = function() {
               const messageTag = inputTag.parentElement.querySelector(object.error);
               messageTag.innerText = '';
               inputTag.parentElement.classList.remove('invalid');
            }
         }
         console.log(inputTag);
      });
   };

   function validate (inputTag, rule) {
      const warningMessage = rule.test(inputTag.value);
      const messageTag = inputTag.parentElement.querySelector(object.error);

      if (warningMessage) {
         messageTag.innerText = warningMessage;
         inputTag.parentElement.classList.add('invalid');
      } else {
         messageTag.innerText = '';
         inputTag.parentElement.classList.remove('invalid');
      }
   };
};

Validator.isRequired = function (selector) {
   return {
      selector: selector,
      test: function (value) {  // nới này để kiểm tra bắt buộc nhập
         return value.trim() ? undefined : "Something was wrong, please try againt";
      }
   };
};

Validator.isEmail = function (selector) {
   return {
      selector: selector,
      test: function (value) {  // Nơi này để kiểm tra Email phải có gì
         const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
         return emailRegex.test(value) ? undefined :
         "May be you forgot @ somewhere, please try againt";
      }
   };
};

Validator.minLength = function (selector, min) {
   return {
      selector: selector,
      test: function (value) {
         return value.length >= min ? undefined :
         `At least ${min} characters, please!`;
      }
   };
};