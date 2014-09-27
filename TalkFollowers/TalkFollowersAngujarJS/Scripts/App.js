"use strict";

var myApp = angular.module('myApp', []);

function ProfileCtrl($scope, $SharePointJSOMService) {
    $scope.profile = {name:"",imageUrl:""};
    var promise = $SharePointJSOMService.getProfile($scope);
    promise.then(
        function () {
           
        },
        function (reason) {
            alert(reason);
        }
    );   
}

function FeedCtrl($scope, $SharePointJSOMService) {
    $scope.profile = { name: "Adrian", imageUrl: "" };
    $scope.mentions = false;
    $scope.selectedFeed = "selected";
    $scope.selectedMentions = "unselected";
    var promise = $SharePointJSOMService.getProfile($scope);
    promise.then(
        function () {            
            $scope.wall = [];
            promise = $SharePointJSOMService.getFeed($scope);
            promise.then(
                function() {
                  
                },
                function(reason) {
                    alert(reason);
                }
            );
        }
        ,
        function (reason) {
            alert(reason);
        }
    );

    $scope.addPost = function($event) {
        $event.preventDefault();
        var promise = $SharePointJSOMService.addPost($scope);
        promise.then(function () {
         
        }, function (reason) {
            alert(reason);
        });
    };

    $scope.likePost = function(id,$event,partenId) {
        $event.preventDefault();
        var promise = $SharePointJSOMService.likePost(id,$scope,partenId);
        promise.then(function () {

        }, function (reason) {
            alert(reason);
        });
    };
    $scope.showComent = function (id, $event) {
        $event.preventDefault();
        $scope.wall[id].show = true;

        $scope.$apply();
    };

    $scope.reponsePost = function(id, $event) {
        $event.preventDefault();
        var promise = $SharePointJSOMService.responsePost(id, $scope);
        promise.then(function () {

        }, function (reason) {
            alert(reason);
        });
    };
    $scope.ShowMentions = function ($event) {
        $event.preventDefault();
        if ($scope.mentions === false) {
            $scope.selectedFeed = "unselected";
            $scope.selectedMentions = "selected";
            var promise = $SharePointJSOMService.mentions($scope);
            promise.then(function () {

            }, function (reason) {
                alert(reason);
            });
        } else {
            $scope.selectedFeed = "selected";
            $scope.selectedMentions = "unselected";
            var promise = $SharePointJSOMService.getFeed($scope);
            promise.then(function () {

            }, function (reason) {
                alert(reason);
            });
        }
        $scope.mentions = !$scope.mentions;
    };
}

