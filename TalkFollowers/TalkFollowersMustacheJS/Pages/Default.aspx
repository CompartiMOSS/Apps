<%-- Las 4 líneas siguientes son directivas ASP.NET necesarias cuando se usan componentes de SharePoint --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- El marcado y el script del elemento Content siguiente se pondrán en el elemento <head> de la página --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    
t>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.UserProfiles.js"></script>

    <meta name="WebPartPageExpansion" content="full" />

    <!-- Agregue sus estilos CSS al siguiente archivo -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Agregue el código JavaScript al siguiente archivo -->
    <script type="text/javascript" src="../Scripts/mustache.js"></script>
    <script type="text/javascript" src="../Scripts/talkFollowers.js"></script>
    <script type="text/javascript" src="../Scripts/App.js"></script>
</asp:Content>

<%-- El marcado del elemento Content siguiente se pondrá en el elemento TitleArea de la página --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
   MustacheJS
</asp:Content>

<%-- El marcado y el script del elemento Content siguiente se pondrán en el elemento <body> de la página --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <div id="templates" style="display: none;" ></div>
      <div class="izquierda">
              
    </div>

    <div class="centro">
        <!-- Ponemos el link de Actualizar estado  -->
        <div id="iconosCentro">
            <img id="imageCentral" src="../Images/homeSprite.png" />
        </div>
    <div id="Status">
        <div class="txtStatus">
            <textarea id="post" style="width:465px" rows="3" cols="60" class="k-textbox" placeholder="What are you working on?" onFocus="MostarNotify()" onblur="OcultarNotify()"></textarea>                 
        </div>

        
        <div class="btnUpdate">
            <input id="btnPost" type="button" onclick="postToMyFeed();" value="Update" />            
        </div>
        <div id="menuSelected" class="Menu">
            <h2>
            <a id="feedMy" href="#" class="feed selected" onclick="RestartFeed();">Feed</a>  <a id="mentionsmy" href="#" class="mentions unselected" onclick="Mentions();"> Mentions</a>
            </h2>
        </div>
         <div id="MyFeed">
        


    </div>
   
    </div>
    </div>
    <div class="derecha">
        <div id="followers" class="divCompartiMOSSFollow">
       

        </div>
        <div id="followed" class="divCompartiMOSSFollow">

        </div>
    </div>


</asp:Content>
