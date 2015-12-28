define([
    "dojo/_base/declare", "mxui/widget/_WidgetBase", "dijit/_TemplatedMixin",
    "mxui/dom", "dojo/dom", "dojo/query", "dojo/dom-prop", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/array", "dojo/_base/lang",
    "dojo/text!OnChangeInputbox/widget/template/OnChangeInputbox.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, dojoLang, widgetTemplate) {
    "use strict";

    return declare("OnChangeInputbox.widget.OnChangeInputbox", [_WidgetBase, _TemplatedMixin], {
        templateString         : widgetTemplate,

        //CACHES
        _hasStarted     : false,
        subHandle       : null,
        divNode         : "",
        inputBox        : "",
        handle          : "",
        delay_timer     : "",
        currValue       : "",
        obj             : null,

        startup : function(){
            if (this._hasStarted) {
                return;
            }
            this._hasStarted = true;

            if (this.placeholder) {
                domProp.set(this.inputBox, "placeholder", this.placeholder);
            }

            this.connect(this.inputBox, "onkeyup", dojoLang.hitch(this, this.eventOnChange));
            this.connect(this.inputBox, "onblur", dojoLang.hitch(this, this.onLeaveMicroflow));
            this.connect(this.inputBox, "onfocus", dojoLang.hitch(this, this.eventInputFocus));

            this.actLoaded();
        },
        update : function(obj, callback){
            this.obj = obj;
            if (this.subHandle) {
                this.unsubscribe(this.subHandle);
            }
            this.subHandle = this.subscribe({
                guid : obj.getGuid(),
                attr : this.name,
                callback : dojoLang.hitch(this, function (obj) {
                    this.changeInputBox();
                })
            });

            this.changeInputBox();

            if (callback) {
                callback();
            }
        },
        changeInputBox : function () {
            this.inputBox.value = this.obj.get(this.name);
        },
        eventInputFocus : function () {
            domClass.add(this.inputBox, "MxClient_formFocus");
        },
        eventOnChange : function() {
            this.obj.set(this.name, this.inputBox.value);
            mx.data.save({
                mxobj : this.obj,
                callback : dojoLang.hitch(this, function () {
                    // CHECK TRESHOLD HERE.
                    if (this.chartreshold > 0) {
                        if (this.inputBox.value.length > this.chartreshold){
                            this.eventCheckDelay();
                        } else {
                            clearTimeout(this.delay_timer);
                        }
                    } else {
                        this.eventCheckDelay();
                    }
                })
            });
        },
        eventCheckDelay : function () {
            if (this.delay > 0) {
                if (this.delay_timer) {
                    clearTimeout(this.delay_timer);
                }
                this.delay_timer = setTimeout(dojoLang.hitch(this, this.onChangeMicroflow), this.delay); // in milliseconds, seconds * 1000 !
            } else {
                this.onChangeMicroflow();
            }

        },
        onChangeMicroflow : function () {
            this.delay_timer = null;
            this.executeMicroflow(this.onchangemf);
        },
        onLeaveMicroflow : function () {
            this.delay_timer = null;
            this.executeMicroflow(this.onleavemf);
        },
        executeMicroflow : function (mf) {
            if (mf && this.obj) {
                mx.data.action({
                    store: {
                       caller: this.mxform
                    },
                    params: {
                        actionname  : mf,
                        applyto     : "selection",
                        guids       : [this.obj.getGuid()]
                    },
                    callback: function () {
                        // ok
                    },
                    error: function () {
                        logger.error("OnChangeInputbox.widget.OnChangeInputbox.triggerMicroFlow: XAS error executing microflow");
                    }
                });
            }
        }
    });
});

require(["OnChangeInputbox/widget/OnChangeInputbox"]);
