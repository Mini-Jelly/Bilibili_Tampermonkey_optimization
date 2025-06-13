// ==UserScript==
// @name         Bilibili 移除搜索框 placeholder 和 title
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  精准移除或清空 Bilibili 搜索框的 placeholder 和 title 属性
// @author       YourName
// @match        *://*.bilibili.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    let retryCount = 0;
    const maxRetries = 5;

    function removeOrClearPlaceholderAndTitle(input) {
        if (!(input instanceof HTMLInputElement)) return;

        // 移除 placeholder 和 title
        input.removeAttribute('placeholder');
        input.removeAttribute('title');

        // 防止未来 JS 再次修改 placeholder 或 title
        const origSetAttribute = input.setAttribute;
        input.setAttribute = function (name, value) {
            const attrName = name.toLowerCase();
            if (attrName === 'placeholder' || attrName === 'title') return;
            return origSetAttribute.apply(this, arguments);
        };
    }

    function tryFindAndModifyInput() {
        // 同时匹配 nav-search-input 和 nav-search-content 类的 input
        const inputs = document.querySelectorAll('input.nav-search-input, input.nav-search-content');
        if (inputs.length > 0) {
            inputs.forEach(input => {
                removeOrClearPlaceholderAndTitle(input);
                observeInputChanges(input);
            });
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
            if (input.hasAttribute('title')) {
                input.removeAttribute('title');
            }
        });

        observer.observe(input, {
            attributes: true,
            attributeFilter: ['placeholder', 'title']
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        tryFindAndModifyInput();
    });

    const containerObserver = new MutationObserver(() => {
        tryFindAndModifyInput();
    });

    containerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
