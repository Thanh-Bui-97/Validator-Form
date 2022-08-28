Hi guys, this is my mini project about creating and FE handling a form.
Based on F8, but some codes i was handled by my way, as create some other features.
And the most important thing in this project is the mini _validator-form_" library. It can help handle 90% features of almost every basic form.
But the library have some rules:
1. The input tag (HTML) must be setted attribute "name"
2. How to the library work:
   `Validator ({
   form: '#sign-in-form',                       //--Form CSS selector Name--
   error: '.form-main-message',                 //--Warning Message CSS selector Name--
   formInput: '.form-main-group',               //--Form group CSS selector Name--
   rules: [                                     //--rules: isRequired, isEmail, isPassword, isConfirmed
      Validator.rules('CSS selector', special properties , customWarningMessage)
//EX:
      Validator.isPassword('#password', 7),
      Validator.isEmail('#email'),
      `Validator.isConfirmed('#password-comfirmation', function () {
         return document.querySelector('#sign-in-form #password').value;
      }, 'The values has erorr, please try again'),
      ...
    ]
   })`