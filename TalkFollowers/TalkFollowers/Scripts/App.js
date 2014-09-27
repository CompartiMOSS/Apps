'use strict';

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();

// Este código se ejecuta cuando el DOM está preparado y crea un objeto de contexto necesario para poder usar el modelo de objetos de SharePoint
$(document).ready(function () {
    getUserName();
});

// Esta función prepara, carga y ejecuta una consulta de SharePoint para obtener información del usuario actual
function getUserName() {
    context.load(user);
    context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
}

// Esta función se ejecuta si la llamada anterior se realiza correctamente
// Reemplaza el contenido del elemento 'message' con el nombre de usuario
function onGetUserNameSuccess() {
    $('#message').text('Hello ' + user.get_title());
}

// Esta función se ejecuta si se produce un error en la llamada anterior
function onGetUserNameFail(sender, args) {
    alert('Failed to get user name. Error:' + args.get_message());
}
