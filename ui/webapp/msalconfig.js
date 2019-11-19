/* eslint-disable sap-no-global-define */
/* eslint-disable sap-no-hardcoded-url */

window.msalconfig = {
    clientID: "78f9cbee-7f4a-46b6-a066-859ffbe00094",
    redirectUri: location.origin + '/ui/',
    graphBaseEndpoint: "https://graph.microsoft.com/beta/",
    userInfoSuffix: "me/",
    queryMessagesSuffix: "me/messages?$search=\"$1\"&$top=150",
    graphAPIScopes: ['User.Read', 'Mail.Read']
};
