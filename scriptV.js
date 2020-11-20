// https://www.regextester.com/
var app = new Vue({
    el: '#app',
    data: {
        author: 'Samrat',
        labels: {
            ddlFormat: '#Format: ',
            ddlAnswerStyle: '#Answer style: ',
            pasteContent: 'Paste Your content Here',
            btnFormatting: 'Formatting...',
            ckAutoClear: 'Paste Area Auto Clear',
            ckConsoleAutoClear: 'Console Auto Clear',
            ckCopyToClipboard: 'Copy to Clipboard',
            ckWithoutQno: 'Without Question No. (For #2)',
            ckWithCorrectAns: 'With Correct Ans. (For #3)',
            ckJoinWithTilde: 'Join With Tilde (For #3)',
            ddlStepsData: 'Copy to (#dev)'
        },
        options: {
            ddlFormat: [
                { val: '-1', text: '--Select--' },
                { val: '1', text: 'One' },
                { val: '2', text: 'Two' },
                { val: '3', text: 'Three' },
                { val: '4', text: 'Four' },
                { val: '5', text: 'Five' },
                { val: '6', text: 'Six' },
                // { val: 'dev', text: 'Developer' },
            ],
            ddlAnswerStyle: [
                { val: '0', text: '(a)' },
                { val: '1', text: 'a.' },
                { val: '2', text: 'a)' },
                { val: '3', text: '(i)' },
                { val: '4', text: '(a) | a. | a) | (ক)' },
            ],
            ddlStepsData: [
                { val: '0', text: '--Select Any--' },
                { val: '1', text: 'Step 1.1 #Q' },
                { val: '2', text: 'Step 1.2 #A' },
                { val: '3', text: 'Step 2 #TF' },
                { val: '4', text: 'Destroy Step Data' },
            ]
        },
        selectedVal: {
            ddlFormat: '1',
            ddlAnswerStyle: '3',
            ckAutoClear: true,
            ckConsoleAutoClear: true,
            ckCopyToClipboard: true,
            ckWithoutQno: true,
            ckWithCorrectAns: true,
            ckJoinWithTilde: true,
            ddlStepsData: '0'
        },
        regxStyle: {
            questionStyle: /^\d+[.]\s?/gi,
            answerStyle: [
                { val: '0', regx: /\s*\(a\)\s*|\s*\(b\)\s*|\s*\(c\)\s*|\s*\(d\)\s*/gi },
                { val: '1', regx: /\s*a[.]\s*|\s*b[.]\s*|\s*c[.]\s*|\s*d[.]\s*/gi },
                { val: '2', regx: /\s*a\)\s*|\s*b\)\s*|\s*c\)\s*|\s*d\)\s*/gi },
                { val: '3', regx: /\s*\(i{1,3}\)\s*|\s*\(iv\)\s*/gi },
                { val: '4', regx: /\s*\(*a\)\s*|\s*\(*b\)\s*|\s*\(*c\)\s*|\s*\(*d\)\s*|\s*a[.]\s*|\s*b[.]\s*|\s*c[.]\s*|\s*d[.]\s*|\s*\((ক|খ|গ|ঘ)\)\s*/gi }
            ],
            TFStyle: {
                removeAllWithoutQuestion: /(^[a-z\d]{1,3}[.–]\s*)|([tf]$)|true$|false$|[(][tf][)]|\[t\]|\[f\]/gi,
                getAnswer: /([(][tf][)])|true|false|([tf]$)|\[t\]|\[f\]/gi
            }
        },
        pasteContent: "",
        pasteArea: null,
        userDesc: [
            "------------------------------------------------------------------------------",
            "Format #1 : {q,a,q,a...} change to {q,q,q...},{a,a,a...}",
            "Format #2 : {q,q,q...} change to {q,q,q...} with or without qno.",
            "Format #3 : {XXXX c,b,a,d,a...}, {a,a,a...} change to {a~b~c~d, #correct_answer}",
            "Format #4 : true-false of format-2.txt => #question \t\t true~false \t true, ...]",
            "-------------------------------------------------------------------------------",
            "Format #5 : format-2 txt",
            "Format #6 : blank ",
            "-------------------------------------------------------------------------------",
            "Format #developer: for details, read the \'format_dev\' function and \'format_1\' text file",
        ],
        resolve: null,
        resolveData: {
            step1: '#XXA',
            step2: '#XXB',
            step3: '#XXXX',
            step_1_Content: null,
            step_2_Content: null,
            step_3_Content: null,
            step_1_1_Content: null,
            step_1_2_Content: null,
            gotoStep2: false,
            gotoStep3: false,
        },
        logData: {
            copyLog: true,
            stepLog: true,
        },
        autoClearTimer: null,
    },
    methods: {
        // ------------------------Raw Data Helper Methods-------------
        removeNullIndex(arr) {
            return arr.filter(x => x.trim().length >= 1);
        },
        removeTab(str) {
            return str.replace(/\t{1,2}/gim, ' ').replace(/\n\n/gim, '\n');
        },
        removeDust(str) {
            return str.replace(//gim, '').replace(/\n\n/gim, '\n');;
        },
        checkIsAnswer(str) {
            return /\b[abcd]\b\.|\b[abcd]\b\s?\)|\(\s?\b[abcd]\b\s?\)|\((ক|খ|গ|ঘ)\)/ig.test(str);
        },
        formatting() {
            console.log('formatting...');
            this.resolve = null;
            if (this.selectedVal.ckConsoleAutoClear)
                console.clear();

            switch (this.selectedVal.ddlFormat) {
                case '1':
                    this.format_1();
                    break;
                case '2':
                    this.format_2();
                    break;
                case '3':
                    this.format_3();
                    break;
                case '4':
                    this.format_4();
                    break;
                case '5':
                    this.format_5();
                    break;
                case '6':
                    this.format_6();
                    break;
                case 'dev':
                    this.format_dev();
                    break;
            }
        },
        //#region  ------------------------Format Methods 01 to 06 -----------------------
        format_1() {
            console.log('#format 1 ...');
            var elm = this.removeDust(this.pasteContent);
            var elm_filter = {
                q: [], a: []
            };
            var elm_row = elm.trim().split('\n');
            var Ans = [];
            // debugger
            elm_row.forEach((_elm, i) => {
                _elm = _elm.trim();
                // Common Answer style:
                if (!this.checkIsAnswer(_elm)) {
                    if (Ans.length >= 0) {
                        elm_filter.a.push(Ans.join('\t'));
                        Ans = [];
                    }
                    elm_filter.q.push(_elm);
                } else {
                    Ans.push(_elm);
                }
                if (i == elm_row.length - 1) {
                    if (Ans.length >= 0) {
                        elm_filter.a.push(Ans.join('\t'));
                        Ans = [];
                    }
                    elm_filter.q = this.removeNullIndex(elm_filter.q);
                    elm_filter.a = this.removeNullIndex(elm_filter.a);
                    elm = elm_filter.q.join('\n') + '\n\n' + elm_filter.a.join('\n');
                    this.copyTo(elm);
                }
            });

        },
        format_2() {
            console.log('#format 2 ...');
            var elm = this.pasteContent;
            var elm_filter = {
                q: []
            };
            var elm_row = elm.trim().split('\n');
            elm_row.forEach((_elm, i) => {
                _elm = _elm.trim();
                if (this.selectedVal.ckWithoutQno) {
                    _elm = _elm.replace(this.regxStyle.questionStyle, "");
                }
                elm_filter.q.push(_elm);
                if (i == elm_row.length - 1) {
                    elm_filter.q = this.removeNullIndex(elm_filter.q);
                    elm = elm_filter.q.join('\n');
                    this.copyTo(elm);
                }
            });
        },
        format_3() {
            console.log('#format 3 ...');
            var elm = this.pasteContent;
            var elm_filter = {
                a: []
            };
            var haveXXXX = false;
            var elm_row = this.removeNullIndex(elm.trim().split('\n'));

            var correctAns = "";
            if (this.selectedVal.ckWithCorrectAns) {
                correctAns = elm_row.shift();
                haveXXXX = correctAns.search('XXXX') != -1;
                if (haveXXXX) {
                    correctAns = correctAns.trim().split('XXXX ');
                    if (correctAns.length > 1) {
                        correctAns = correctAns[1].split(',');
                        console.log(correctAns);
                    }
                }
            }
            var _opts;
            elm_row.forEach((_elm, i) => {
                _elm = _elm.trim();
                var ansStyle = this.regxStyle.answerStyle.find(x => x.val == this.selectedVal.ddlAnswerStyle);
                _elm = _elm.replace(ansStyle.regx, '\n');

                _elm = _elm.split('\n');
                _elm = _elm.filter(x => x.length >= 1);
                _opts = _elm;
                if (this.selectedVal.ckJoinWithTilde) {
                    _elm = _elm.join('~');
                } else {
                    _elm = _elm.join('\t');
                }

                var set_answer = '';
                if (this.selectedVal.ckWithCorrectAns && haveXXXX && correctAns.length > 0) {
                    var shiftedCorrectAns = correctAns.shift();
                    if (shiftedCorrectAns != '') {
                        switch (shiftedCorrectAns) {
                            case 'a':
                                set_answer = _opts.find((x, i) => i == 0);
                                break;
                            case 'b':
                                set_answer = _opts.find((x, i) => i == 1);
                                break;
                            case 'c':
                                set_answer = _opts.find((x, i) => i == 2);
                                break;
                            case 'd':
                                set_answer = _opts.find((x, i) => i == 3);
                                break;
                        }
                    }
                }

                if (set_answer != '') {
                    _elm += '\t' + set_answer;
                }

                elm_filter.a.push(_elm);

                if (i == elm_row.length - 1) {
                    elm_filter.a = this.removeNullIndex(elm_filter.a);
                    elm = elm_filter.a.join('\n');
                    this.copyTo(elm);
                }
            });
        },
        format_4() {
            console.log('#format 4 ...');
            var elm = this.pasteContent;
            var elm_filter = [];
            var elm_row = elm.trim().split('\n');
            var set_ans = '';
            var set_question = '';
            var set_opts = 'true~false';
            elm_row = this.removeNullIndex(elm_row);
            elm_row.forEach((_elm, i) => {
                _elm = _elm.trim();
                set_question = _elm.replace(this.regxStyle.TFStyle.removeAllWithoutQuestion, '').trim();

                set_ans = _elm.match(this.regxStyle.TFStyle.getAnswer);
                if (set_ans.length > 0) {
                    set_ans = set_ans[0].toLowerCase();
                    if (set_ans.indexOf('t') != -1) {
                        set_ans = 'true';
                    } else {
                        set_ans = 'false';
                    }
                }
                elm_filter.push(set_question + '\t\t' + set_opts + '\t' + set_ans);
                if (i == elm_row.length - 1) {
                    elm = elm_filter.join('\n');
                    this.copyTo(elm);
                }
            });
        },
        format_5() {
            console.log('#format 5 ...........');
            var elm = this.removeDust(this.pasteContent);
            var elm_filter = {
                q: [],
                a: []
            };
            var Ans = [];
            var isAnswerHave_abcd = true;
            var isAnswer;
            var isCorrectAns;
            var correct_Ans = '';

            var elm_row = elm.trim().split('\n');
            elm_row.forEach((_elm, i) => {
                _elm = _elm.trim();
                if (isAnswerHave_abcd) {
                    isAnswer = /(^[abcd][.)])/ig.test(_elm);
                } else {
                    isAnswer = /(^[i]{1,3}[.)])|(^iv[.)])/ig.test(_elm);
                }

                if (!isAnswer) {  // loop for question
                    _elm = _elm.replace(/^[a-z\d]{1,3}\./ig, "");
                    elm_filter.q.push(_elm.trim());
                    if (Ans.length > 0) {
                        var ansMerge = Ans.join('~');
                        Ans = [];
                        if (correct_Ans != '') {
                            ansMerge += '\t' + correct_Ans;
                            correct_Ans = '';
                        }
                        elm_filter.a.push(ansMerge);
                    }
                } else {
                    _elm = _elm.replace(/^[a-z]{1,3}[.)]|(^[i]{1,3}[.])|(^iv[.])/ig, "");
                    isCorrectAns = /[√#]/ig.test(_elm);
                    _elm = _elm.replace(/[√#]/ig, "");
                    if (isCorrectAns) {
                        correct_Ans = _elm.trim();
                    }
                    Ans.push(_elm.trim());
                }
                if (i == elm_row.length - 1) {
                    if (Ans.length > 0) {
                        var ansMerge = Ans.join('~');
                        Ans = [];
                        if (correct_Ans != '') {
                            ansMerge += '\t' + correct_Ans;
                            correct_Ans = '';
                        }
                        elm_filter.a.push(ansMerge);
                    }
                    elm_filter.q = this.removeNullIndex(elm_filter.q);
                    elm_filter.a = this.removeNullIndex(elm_filter.a);
                    elm = elm_filter.q.join('\n');
                    elm += '\n\n' + elm_filter.a.join('\n');
                    this.copyTo(elm);
                    // console.log(elm_filter)
                }
            });
        },
        format_6() {
            console.log('#format 6 ...');
            var elm = `blank function \nYou can add anything...`;
            this.copyTo(elm);

        },
        //#endregion

        //#region Dev Format
        format_dev() {
            console.log('#format_dev ...');
            this.logData.copyLog = false;
            var steps = this.dev_getStepsData();
            // Step1 Process Start
            this.pasteContent = steps.step_1_Content;
            this.selectedVal.ddlAnswerStyle = '4';
            this.resolve = (data) => {
                steps.step_1_Content = data;
                this.dev_logStepsData('step1 resolve', data);

                steps.step_1_1_Content = steps.step_1_Content.split('\n\n')[0];
                this.dev_logStepsData('step1 #1 fetched', steps.step_1_1_Content);

                steps.step_1_2_Content = steps.step_1_Content.split('\n\n')[1];
                this.dev_logStepsData('step1 #2 fetched', steps.step_1_2_Content);

                // Step2 Process Start
                this.pasteContent = steps.step_2_Content;
                this.resolve = (data) => {
                    steps.step_2_Content = data;
                    this.dev_logStepsData('step2 resolve', data);

                    // Step1 #1 Process Start
                    this.pasteContent = steps.step_1_1_Content;
                    this.resolve = (data) => {
                        steps.step_1_1_Content = data;
                        this.dev_logStepsData('step1 #1 resolve', data);

                        // Step1 #2 Process Start
                        this.pasteContent = steps.step_2_Content + '\n' + steps.step_1_2_Content;
                        this.resolve = (data) => {
                            steps.step_1_2_Content = data;
                            this.dev_logStepsData('step1 #2 resolve', data);
                        };
                        this.format_3();
                    };
                    this.format_2();
                };
                this.format_6();
            };
            this.format_1();
        },
        //#endregion

        //#region ------------------------Format Helper Methods-------------
        setPasteArea(e) {
            this.pasteArea = e.target;
        },
        copyTo(data) {
            this.pasteContent = data;
            if (this.logData.copyLog)
                console.log(data);
            setTimeout(() => {
                this.$refs.paste_area.select();
                if (this.selectedVal.ckCopyToClipboard) {
                    document.execCommand("copy");
                    console.log('copied to clipboard...');
                    if (this.resolve != null) {
                        this.resolve(data);
                    }
                }
                this.autoClearTimer = setTimeout(() => {
                    if (this.selectedVal.ckAutoClear) {
                        this.pasteContent = '';
                        this.selectedVal.ddlStepsData = '0';
                    }
                }, 8000);
            }, 500);
        },
        ckAutoClearChange() {
            if (this.selectedVal.ckAutoClear)
                this.pasteContent = null;
        },
        ddlStepsDataCopy() {
            console.log('Steps Data Copy...');
            this.logData.copyLog = true;
            this.resolve = null;
            if (this.autoClearTimer != null) {
                clearTimeout(this.autoClearTimer);
            }
            switch (this.selectedVal.ddlStepsData) {
                case '1':
                    this.copyTo(this.resolveData.step_1_1_Content);
                    break;
                case '2':
                    this.copyTo(this.resolveData.step_1_2_Content);
                    break;
                case '3':
                    this.copyTo(this.resolveData.step_2_Content);
                    break;
                case '4':
                    this.ddlStepsDataDestroy();
                    break;
            }
        },
        ddlStepsDataDestroy() {
            console.log('Steps Data Destroyed...');
            this.resolveData.step_1_Content = null;
            this.resolveData.step_2_Content = null;
            this.resolveData.step_1_1_Content = null;
            this.resolveData.step_1_2_Content = null;
            this.resolve = null;
        },
        //#endregion

        //#region ------------------------Dev Format Helper Methods-------------
        dev_getStepsData() {
            var elm = this.pasteContent.trim();
            var steps = this.resolveData;
            // set steos data position
            steps.step_1_Content = elm.indexOf(steps.step1);
            steps.step_2_Content = elm.indexOf(steps.step2);
            steps.step_3_Content = elm.indexOf(steps.step3);

            steps.gotoStep2 = steps.step_2_Content != -1;
            steps.gotoStep3 = steps.gotoStep2 && steps.step_3_Content != -1;

            if (!steps.gotoStep2) {
                steps.step_2_Content = elm.length;
            }
            if (!steps.gotoStep3) {
                steps.step_3_Content = elm.length;
            }

            steps.step_1_Content = this.removeTab(elm.substring(steps.step_1_Content, steps.step_2_Content).replace(steps.step1, ''));
            steps.step_2_Content = this.removeTab(elm.substring(steps.step_2_Content, steps.step_3_Content).replace(steps.step2, ''));
            steps.step_3_Content = this.removeTab(elm.substring(steps.step_3_Content, elm.length));
            return steps;
        },
        dev_logStepsData(message, data) {
            console.log(`format_dev ${message}`);
            if (this.logData.stepLog)
                console.log(data);
        },
        //#endregion
    }
})