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
   var selectorRules = {};

   var formElement = document.querySelector(object.form);
   if (formElement) {
      object.rules.forEach(function (rule) {
         // Nếu không phải mảng thì khai báo nó thành mảng,
         // nếu đã là mảng thì push cái mới vào mảng đó
         if (typeof selectorRules[rule.selector] !== 'object') {
            selectorRules[rule.selector] = [rule.test];
         } else {
            selectorRules[rule.selector].push(rule.test);
         }
         // or
         // if (Array.isArray(selectorRules[rule.selector])) {
         //    selectorRules[rule.selector].push(rule.test);
         // } else {
         //    selectorRules[rule.selector] = [rule.test];
         // }


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
      });
   };

   function validate (inputTag, rule) {
      const messageTag = inputTag.parentElement.querySelector(object.error);
      var warningMessage; // = rule.test(inputTag.value); 'cũ'

      //Lấy các rule của từng selector dưới dạng array các function tương ứng
      var rules = selectorRules[rule.selector];

      //Đọc qua từng rules của từng selector
      //khi có lỗi thì break khỏi loop, nếu không nó sẽ chỉ chạy cái cuối
      for (var i = 0; i < rules.length; i++) {
         warningMessage = rules[i](inputTag.value); //'mới'
         if (warningMessage) break;
      };
      console.log(rule)


      if (warningMessage) {
         messageTag.innerText = warningMessage;
         inputTag.parentElement.classList.add('invalid');
      } else {
         messageTag.innerText = '';
         inputTag.parentElement.classList.remove('invalid');
      }
   };
};

Validator.isRequired = function (selector, customOutputMessage) {
   return {
      selector: selector,
      test: function (value) {  // nới này để kiểm tra bắt buộc nhập
         return value.trim() ? undefined :
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

Validator.minLength = function (selector, min, customOutputMessage) {
   return {
      selector: selector,
      test: function (value) {
         return value.length >= min ? undefined :
         customOutputMessage || `At least ${min} characters, please!`;
      }
   };
};

Validator.passwordConfirmation = function (selector, valueConfirmation, customOutputMessage) {
   return {
      selector: selector,
      test: function (value) {
         console.log(value);
         console.log(valueConfirmation());
         return value === valueConfirmation() ? undefined :
         customOutputMessage || `Please this values have to be the same as above!`;
      }
   };
};