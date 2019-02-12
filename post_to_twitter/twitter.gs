// project key: 1CXDCY5sqT9ph64fFwSzVtXnbjpSfWdRymafDrtIZ7Z_hwysTY7IIhi7s
var CONSUMER_KEY = PropertiesService.getScriptProperties().getProperty("CONSUMER_KEY");
var CONSUMER_SECRET = PropertiesService.getScriptProperties().getProperty("CONSUMER_SECRET");

/**
 * Authorizes and makes a request to the Twitter API.
 */
function postTweet(tweet) {
    var service = getService();
    if (service.hasAccess()) {
        var url = 'https://api.twitter.com/1.1/statuses/update.json';
        var payload = {
            status: tweet
        };
        var response = service.fetch(url, {
            method: 'post',
            payload: payload
        });
        var result = JSON.parse(response.getContentText());
        Logger.log(JSON.stringify(result, null, 2));
    } else {
        var authorizationUrl = service.authorize();
        Logger.log('Open the following URL and re-run the script: %s',
            authorizationUrl);
    }
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
    var service = getService();
    service.reset();
}

/**
 * Configures the service.
 */
function getService() {
    return OAuth1.createService('Twitter')
    // Set the endpoint URLs.
        .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
        .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
        .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')

        // Set the consumer key and secret.
        .setConsumerKey(CONSUMER_KEY)
        .setConsumerSecret(CONSUMER_SECRET)

        // Set the name of the callback function in the script referenced
        // above that should be invoked to complete the OAuth flow.
        .setCallbackFunction('authCallback')

        // Set the property store where authorized tokens should be persisted.
        .setPropertyStore(PropertiesService.getUserProperties());
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
    var service = getService();
    var authorized = service.handleCallback(request);
    if (authorized) {
        return HtmlService.createHtmlOutput('Success!');
    } else {
        return HtmlService.createHtmlOutput('Denied');
    }
}