var crypto = require('crypto');
function getAuthorization() {
    let ExampleKeyTime = `${Math.floor(new Date().getTime() / 1000)};${Math.floor(new Date().getTime() / 1000) + 5 * 60}`;
    let signKey = crypto.createHmac('sha1', 'YourSecretKey').update(ExampleKeyTime).digest('hex');
    let UrlParamList = '';
    let HttpParameters = ''
    let HeaderList = 'date;host;x-cos-acl;x-cos-grant-read'
    let HttpHeaders = 'date=Thu%2C%2016%20May%202019%2003%3A15%3A06%20GMT&host=examplebucket-1250000000.cos.ap-shanghai.myqcloud.com&x-cos-acl=private&x-cos-grant-read=uin%3D%22100000000011%22';
    let ExampleHttpString = `${HttpMethod}\n${UriPathname}\n${HttpParameters}\n${HttpHeaders}\n`
    var sha1HttpString = crypto.createHash('sha1').update(ExampleHttpString).digest('hex');
    let Signature = crypto.createHmac('sha1', signKey).update(sha1HttpString).digest('hex');
    let Authorization = `q-sign-algorithm=sha1&q-ak=...&q-sign-time=1557989753;1557996953&...&q-signature=${Signature}`
}
