// ==UserScript==
// @name         Bilibili 移除搜索框 placeholder
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  精准移除或清空 Bilibili 搜索框的 placeholder 属性
// @author       Qwen3-235B-A22B
// @match        *://*.bilibili.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    let retryCount = 0;
    const maxRetries = 10;

    function removeOrClearPlaceholder(input) {
        if (!(input instanceof HTMLInputElement)) return;

        // 方法一：直接删除属性最快
        input.removeAttribute('placeholder');

        // 方法二（可选）：设置为空字符串
        // input.placeholder = '';

        // 方法三（可选）：设置为一个空格
        // input.setAttribute('placeholder', '\u00A0'); // 不推荐，容易被覆盖

        // 防止未来 JS 再次修改 placeholder
        const origSetAttribute = input.setAttribute;
        input.setAttribute = function (name, value) {
            if (name.toLowerCase() === 'placeholder') return;
            return origSetAttribute.apply(this, arguments);
        };
    }

    function tryFindAndModifyInput() {
        const input = document.querySelector('input.nav-search-input');
        if (input) {
            removeOrClearPlaceholder(input);
            observeInputChanges(input);
            return true;
        }

        if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryFindAndModifyInput, 1000);
        } else {
            console.log("尝试结束，未找到目标 input");
        }
    }

    function observeInputChanges(input) {
        const observer = new MutationObserver(() => {
            if (input.hasAttribute('placeholder')) {
                input.removeAttribute('placeholder');
            }
        });

        observer.observe(input, {
            attributes: true,
            attributeFilter: ['placeholder']
        });
    }

    // 使用 DOMContentLoaded 或者延迟执行确保找到元素
    window.addEventListener('DOMContentLoaded', () => {
        tryFindAndModifyInput();
    });

    // 备用：监听整个 body，防止动态插入
    const containerObserver = new MutationObserver(() => {
        tryFindAndModifyInput();
    });

    containerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
