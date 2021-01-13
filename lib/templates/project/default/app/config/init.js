
//
//  register default variables
//
CurlyBracketParser.registerDefaultVar('host', () => {
    return SipaUrl.hostName();
});
CurlyBracketParser.registerDefaultVar('protocol', () => {
    return SipaUrl.protocol();
});