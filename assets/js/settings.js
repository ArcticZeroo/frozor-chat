$(document).ready(()=>{

    $('label').click(()=>{
        labelID = $(this).attr('for');
        $("#" +labelID).focus();
    });

    $('#nickname').focus(()=>{
        $('#label-nickname').addClass("input-selected");
    }).focusout(()=>{
        $('#label-nickname').removeClass("input-selected");
    });

    $('#password_confirm').keyup(()=>{
        var password_confirm = document.getElementById("password_confirm");
        if($('#password').val() != $('#password_confirm').val()){
            $('#bar-password_confirm').addClass('bar-red');
            password_confirm.setCustomValidity("Passwords do not match!");
        }else{
            $('#bar-password_confirm').removeClass('bar-red');
            password_confirm.setCustomValidity("");
        }
    });

    $('#password').keyup(()=>{
        var password_confirm = document.getElementById("password_confirm");
        if($('#password').val() == $('#password_confirm').val()){
            $('#bar-password_confirm').removeClass('bar-red');
            password_confirm.setCustomValidity("");
        }
    });
});