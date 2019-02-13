var NIKKEI_KAIRIRITSU = PropertiesService.getScriptProperties().getProperty("NIKKEI_KAIRIRITSU");
var nikkei_kairiritsu_url = 'http://kabusensor.com/nk/';

function main() {
    const res = request(nikkei_kairiritsu_url);
    const items = getItems(res);
    const target =getTarget(items);
    const rate = getRate(target);
}

function getItems(html) {
    const regexp = /<div class="mtop10 under01">.*?<\/div>/g;
    const itemRegexp = new RegExp(regexp);
    return html.match(itemRegexp);
}

function getTarget(html) {
    var target = '';
    const tags = ['<li class="mleft10">', '</li>'];
    const item = /<li class="mleft10">.*?<\/li>/;
    const regexp = new RegExp(item);
    const length = Object.keys(html).length;

    for (var i = 0; i < length; ++i){
        var itemWithTag = html[i].match(regexp);
        var title = deleteTags(itemWithTag[0], tags);
        if (title === '乖離率(25日)') {
            target = html[i];
        }
    }
    return target;
}

function deleteTags(string, tags) {
    const length = tags.length;
    for (var i = 0; i < length; ++i){
        string = string.replace(tags[i], '');
    }
    return string;
}

function getRate(html) {
    const tags = ['<li class="fs20 fbold mleft20">', '</li>'];
    const item = /<li class="fs20 fbold mleft20">.*?<\/li>/;
    const regexp = new RegExp(item);
    const string = html.match(regexp)[0];
    const rate = deleteTags(string, tags);
    return rate;
}
