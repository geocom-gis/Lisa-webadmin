import { UserSession } from "@esri/arcgis-rest-auth";

let usePopup = false;
let clientId = null;
let storageKey = "arcgis-user-session";
let triedToLoginKey = "tried-to-login";

export default {
  setClientId(id) {
    clientId = id;
  },
  isAuthenticated() {
    return this.session() !== null;
  },
  token() {
    return (this.session() || {}).token;
  },
  session() {
    try {
      var item = localStorage.getItem(storageKey);
      if (item) {
        let session = UserSession.deserialize(item);
        return session;
      }
    } catch (error) {
      console.warn("Failed to deserialize user session:", error.message);
    }
    return null;
  },
  authenticate(force) {
    if (!force && sessionStorage.getItem(triedToLoginKey)) {
      console.debug(
        "Already tried to login automaticaly. User must login manually."
      );
      return false;
    }
    sessionStorage.setItem(triedToLoginKey, "1");
    let fullPath = window.location.href;
    this.beginOAuth2(fullPath);
    return true;
  },
  logout() {
    localStorage.removeItem(storageKey);
  },
  beginOAuth2(redirectUrl) {
    return UserSession.beginOAuth2({
      popup: usePopup,
      clientId: clientId,
      redirectUri: redirectUrl
    });
  },
  completeOAuth2() {
    var session = UserSession.completeOAuth2({
      clientId: clientId,
      popup: usePopup
    });

    localStorage.setItem(storageKey, session.serialize());
    console.debug("user session:", this.session());
  }
};
