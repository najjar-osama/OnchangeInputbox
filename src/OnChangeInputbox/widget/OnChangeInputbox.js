define([
    "dojo/_base/declare", "mxui/widget/_WidgetBase", "dijit/_TemplatedMixin",
    "mxui/dom", "dojo/dom", "dojo/query", "dojo/dom-prop", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/array", "dojo/_base/lang",
    "dojo/text!OnChangeInputbox/widget/template/OnChangeInputbox.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, dojoLang, widgetTemplate) {
    "use strict";

    return declare("OnChangeInputbox.widget.OnChangeInputbox", [_WidgetBase, _TemplatedMixin], {
        templateString: widgetTemplate,

        //CACHES
        _hasStarted: false,
        subHandle: null,
        divNode: "",
        inputBox: "",
        handle: "",
        delay_timer: "",
        currValue: "",
        obj: null,

        onChangeEvent: "",
        onChangeMicroflow:"",
        onChangeNanoflow:null,
        onLeaveEvent: "",
        onLeaveMicroflow:"",
        onLeaveNanoflow:null,

        startup: function() {
            if (this._hasStarted) {
                return;
            }
            this._hasStarted = true;

            if (this.placeholder) {
                domProp.set(this.inputBox, "placeholder", this.placeholder);
            }

            if (this.showaspassword) {
                domProp.set(this.inputBox, "type", "password");
            }

            this.connect(this.inputBox, "onkeyup", dojoLang.hitch(this, this.eventOnChange));
            this.connect(this.inputBox, "onblur", dojoLang.hitch(this, this.onLeaveAction));
            this.connect(this.inputBox, "onfocus", dojoLang.hitch(this, this.eventInputFocus));

            this.actLoaded();
        },

        update: function(obj, callback) {
            this.obj = obj;

            if (this.subHandle) {
                this.unsubscribe(this.subHandle);
                this.subHandle = null;
            }

            if (this.obj) {
                // in some cases update may be called with a null obj
                this.subHandle = this.subscribe({
                    guid: obj.getGuid(),
                    attr: this.name,
                    callback: dojoLang.hitch(this, function(obj) {
                        this.changeInputBox();
                    })
                });
                this.changeInputBox();
            }

            if (callback) {
                callback();
            }
        },

        changeInputBox: function() {
            this.inputBox.value = this.obj.get(this.name);
        },

        eventInputFocus: function() {
            domClass.add(this.inputBox, "MxClient_formFocus");
        },

        eventOnChange: function() {
            if (this.obj.get(this.name) !== this.inputBox.value) {
                this.obj.set(this.name, this.inputBox.value);
                if (this.chartreshold > 0) {
                    if (this.inputBox.value.length > this.chartreshold) {
                        this.eventCheckDelay();
                    } else {
                        clearTimeout(this.delay_timer);
                    }
                } else {
                    this.eventCheckDelay();
                }
            }
        },

        eventCheckDelay: function() {
            if (this.delay > 0) {
                if (this.delay_timer) {
                    clearTimeout(this.delay_timer);
                }
                this.delay_timer = setTimeout(dojoLang.hitch(this, this.onChangeAction), this.delay); // in milliseconds, seconds * 1000 !
            } else {
                this.onChangeAction();
            }
        },

        onChangeAction: function () {
            this.delay_timer = null;
            if (this.onChangeEvent === "callMicroflow" && this.onChangeMicroflow) {
                this._executeMicroflow(this.onChangeMicroflow);
            } else if (this.onChangeEvent === "callNanoflow" && this.onChangeNanoflow.nanoflow && this.mxcontext) {
                this._executeNanoflow(this.onChangeNanoflow);
            } else if(this.onChangeEvent === "doNothing") {
                return;
            } else {
                mx.ui.error("No action specified for " + this.onChangeEvent)
            }
        },

        onLeaveAction: function () {
            this.delay_timer = null;
            if (this.onLeaveEvent === "callMicroflow" && this.onLeaveMicroflow) {
                this._executeMicroflow(this.onLeaveMicroflow);
            } else if (this.onLeaveEvent === "callNanoflow" && this.onLeaveNanoflow.nanoflow && this.mxcontext) {
                this._executeNanoflow(this.onLeaveNanoflow);
            } else if(this.onLeaveEvent === "doNothing") {
                return;
            } else {
                mx.ui.error("No action specified for " +  this.onLeaveEvent)
            }
        },

        _executeNanoflow: function(nanoflow){
            window.mx.data.callNanoflow({
                nanoflow: nanoflow,
                origin: this.mxform,
                context: this.mxcontext,
                callback: function() {},
                error: function (error) {
                    mx.ui.error("An error occurred while executing the on nanoflow: " + error.message);
                }
            });
        },

        _executeMicroflow: function(microflow) {
            if (microflow && this.obj) {
                mx.data.action({
                    origin: this.mxform,
                    params: {
                        actionname: microflow,
                        applyto: "selection",
                        guids: [this.obj.getGuid()]
                    },
                    callback: function() {},
                    error: function() {
                        mx.ui.error("OnChangeInputbox.widget.OnChangeInputbox.triggerMicroFlow: XAS error executing microflow");
                    }
                });
            }
        }
    });
});

require(["OnChangeInputbox/widget/OnChangeInputbox"]);