myApp.service('$SharePointJSOMService', function ($q, $http) {
    this.getProfile = function($scope) {
        var deferred = $q.defer();
       var  appweburl =
     decodeURIComponent(
         getQueryStringParameter("SPAppWebUrl")
 );

        $.ajax(
       {
           url: appweburl + "/_api/social.feed/my",
           method: "GET",
           headers: { "Accept": "application/json; odata=verbose" },
           success: function (data) {

               var image="" ;
               if (data.d.Me.ImageUri !== null) {
                   image = remplazar(data.d.Me.ImageUri, ' ', '%20');
               }
               
               var name = data.d.Me.Name;
               var blankiframe;
               var body;
               blankiframe = document.createElement("iframe");
               blankiframe.setAttribute("src", image);
               blankiframe.setAttribute("style", "display: none");
               body = document.getElementsByTagName("body");
               body[0].appendChild(blankiframe);
               $scope.profile.name = name;
               $scope.profile.imageUrl = image;
               $scope.profile.accountName = data.d.Me.AccountName;               
               $scope.$apply();
               deferred.resolve();
                          
           },
           error: function (sender,args) {
               deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
           }
       }
   );
        return deferred.promise;
    };

    this.getFeed = function ($scope) {
        var nameUser = $scope.profile.accountName;
        var deferred = $q.defer();
        var appweburl =
      decodeURIComponent(
          getQueryStringParameter("SPAppWebUrl")
        );
        nameUser = remplazar(nameUser, '#', '%23');
        var feedManagerEndpoint = appweburl + "/_api/social.feed";
        $.ajax({
            url: feedManagerEndpoint + "/actor(item=@v)/Feed(MaxThreadCount=10,SortOrder=1)?@v='" + nameUser + "'",
            headers: {
                "accept": "application/json;odata=verbose"
            },
            success: function(data) {
                var stringData = JSON.stringify(data);
                var jsonObject = JSON.parse(stringData);
                var feed = jsonObject.d.SocialFeed.Threads;
                var threads = feed.results;
                $scope.wall = [];
                for (var i = 0; i < threads.length; i++) {
                    var thread = threads[i];
                    var participants = thread.Actors;
                    var tags = [];
                    var j = 0;
                    for (var ii = 0; ii < participants.results.length; ii++) {
                        var type = participants.results[ii];
                        if (type.ActorType === 3) {
                            tags[j] = type.Name.replace("#", "");
                            j++;
                        }
                    }                   
                    var owner = participants.results[thread.OwnerIndex].Name;
                    var imageUri = participants.results[thread.OwnerIndex].ImageUri;
                    var totalCount = 0;
                    var id = thread.Id;
                    if (thread.RootPost.LikerInfo !== null) {                        
                        if (thread.RootPost.LikerInfo.TotalCount !== null) {
                            totalCount = thread.RootPost.LikerInfo.TotalCount;
                        }                                               
                    }
                    var like = "Me gusta";
                    if (thread.RootPost.LikerInfo.IncludesCurrentUser === true) {
                        like = "No me gusta";
                    }
                    var responseThread = [];
                    for (var cont = 0; cont < thread.Replies.results.length; cont++) {

                        var response = thread.Replies.results[cont].Text;
                        var likeResponse = "Me gusta";
                        if (thread.Replies.results[cont].LikerInfo.IncludesCurrentUser === true) {
                            likeResponse = "No me gusta";
                        }
                        var timeResponse = distingDate(thread.Replies.results[cont].CreatedTime);
                        var totalCountResponse = thread.Replies.results[cont].LikerInfo.TotalCount;
                        var item = {
                            id: thread.Replies.results[cont].Id,
                            text: response,
                            name: participants.results[thread.Replies.results[cont].AuthorIndex].Name,
                            imageUriResponse: participants.results[thread.Replies.results[cont].AuthorIndex].ImageUri,
                            like: likeResponse,
                            time: timeResponse,
                            totalCount:totalCountResponse
                        };
                        responseThread.unshift(item);
                    }
                    var time = distingDate(thread.RootPost.CreatedTime);
                    $scope.wall.push(
                        {
                            id: id,
                            imageUri: imageUri,
                            owner: owner,
                            text: thread.RootPost.Text,
                            totalCount: totalCount,
                            time: time,
                            like: like,
                            tags: tags,
                            respuesta: responseThread,
                            show:false
                            
                        });
                    $scope.$apply();
                }
                deferred.resolve();
            }
             ,
            error: function (sender,args) {
               deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
            }
        });
        return deferred.promise;
    };

    this.addPost = function($scope) {
        var deferred = $q.defer();

        if ($scope.statusText === "" || $scope.statusText===undefined) {
            deferred.reject('Introduce el titulo');
            return deferred.promise;
        }
        var valor = $scope.statusText;
        var hastag = tieneHashtag(valor);
        var listHastag = [];
        if (hastag >= 0) {

            listHastag = getHastag(valor);
            for (var i = 0; i < listHastag.length; i++) {
                valor = valor.replace(listHastag[i], "{" + i + "}");
            }
        }
        var name = $scope.profile.name;
        name = remplazar(name, '#', '%23');
        var appweburl =decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
            
            var feedManagerEndpoint = appweburl + "/_api/social.feed";
            var dataPost = {
                'restCreationData': {
                    '__metadata': {
                        'type': 'SP.Social.SocialRestPostCreationData'
                    },
                    'ID': null,
                    'creationData': {
                        '__metadata': {
                            'type': 'SP.Social.SocialPostCreationData'
                        },
                        'ContentText': valor,
                        'UpdateStatusText': false
                    }
                }
            };
            if (hastag >= 0) {
                var result = [];
                for (var val = 0; val < listHastag.length; val++) {
                    result[val] = {
                        '__metadata': {
                            'type': 'SP.Social.SocialDataItem'
                        },
                        'Text': listHastag[val],
                        'ItemType': 3,
                    };
                }
                dataPost = {
                    'restCreationData': {
                        '__metadata': {
                            'type': 'SP.Social.SocialRestPostCreationData'
                        },
                        'ID': null,
                        'creationData': {
                            '__metadata': {
                                'type': 'SP.Social.SocialPostCreationData'
                            }, 'ContentItems': {
                                'results':
                                        result
                            },
                            'ContentText': valor,
                            'UpdateStatusText': false
                        }
                    }
                };
            }
            $.ajax({
                url: feedManagerEndpoint + "/actor(item=@v)/Feed/Post?@v='" + name + "'",
                type: "POST",
                data: JSON.stringify(dataPost),
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function (data) {                    
                    var threads = data.d.SocialThread;
                   
                        var thread = threads;
                        var participants = thread.Actors;
                        var tags = [];
                        var j = 0;
                        for (var ii = 0; ii < participants.results.length; ii++) {
                            var type = participants.results[ii];
                            if (type.ActorType === 3) {
                                tags[j] = type.Name.replace("#", "");
                                j++;
                            }
                        }
                        var owner = participants.results[thread.OwnerIndex].Name;
                        var imageUri = participants.results[thread.OwnerIndex].ImageUri;
                        var totalCount = 0;
                        var id = thread.Id;
                        if (thread.RootPost.LikerInfo !== null) {
                            if (thread.RootPost.LikerInfo.TotalCount !== null) {
                                totalCount = thread.RootPost.LikerInfo.TotalCount;
                            }
                        }
                        var like = "Me gusta";
                        if (thread.RootPost.LikerInfo.IncludesCurrentUser === true) {
                            like = "No me gusta";
                        }
                        var responseThread = [];
                        var time = distingDate(thread.RootPost.CreatedTime);
                        
                        $scope.$apply(function() {
                            $scope.wall.unshift(
                                                    {
                                                        id: id,
                                                        imageUri: imageUri,
                                                        owner: owner,
                                                        text: thread.RootPost.Text,
                                                        totalCount: totalCount,
                                                        time: time,
                                                        like: like,
                                                        tags: tags,
                                                        respuesta: responseThread

                                                    });
                        });
                        
                    
                    $scope.statusText = "";
                    deferred.resolve();
                },
                error: function (sender, args) {
                    deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                   
                }
            });
        
                            
        
        return deferred.promise;

    };

    this.likePost = function (id, $scope,parentId) {
        var deferred = $q.defer();
        var appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
        var feedManagerEndpoint = appweburl + "/_api/social.feed";
        var url = "Like";
        var idPost = $scope.wall[id].id;
        var like = $scope.wall[id].like;
        if (parentId !== undefined) {
            idPost = $scope.wall[parentId].respuesta[id].id;
            like = $scope.wall[parentId].respuesta[id].like;
        }
        if (like !== "Me gusta") {
            url = "Unlike";
        }
        $.ajax({
            url: feedManagerEndpoint + "/Post/"+url,
            type: "POST",
            data: JSON.stringify({
                "ID": idPost
            })
                    ,
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function () {
                if (parentId === undefined) {
                    if ($scope.wall[id].like === "Me gusta") {
                        $scope.wall[id].totalCount += 1;
                        $scope.wall[id].like = "No me gusta";
                    } else {
                        $scope.wall[id].totalCount -= 1;
                        $scope.wall[id].like = "Me gusta";
                    }
                } else {
                    if ($scope.wall[parentId].respuesta[id].like === "Me gusta") {
                        $scope.wall[parentId].respuesta[id].totalCount += 1;
                        $scope.wall[parentId].respuesta[id].like = "No me gusta";
                    } else {
                        $scope.wall[parentId].respuesta[id].totalCount -= 1;
                        $scope.wall[parentId].respuesta[id].like = "Me gusta";
                    }
                }
                $scope.$apply();
                deferred.resolve();
            },
            error: function (sender, args) {
                deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());                   
            }
        });
        return deferred.promise;
    };

    this.responsePost = function (index, $scope) {
        var deferred = $q.defer();

        if ($scope.wall[index].responseText === "" || $scope.wall[index].responseText === undefined) {
            deferred.reject('Introduce la respuesta');
            return deferred.promise;
        }
        var valor = $scope.wall[index].responseText;
        var appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
        var feedManagerEndpoint = appweburl + "/_api/social.feed";

        var hastag = tieneHashtag(valor);
        var listHastag = [];

        if (hastag >= 0) {
            listHastag = getHastag(valor);
            for (var i = 0; i < listHastag.length; i++) {
                valor = valor.replace(listHastag[i], "{" + i + "}");
            }
        }

        var dataPost = {
            'restCreationData': {
                '__metadata': {
                    'type': 'SP.Social.SocialRestPostCreationData'
                },
                'ID': $scope.wall[index].id,
                'creationData': {
                    '__metadata': {
                        'type': 'SP.Social.SocialPostCreationData'
                    },

                    'ContentText': valor,
                    'UpdateStatusText': false
                }
            }
        };
        if (hastag >= 0) {
            var result = [];
            for (var val = 0; val < listHastag.length; val++) {
                result[val] = {
                    '__metadata': {
                        'type': 'SP.Social.SocialDataItem'
                    },
                    'Text': listHastag[val],
                    'ItemType': 3,
                };
            }
            dataPost = {
                'restCreationData': {
                    '__metadata': {
                        'type': 'SP.Social.SocialRestPostCreationData'
                    },
                    'ID': $scope.wall[index].id,
                    'creationData': {
                        '__metadata': {
                            'type': 'SP.Social.SocialPostCreationData'
                        }, 'ContentItems': {
                            'results':
                                    result
                        },
                        'ContentText': valor,
                        'UpdateStatusText': false
                    }
                }
            };
        }

        $.ajax({
            url: feedManagerEndpoint + "/Post/Reply",
            type: "POST",
            data: JSON.stringify(dataPost),
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success:function(value) {
                var stringData = JSON.stringify(value);
                var jsonObject = JSON.parse(stringData);
                var thread = jsonObject.d.SocialThread;
                
               
                    var participants = thread.Actors;
                    var tags = [];
                    var j = 0;
                    for (var ii = 0; ii < participants.results.length; ii++) {
                        var type = participants.results[ii];
                        if (type.ActorType === 3) {
                            tags[j] = type.Name.replace("#", "");
                            j++;
                        }
                    }
                   
                                       
                    var responseThread = [];
                    for (var cont = 0; cont < thread.Replies.results.length; cont++) {

                        var response = thread.Replies.results[cont].Text;
                        var likeResponse = "Me gusta";
                        if (thread.Replies.results[cont].LikerInfo.IncludesCurrentUser === true) {
                            likeResponse = "No me gusta";
                        }
                        var timeResponse = distingDate(thread.Replies.results[cont].CreatedTime);
                        var totalCountResponse = thread.Replies.results[cont].LikerInfo.TotalCount;
                        var item = {
                            id: thread.Replies.results[cont].Id,
                            text: response,
                            name: participants.results[thread.Replies.results[cont].AuthorIndex].Name,
                            imageUriResponse: participants.results[thread.Replies.results[cont].AuthorIndex].ImageUri,
                            like: likeResponse,
                            time: timeResponse,
                            totalCount: totalCountResponse
                        };
                        responseThread.unshift(item);
                    }                    
                    $scope.wall[index].respuesta = responseThread;
                $scope.wall[index].responseText = "";
                    $scope.$apply();
                
            }                
            ,
            error: function (sender, args) {
                deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());

            }
        });
        return deferred.promise;
    };

    this.mentions = function($scope) {
        var deferred = $q.defer();
        var appweburl =decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
        var feedManagerEndpoint = appweburl + "/_api/social.feed";
        $.ajax({
            url: feedManagerEndpoint + "/my/mentionfeed/clearunreadmentioncount(MaxThreadCount=10,SortOrder=1)",
            type: "POST",
            data: JSON.stringify({
                'feedOptions': {
                    '__metadata': {
                        'type': 'SP.Social.SocialFeedOptions'
                    },
                },
            }),
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                var stringData = JSON.stringify(data);
                var jsonObject = JSON.parse(stringData);

                var feed = jsonObject.d.SocialFeed.Threads;
                var threads = feed.results;

                $scope.wall = [];
                for (var i = 0; i < threads.length; i++) {
                    var thread = threads[i];
                    var participants = thread.Actors;
                    var owner = participants.results[thread.RootPost.AuthorIndex].Name;
                    var imageUri = participants.results[thread.RootPost.AuthorIndex].ImageUri;
                                                      
                    var time = distingDate(thread.PostReference.Post.CreatedTime);
                    $scope.wall.push(
                       {
                           id: thread.Id,
                           imageUri: imageUri,
                           owner: owner,
                           text: thread.PostReference.Post.Text,
                           time: time,                                                    
                           show: false

                       });
                    $scope.$apply();

                }
                deferred.resolve();
            },
            error: function (sender, args) {
                deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
            }
        });
        return deferred.promise;
    };
});

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