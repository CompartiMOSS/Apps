'use strict';

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var accountName = '';
// Este código se ejecuta cuando el DOM está preparado y crea un objeto de contexto necesario para poder usar el modelo de objetos de SharePoint
$(document).ready(function () {
    Encamina.talkFollowers.getProfile().then(function (data) {
        $("#templates").load(_spPageContextInfo.webAbsoluteUrl + "/Scripts/Template/Profile.html", function () {
            var template = document.getElementById("templates").innerHTML;
            var output = Mustache.render(template, data);
            $(".izquierda").html(output);
            accountName = data.accountName;
            Encamina.talkFollowers.getFeed(accountName).then(function (data) {
                $("#templates").load(_spPageContextInfo.webAbsoluteUrl + "/Scripts/Template/Feed.html", function () {
                     template = document.getElementById("templates").innerHTML;
                     output = Mustache.render(template, data);
                    $("#MyFeed").html(output);
                });
            });
        });
        }
    );
    
});

function postToMyFeed() {
    var valor = $("#post").val();
    Encamina.talkFollowers.addPost(valor, accountName).then(function (data) {
        Encamina.talkFollowers.getFeed(accountName).then(function (data) {
            $("#templates").load(_spPageContextInfo.webAbsoluteUrl + "/Scripts/Template/Feed.html", function () {
               var  template = document.getElementById("templates").innerHTML;
               var output = Mustache.render(template, data);
                $("#MyFeed").html(output);
            });
        });
    });
    $("#post").val('');
}

function likePost(id, like) {
    Encamina.talkFollowers.likePost(id, like).then(function()
    {
        Encamina.talkFollowers.getFeed(accountName).then(function (result) {
            $("#templates").load(_spPageContextInfo.webAbsoluteUrl + "/Scripts/Template/Feed.html", function () {
                var template = document.getElementById("templates").innerHTML;
                var output = Mustache.render(template, result);
                $("#MyFeed").html(output);
            });
        });
    });
}

function showComent(id) {
    $(".respuesta" + id).show();
}

function reponsePost(id,numero) {
    var valor = $("#" + numero).val();
    Encamina.talkFollowers.responsePost(valor, id).then(function() {
        Encamina.talkFollowers.getFeed(accountName).then(function (result) {
            $("#templates").load(_spPageContextInfo.webAbsoluteUrl + "/Scripts/Template/Feed.html", function () {
                var template = document.getElementById("templates").innerHTML;
                var output = Mustache.render(template, result);
                $("#MyFeed").html(output);
            });
        });
    });
}
function getQueryStringParameter(paramToRetrieve) {
    var params =
        document.URL.split("?")[1].split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] === paramToRetrieve) {
            return singleParam[1];
        }
    }
    return '';
}

function remplazar(texto, buscar, nuevo) {
    var temp = '';
    var longText = texto.length;
    for (var j = 0; j < longText; j++) {
        if (texto[j] === buscar) {
            temp += nuevo;
        } else
            temp += texto[j];
    }
    return temp;
}

function distingDate(date) {
    var anyo = date.substr(0, 4);
    var mes = date.substr(5, 2);
    var dia = date.substr(8, 2);
    var hora = date.substr(11, 2);
    var min = date.substr(14, 2);
    var f = new Date(anyo, mes - 1, dia, hora, min);
    var now = new Date();

    var fin = now.getTime() - f.getTime();
    var dias = Math.floor(fin / (1000 * 60 * 60 * 24));
    if (dias === 0) {
        var diferenciahoraria = new Date();
        var difMinutes = diferenciahoraria.getTimezoneOffset();
        var dif = (now - f) / 1000;
        var minutos = Math.floor(dif / 60) + difMinutes;
        if (minutos >= 60) {
            if (minutos >= 60) return Math.floor(minutos / 60) + " horas";
        } else {
            return minutos + " minutos";
        }
    }
    if (dias <= 0 && dias >= 30) {
        var month = dias / 30;
        return month >= 1 || month < 12 ? month + mes : month / 12 + " años";
    }
    return dias + " dias";
}

function marcarHastag(valor) {
    var hastag = tieneHashtag(valor);
    var listHastag = [];

    if (hastag >= 0) {
        listHastag = getHastag(valor);
        for (var i = 0; i < listHastag.length; i++) {
            valor = valor.replace(listHastag[i], "<span class='mention'>" + listHastag[i] + "</span> ");
        }
    }
    return valor;
}


function getHastag(texto) {
    var result = [];
    var i = 0;
    var vStar = texto.indexOf('#');
    var vEnd = texto.length;
    if (vStar < 0 || texto.substring(vStar, texto.length).indexOf(' ') <= 0) {
    } else
        vEnd = texto.substring(vStar, texto.length).indexOf(' ') + vStar;
    while (vStar >= 0) {
        result[i] = texto.substring(vStar, vEnd);
        texto = texto.substring(vEnd, texto.length);
        vStar = texto.indexOf('#');
        vEnd = texto.length;
        if (vStar < 0 || texto.substring(vStar, texto.length).indexOf(' ') <= 0) {
        } else
            vEnd = texto.substring(vStar, texto.length).indexOf(' ') + vStar;
        i++;
    }
    return result;
}

function tieneHashtag(texto) {
    return texto.indexOf('#');
}

