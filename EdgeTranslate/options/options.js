/**
 * 初始化设置列表。
 */
window.onload = function () {
    // 获得用户之前选择的语言翻译选项。
    chrome.storage.sync.get("languageSetting", function (result) {
        var languageSetting = result.languageSetting;

        // 获取下拉列表元素。
        var sourceLanguage = document.getElementById("sl");
        var targetLanguage = document.getElementById("tl");
        // 获取交换按钮
        var exchangeButton = document.getElementById("exchange");

        // 添加交换按钮对点击事件的监听
        exchangeButton.onclick = function () {
            if (sourceLanguage.value !== 'auto') {
                let tempValue = targetLanguage.value;
                targetLanguage.value = sourceLanguage.value;
                sourceLanguage.value = tempValue;
                updateLanguageSetting(sourceLanguage.value, targetLanguage.value);
            }
        }

        // languages是可选的源语言和目标语言的列表。
        LANGUAGES.forEach(element => {
            if (languageSetting && element.value == languageSetting.sl) {
                sourceLanguage.options.add(new Option(element.name, element.value, true, true));
            } else {
                sourceLanguage.options.add(new Option(element.name, element.value));
            }

            if (languageSetting && element.value == languageSetting.tl) {
                targetLanguage.options.add(new Option(element.name, element.value, true, true));
            } else {
                targetLanguage.options.add(new Option(element.name, element.value));
            }
        });

        // 如何源语言是自动判断语言类型(值是auto),则按钮显示灰色，避免用户点击
        judgeValue(exchangeButton, sourceLanguage);

        sourceLanguage.onchange = function () {
            // 如何源语言是自动判断语言类型(值是auto),则按钮显示灰色，避免用户点击,如果不是，则显示蓝色，可以点击
            judgeValue(exchangeButton, sourceLanguage);
            updateLanguageSetting(
                sourceLanguage.options[sourceLanguage.selectedIndex].value,
                targetLanguage.options[targetLanguage.selectedIndex].value
            );
        };

        targetLanguage.onchange = function () {
            updateLanguageSetting(
                sourceLanguage.options[sourceLanguage.selectedIndex].value,
                targetLanguage.options[targetLanguage.selectedIndex].value
            );
        };
    });

    chrome.storage.sync.get('DTSetting', function (result) {
        var DTSetting = result.DTSetting;

        // 存储翻译选项的选择元素
        var configChedkbox = [];

        //添加翻译选项的选择元素
        configChedkbox.push(document.getElementById('ex'));  // 显示例句选项框
        configChedkbox.push(document.getElementById('ss'));  // 显示相关词选项框
        configChedkbox.push(document.getElementById('md'));  // 显示定义选项框
        configChedkbox.push(document.getElementById('rw'));  // 显示词组选项框
        configChedkbox.push(document.getElementById('bd'));  // 显示所有含义选项框
        configChedkbox.push(document.getElementById('at'));  // 显示常用意思选项框

        // 首先将初始化的设置同步到页面中
        for (let i = 0; i < configChedkbox.length; i++)
            configChedkbox[i].checked = DTSetting.indexOf(configChedkbox[i].value) !== -1;

        // 如果用户修改了选项，则添加事件监听,将修改的配置保存
        for (let i = 0; i < configChedkbox.length; i++)
            configChedkbox[i].onchange = function () {
                if (configChedkbox[i].checked) // 用户勾选了这一项
                    DTSetting.push(configChedkbox[i].value);
                else // 用户删除了这一项
                    DTSetting.splice(DTSetting.indexOf(configChedkbox[i].value));
                // 同步修改后的设定
                updateLanguageSetting(DTSetting);
            }
    })

    /**
     * 
     * 如果源语言是自动判断语言类型(值是auto),则按钮显示灰色，避免用户点击
     * 
     * @param {*HTMLElement} exchangeButton 特定的一个element,是一个交换按钮图标
     * @param {*HTMLElement} sourceLanguage 特定的一个element,源语言的选项框
     */
    var judgeValue = function (exchangeButton, sourceLanguage) {
        if (sourceLanguage.value === 'auto')
            exchangeButton.style.color = 'gray';
        else
            exchangeButton.style.color = '#4a8cf7';
    }
};

/**
 * 保存翻译语言设定。
 * 
 * @param {*} sourceLanguage 源语言
 * @param {*} targetLanguage 目标语言
 */
function updateLanguageSetting(sourceLanguage, targetLanguage) {
    saveOption("languageSetting", { "sl": sourceLanguage, "tl": targetLanguage });
}

/**
 * 保存翻译选项设置(DTSetting)。
 * 
 * @param {*object} DTSetting 需要同步的翻译选项设定
 */
function updateLanguageSetting(DTSetting) {
    saveOption("DTSetting", DTSetting);
}

/**
 * 保存一条设置项。
 * 
 * @param {*} key 设置项名
 * @param {*} value 设置项值
 */
function saveOption(key, value) {
    var item = {};
    item[key] = value;
    chrome.storage.sync.set(item);
};