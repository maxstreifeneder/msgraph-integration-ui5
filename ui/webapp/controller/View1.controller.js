/* global msalconfig, Msal */
sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/model/json/JSONModel"],
	function (Controller, MessageToast, JSONModel) {
		"use strict";

		return Controller.extend("con.sap.ui.controller.View1", {
			onInit: function () {
				this.oUserAgentApplication = new Msal.UserAgentApplication(msalconfig.clientID, null,
					function (errorDesc, token, error, tokenType) {
						if (errorDesc) {
							var formattedError = JSON.stringify(error, null, 4);
							if (formattedError.length < 3) {
								formattedError = error;
							}
							MessageToast.show("Error, please check the $.sap.log for details");
							$.sap.log.error(error);
							$.sap.log.error(errorDesc);
						} else {
							this.fetchUserInfo();
						}
					}.bind(this), {
						redirectUri: msalconfig.redirectUri
					});
				//Previous version of msal uses redirect url via a property
				if (this.oUserAgentApplication.redirectUri) {
					this.oUserAgentApplication.redirectUri = msalconfig.redirectUri;
				}
				// If page is refreshed, continue to display user info
				if (!this.oUserAgentApplication.isCallback(window.location.hash) && window.parent === window && !window.opener) {
					var user = this.oUserAgentApplication.getUser();
					if (user) {
						this.fetchUserInfo();
					}
				}
			},
			onSwitchSession: function (oEvent) {
				var oSessionModel = oEvent.getSource().getModel('session');
				var bIsLoggedIn = oSessionModel.getProperty('/displayName');
				if (bIsLoggedIn) {
					this.oUserAgentApplication.logout();
					return;
				}
				this.fetchUserInfo();
			},

			fetchUserInfo: function () {
				this.callGraphApi(msalconfig.graphBaseEndpoint + msalconfig.userInfoSuffix, function (response) {
					$.sap.log.info("Logged in successfully!", response);
					this.getView().getModel('session').setData(response);
				}.bind(this));
			},
			callGraphApi: function (sEndpoint, fnCb) {
				var user = this.oUserAgentApplication.getUser();
				if (!user) {
					this.oUserAgentApplication.loginRedirect(msalconfig.graphAPIScopes);
				} else {
					this.oUserAgentApplication.acquireTokenSilent(msalconfig.graphAPIScopes)
						.then(function (token) {
								$.ajax({
										url: sEndpoint,
										type: "GET",
										beforeSend: function (xhr) {
											xhr.setRequestHeader("Authorization", "Bearer " + token);
										}
									})
									.then(fnCb)
									.fail(function (error) {
										MessageToast.show("Error, please check the log for details");
										$.sap.log.error(JSON.stringify(error.responseJSON.error));
									});
							}.bind(this),
							function (error) {
								if (error) {
									this.oUserAgentApplication.acquireTokenRedirect(msalconfig.graphAPIScopes);
								}
							}.bind(this));
				}
			},

			onPressLink: function (oEvent) {
				var sLinkText = oEvent.getSource().getText();
				var oApp = this.getView().getContent()[0];
				this.callGraphApi(msalconfig.graphBaseEndpoint + msalconfig.queryMessagesSuffix.replace("$1", sLinkText), function (results) {
					results.value = results.value.map(function (o) {
						o.bodyPreview = o.bodyPreview.replace(sLinkText, '<strong>' + sLinkText + '</strong>');
						return o;
					});
					var oResultsPage = oApp.getPages()[2].setModel(new JSONModel(results), 'msData');
					oApp.to(oResultsPage.getId());
				});
			},

			onOpenEmail: function (oEvent) {
				var sEmail = oEvent.getSource().getBindingContext('msData').getProperty('webLink');
				window.open(sEmail, '_blank');
			},
			onProductClick: function (oEvent) {
				var oApp = this.getView().getContent()[0];
				var sBindingPath = oEvent.getSource().getBindingContext().getPath();
				var oDetailsPage = oApp.getPages()[1].bindElement(sBindingPath);
				oApp.to(oDetailsPage.getId());
			},

			onNavButtonPress: function (oEvent) {
				var oApp = this.getView().getContent()[0];
				var oStartPage = oApp.getPages()[0];
				oApp.back(oStartPage.getId());
			},
		});
	});