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

         // Nếu không phải mảng thì khai báo nó thành mảng,
         // nếu đã là mảng thì push cái mới vào mảng đó
         if (typeof selectedRules[rule.selector] !== 'object') {
            selectedRules[rule.selector] = [rule.test];
            //selectedRules = {
            //   #email: [f, f],
            //   #password: [f, f]
            //...
            //};
         } else {
            selectedRules[rule.selector].push(rule.test);
         };

         const inputTag = formElement.querySelector(rule.selector);

         if (inputTag) {

            //hàm validate sẽ chạy khi user nhập không đúng
            //trong hàm validate là logic xử lý chung các loại lỗi xuất hiện
            //còn đối với từng lỗi của từng selector thì chạy xử lý riêng

            inputTag.onblur = function () {  //event khi blur mouse ra ngoài input
               //Đứng từ đây lấy Values của inputTag
               //chạy hàm test, hàm test nhận đối số là values
               //hàm test kiểm tra xem nếu có lỗi thì thực hiện hàm
               // test(value) => Nên tách ra 1 hàm riêng ở dưới để xứ lý
               validate(inputTag, rule);
            }

            //khi đang nhập - tức không thỏa điều kiện warningMessage
            inputTag.oninput = function() {  //event khi đang nhập trong input
               const messageTag = getParentElement(inputTag, object.formInput).querySelector(object.error);
               messageTag.innerText = '';
               getParentElement(inputTag, object.formInput).classList.remove('invalid');
            }
         }
      });

      //2. Xử lý submit
      formElement.onsubmit = function(e) {   //event khi submit
         e.preventDefault();
         var formData = {};
         var isValidForm = true;

         object.rules.forEach(function (rule) {
            const inputTag = formElement.querySelector(rule.selector);
            if (!validate(inputTag, rule)) {
               isValidForm = false;
            }
         });
         if (isValidForm) {
            for (let i in selectedRules) {
               const inputTag = formElement.querySelector(i);
               formData[inputTag.name] = inputTag.value;
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


   function validate (inputTag, rule) {
      const messageTag = getParentElement(inputTag, object.formInput).querySelector(object.error);
      var warningMessage; // = rule.test(inputTag.value); 'cũ'

      //Lấy các rule của từng selector, dưới dạng array chứa các function tương ứng
      var testArray = selectedRules[rule.selector]; //giờ nó là Array các hàm test

      // xử lý qua từng rules của từng selector
      //khi  thì break khỏi loop, nếu không nó sẽ chỉ chạy cái cuối
      for (var i = 0; i < testArray.length; i++) {
         warningMessage = testArray[i](inputTag.value); //'mới'
         if (warningMessage) break;
      };


      if (warningMessage) {
         messageTag.innerText = warningMessage;
         getParentElement(inputTag, object.formInput).classList.add('invalid');
      } else {
         messageTag.innerText = '';
         getParentElement(inputTag, object.formInput).classList.remove('invalid');
      }

      return !warningMessage; //boolean value
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

Validator.isConfirmed = function (selector, getConfirmValue, customOutputMessage) {
   return {
      selector: selector,
      test: function (value) {
         return value === getConfirmValue() ? undefined :
         customOutputMessage || `Please this values have to be the same as above!`;
      }
   };
};