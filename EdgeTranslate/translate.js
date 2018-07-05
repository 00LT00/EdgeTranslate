/**
 * 翻译接口。
 */
const BASE_URL = "https://translate.google.cn/translate_a/single?client=gtx";

/**
 * 菜单点击事件监听器。
 * 
 * @param {*} info 事件信息
 * @param {*} tabs 菜单栏点击位置的具体信息，是一个tab对象 
 */
function onClickHandler(info, tabs) {
    var text = info.selectionText;

    // 获取翻译语言设定。
    chrome.storage.sync.get("languageSetting", function (result) {
        var languageSetting = result.languageSetting;
        var tmpUrl = BASE_URL + "&sl=" + languageSetting.sl + "&tl=" + languageSetting.tl;

        // 获取翻译参数设定。
        chrome.storage.sync.get("DTSetting", function (result) {
            var url = tmpUrl;
            var DTSetting = result.DTSetting;
            var request = new XMLHttpRequest();

            DTSetting.forEach(element => {
                url = url + "&dt=" + element;
            });

            request.open("GET", url + "&q=" + text, true);
            request.send();
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    parseTranslate(JSON.parse(request.response));
                }
                else if (request.status !== 200) {
                    alert('无法请求翻译，请检查网络连接');
                }
            }
        });
    });
};

/**
 * 解析谷歌翻译返回的结果。
 * 
 * @param {Object} response 谷歌翻译返回的结果。
 */
function parseTranslate(response) {
    var result = new Object();
    for (i = 0; i < response.length; i++) {
        if (response[i]) {
            var items = response[i];
            switch (i) {
                // 单词的基本意思
                case 0:
                    result.mainMeaning = items[0];
                    result.originalText = items[1];
                    // console.log("text: " + result.originalText + "\nmeaning: " + result.mainMeaning);
                    break;
                // 单词的所有词性及对应的意思
                case 1:
                    result.detailedMeanings = new Array();
                    items.forEach(item =>
                        result.detailedMeanings.push({ "type": item[0], "meaning": item[1].join(", ") })
                    );
                    // console.log("detailedMeanings: " + JSON.stringify(result.detailedMeanings));
                    break;
                // 单词或句子的常见意思（单词的常见意思，句子的所有可能意思）
                case 5:
                    let meaningArray = new Array();
                    items[0][2].forEach(item =>
                        meaningArray.push(item[0])
                    );
                    result.commonMeanings = meaningArray.join(", ");
                    // console.log("commonMeanings: " + result.commonMeanings);
                    break;
                // 单词的同义词，根据词性分组
                case 11:
                    result.synonyms = new Array();
                    items.forEach(item => {
                        let element = new Object();
                        element.type = item[0];
                        element.words = new Array();
                        item[1].forEach(words => element.words.push(words[0]));
                        result.synonyms.push(element);
                    });
                    console.log("synonyms: " + JSON.stringify(result.synonyms));
                    break;
                // 单词的定义及对应例子
                case 12:
                    result.definitions = new Array();
                    items.forEach(item => {
                        let definition = new Object();
                        definition.type = item[0];
                        definition.meanings = new Array();
                        item[1].forEach(element =>
                            definition.meanings.push({ "meaning": element[0], "example": element[2] })
                        );
                        result.definitions.push(definition);
                    });
                    // console.log("definitions: " + JSON.stringify(result.definitions));
                    break;
                // 单词的例句
                case 13:
                    result.examples = new Array();
                    items.forEach(item =>
                        item.forEach(element =>
                            result.examples.push(element[0])
                        )
                    );
                    // console.log("examples: " + JSON.stringify(result.examples));
                    break;
                // 单词构成的常见短语
                case 14:
                    result.phrases = items[0];
                    console.log("phrases: " + JSON.stringify(result.phrases));
                    break;
                default:
                    break;
            }
        }
    }
    showTranslate(result.commonMeanings);
}

/**
 * 展示翻译结果。
 * 
 * @param {Object} content 翻译结果。
 */
var showTranslate = function (content) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (chrome.runtime.lastError) {
            alert(content);
        }
        else {
            chrome.tabs.executeScript(tabs[0].id, {
                file: './display/display.js'
            }, function (tab) {
                if (chrome.runtime.lastError) {
                    alert(content);
                } else {
                    if (content)
                        chrome.tabs.sendMessage(tabs[0].id, content);
                }
            })
        }
    })
}

chrome.contextMenus.onClicked.addListener(onClickHandler);
