define([
    "dojo/_base/declare", "mxui/widget/_WidgetBase",
    "mxui/dom", "dojo/dom", "dojo/query", "dojo/dom-prop", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/array", "dojo/_base/lang"
], function (declare, _WidgetBase, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, dojoLang) {
    "use strict";

    return declare("OnChangeInputbox.widget.OnChangeTextarea", [_WidgetBase], {
        //CACHES
        _hasStarted  : false,
        divNode      : "",
        inputBox     : "",
        handle       : "",
        delay_timer  : "",
        currValue    : "",
        objId        : null,
        textarea     : null,
        _textLocked  : false,

        startup : function () {
            if (this._hasStarted) {
                return;
            }

            this._hasStarted = true;

            var taNode = mxui.dom.div();
            this.domNode.appendChild(taNode);
            this.textarea = new mxui.widget.TextArea({
                attributePath : this.entity + "/" + this.attr,
                placeholder : this.placeholder,
                maxLength : this.maxLength,
                rows : 0,
                textTooLongMsg : "",
                counterMsg : ""
            }, taNode);
            this.textarea.startup();

            var self = this;
            this.textarea._setValueAttr = function () {
                if (!self._textLocked) {
                    this.editNode.value = arguments[0];
                }
                this.resize();
            };

            this.connect(this.textarea.domNode, "onkeyup", dojoLang.hitch(this, this.eventOnChange));
            this.connect(this.textarea.domNode, "onfocus", dojoLang.hitch(this, this.eventInputFocus));

            this.actLoaded();
        },

        update : function(obj, callback) {
            this.obj = obj;
            this.textarea.update(obj, callback);
        },
        eventInputFocus : function () {
            domClass.add(this.inputBox, "MxClient_formFocus");
        },
        eventOnChange : function() {
			if (this.obj.get(this.name) !== this.inputBox.value) {
				this._textLocked = true;
				this.obj.set(this.attr, this.textarea.editNode.value);
				mx.data.save({
					mxobj : this.obj,
					callback : dojoLang.hitch(this, function () {
						// CHECK TRESHOLD HERE.
						if (this.chartreshold > 0) {
							if (this.textarea.editNode.value.length > this.chartreshold) {
								this.eventCheckDelay();
							} else {
								clearTimeout(this.delay_timer);
							}
						} else {
							this.eventCheckDelay();
						}
					})
				});
			}
        },
        eventCheckDelay : function () {
            if (this.delay > 0) {
                if (this.delay_timer) {
                    clearTimeout(this.delay_timer);
                    this.delay_timer = setTimeout(dojoLang.hitch(this, this.onChangeMicroflow), this.delay); // in milliseconds, seconds * 1000 !
                } else {
                    this.delay_timer = setTimeout(dojoLang.hitch(this, this.onChangeMicroflow), this.delay); // in milliseconds, seconds * 1000 !
                }
            } else {
                this.onChangeMicroflow();
            }

        },
        onChangeMicroflow : function () {
            this.delay_timer = null;
            this.executeMicroflow(this.onchangemf);
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
                    callback : dojoLang.hitch(this, function () {
                        this._textLocked = false;
                    }),
                    error: function () {
                        logger.error("OnChangeInputbox.widget.OnChangeTextarea.triggerMicroFlow: XAS error executing microflow");
                    }
                });
            }
        }
    });
});

require(["OnChangeInputbox/widget/OnChangeTextarea"]);
