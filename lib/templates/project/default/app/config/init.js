/**
 *
 * This is your initialization file to run the app
 *
 */


//
//  register default variables
//
CurlyBracketParser.registerDefaultVar('host', () => {
    return SipaUrl.hostName();
});
CurlyBracketParser.registerDefaultVar('protocol', () => {
    return SipaUrl.protocol();
});
// so you are able to do: CurlyBracketParser.parse('{{protocol}}:{{host}}/api/my-service')

//
// load initial page
//
SipaPage.load('home');