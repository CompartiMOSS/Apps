var Encamina = Encamina || {};

Encamina.talkFollowers = function() {
    var talkFollowers = {
        
        getProfile: function() {
            var deferred = new $.Deferred();
            var appweburl =decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));

            $.ajax(
           {
               url: appweburl + "/_api/social.feed/my",
               method: "GET",
               headers: { "Accept": "application/json; odata=verbose" },
               success: function (data) {

                   var image = "";
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
                   var profile = {};
                   profile.name = name;
                   profile.imageUrl = image;
                   profile.accountName = data.d.Me.AccountName;                   
                   deferred.resolve(profile);

               },
               error: function (sender, args) {
                   deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
               }
           }
       );
            return deferred.promise();
        },

        getFeed: function(profile) {
            var nameUser = profile;
            var deferred = new $.Deferred();
            var appweburl =decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
            nameUser = remplazar(nameUser, '#', '%23');
            var feedManagerEndpoint = appweburl + "/_api/social.feed";
            $.ajax({
                url: feedManagerEndpoint + "/actor(item=@v)/Feed(MaxThreadCount=10,SortOrder=1)?@v='" + nameUser + "'",
                headers: {
                    "accept": "application/json;odata=verbose"
                },
                success: function (result) {
                    var stringData = JSON.stringify(result);
                    var jsonObject = JSON.parse(stringData);
                    var feed = jsonObject.d.SocialFeed.Threads;
                    var threads = feed.results;
                    var wall = [];
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
                                totalCount: totalCountResponse
                            };
                            responseThread.unshift(item);
                        }
                        var time = distingDate(thread.RootPost.CreatedTime);
                        wall.push(
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
                                show: false,
                                numero:i

                            });
                      
                    }
                    var resultado = {
                        wall: wall
                    };
                    deferred.resolve(resultado);
                }
                 ,
                error: function (sender, args) {
                    deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                }
            });
            return deferred.promise();
        },

        addPost: function (valor, name) {
            var deferred = new $.Deferred();
            var hastag = tieneHashtag(valor);
            var listHastag = [];
            if (hastag >= 0) {

                listHastag = getHastag(valor);
                for (var i = 0; i < listHastag.length; i++) {
                    valor = valor.replace(listHastag[i], "{" + i + "}");
                }
            }            
            name = remplazar(name, '#', '%23');
            var appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));

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
                    deferred.resolve();
                },
                error: function (sender, args) {
                    deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());

                }
            });
            return deferred.promise();
        },
        likePost: function (idPost,like) {
            var deferred = new $.Deferred();
            var appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
            var feedManagerEndpoint = appweburl + "/_api/social.feed";
            var url = "Like";
                        
            if (like !== "Me gusta") {
                url = "Unlike";
            }
            $.ajax({
                url: feedManagerEndpoint + "/Post/" + url,
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
                
                    deferred.resolve();
                },
                error: function (sender, args) {
                    deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                }
            });
            return deferred.promise();
            
        },
        responsePost: function (valor,id) {
            var deferred = new $.Deferred();

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
                    'ID': id,
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
                        'ID': id,
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
                success: function (value) {
                    deferred.resolve();
                }
                ,
                error: function (sender, args) {
                    deferred.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());

                }
            });
            return deferred.promise();
            
        },
        mentions:function() {
            
        }

    
    };
    return talkFollowers;
}();