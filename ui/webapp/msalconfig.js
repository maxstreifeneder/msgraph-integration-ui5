/* eslint-disable sap-no-global-define */
/* eslint-disable sap-no-hardcoded-url */

window.msalconfig = {
    clientID: "59140526-7c63-4d3c-b507-cfe065ef2f99",
    redirectUri: location.origin + '/ui/',
    graphBaseEndpoint: "https://graph.microsoft.com/1.0/",
    userInfoSuffix: "me/",
    queryMessagesSuffix: "me/messages?$search=\"$1\"&$top=150",
    graphAPIScopes: ['User.Read', 'Mail.Read']
};
