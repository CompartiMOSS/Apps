<%-- Las 4 líneas siguientes son directivas ASP.NET necesarias cuando se usan componentes de SharePoint --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- El marcado y el script del elemento Content siguiente se pondrán en el elemento <head> de la página --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="../Scripts/angular.min.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Agregue sus estilos CSS al siguiente archivo -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Agregue el código JavaScript al siguiente archivo -->
    <script type="text/javascript" src="../Scripts/App.js"></script>
</asp:Content>

<%-- El marcado del elemento Content siguiente se pondrá en el elemento TitleArea de la página --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Talk Follower con Angular
</asp:Content>

<%-- El marcado y el script del elemento Content siguiente se pondrán en el elemento <body> de la página --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div id="main" ng-app="myApp">
        <div class="izquierda">
            <div id="divPartnerf" class="divCompartiMOSSAuthor" ng-controller="ProfileCtrl">
                <div id="imagen" class="divPicture">
                     <img class="image" src="{{profile.imageUrl}}" title="" />
                </div>
                <div id="name" class="divOverlay">
                    <a href="#"><h2 class="ms-noWrap">{{profile.name}}</h2></a>
                </div>
            </div>   
            <div id="optionsiz" class="options" >
                <a href="#" > <img src="../Images/Home.PNG" alt="Home"   />  <strong>  Home</strong></a>
            </div>             
        </div>
         
    <div class="centro">        
        <div id="iconosCentro">
            <img id="imageCentral" src="../Images/homeSprite.png" alt="Home" />
        </div>
    <div id="Status" ng-controller="FeedCtrl">
        <div class="txtStatus">                     
            <textarea id="post"  ng-model="statusText"  style="width:465px" rows="3" cols="60" class="k-textbox" placeholder="What are you working on?" ></textarea>                                           
        <div class="btnUpdate">                
            <input id="btnPost" type="submit"  ng-click="addPost($event)"  value="Update" />                    
        </div>
        <div id="menuSelected" class="Menu">
            <h2>       
                   <a id="feedMy" href="#" class="feed {{selectedFeed}}" ng-click="ShowMentions($event)" >Feed</a>  <a id="mentionsmy" href="#" class="mentions {{selectedMentions}}" ng-click="ShowMentions($event)" > Mentions</a>
            </h2>
        </div>
        <div  ng-repeat="post in wall">
            <div class='MyFeed'>        
                <div class='contestacion'>
                    <div class='imagen'><img width='72px' height='72px' src='{{post.imageUri}}' alt="Imagen Feed"/> </div>
                        <div class='todo'>
                            <div class='Nombre'><strong>{{post.owner}}</strong></div>
                            <div class='texto'>{{post.text}}</div> 
                            <div class='like'><img src="../Images/MeGusta.jpg" width="15px" height="15px" alt=""/>{{post.totalCount}}</div>
                            <div class="opciones">
                                <a href="#" ng-click="likePost($index,$event);"> {{post.like}}</a> 
                                <a href="#" ng-click="showComent($index,$event);" > Comentar </a> {{post.time}}  
                                 
                                <%-- <a href="#"  onclick="CreateResponse('{{post.id}}')"> Comentar </a> {{post.time}}  --%>
                             </div>
                            <div id='divArticleTags' ng-repeat="tag in post.tags">
                             <span> {{tag}} </span>
                             </div>      
                        </div>
                          <div ng-repeat="respuesta in post.respuesta">
                            <div class="respuesta">
                                <div class="imagen"><img width="72px" alt=""  height="72px" src="{{respuesta.imageUriResponse}}"/> </div>
                                 <div class="todo">
                                 <div class="Nombre">{{respuesta.name}} </div>
                                  <div class="texto">{{respuesta.text}}</div>
                                      <div class='like'><img src="../Images/MeGusta.jpg" width="15px" height="15px" alt=""/>{{respuesta.totalCount}}</div>
                                    <div class="opciones">
                                        <%-- <a href="#" onclick="Like('{{respuesta.id}}','{{respuesta.like}}');"> {{respuesta.like}}</a> 
                                         <a href="#"  onclick="CreateResponse('{{respuesta.id}}')"> Comentar </a> {{respuesta.time}}  --%>
                                         <a href="#" ng-click="likePost($index,$event,$parent.$index);"> {{respuesta.like}}</a> 
                                         <a href="#" ng-click="showComent($index,$event);" > Comentar </a> {{respuesta.time}}  
                                     </div>
                                 </div>
                            </div> 
                    </div>
                </div>
                <div class="respuesta" ng-show='post.show'>
                    <div class="imagen"><img  width="72px"  height="72px" src='{{post.imageUri}}' alt=""> </div>
                    <div class="todo">
                         <textarea style="width:340px" ng-model="post.responseText"  rows="2" cols="40" class="k-textbox" placeholder='Contestacion'></textarea>
                         <div class="btnResponse"><input type="button"  ng-click="reponsePost($index,$event)" value="Responder" /></div>
                    </div>
                </div>
            </div>
         </div>
         
        
    </div>
   
    </div>
    </div>
    <div class="derecha">
        <div id="followers" class="divCompartiMOSSFollow">
       

        </div>
        <div id="followed" class="divCompartiMOSSFollow">

        </div>
    </div>
    </div>

</asp:Content>
