dojo.provide("OnChangeInputbox.widget.OnChangeInputbox");

dojo.declare('OnChangeInputbox.widget.OnChangeInputbox', [mxui.widget._WidgetBase, dijit._TemplatedMixin], {
    templateString         : dojo.cache("OnChangeInputbox", "widget/ui/OnChangeInputbox.html"),

    //CACHES
    _hasStarted     : false,
    subHandle       : null,
    divNode         : '',
    inputBox        : '',
    handle          : '',
    delay_timer     : '',
    currValue       : '',
    obj             : null,

    startup : function(){
        if (this._hasStarted) {
            return;
        }
        this._hasStarted = true;

        this.connect(this.inputBox, "onkeyup", dojo.hitch(this, this.eventOnChange));
        this.connect(this.inputBox, "onblur", dojo.hitch(this, this.onLeaveMicroflow));
        this.connect(this.inputBox, "onfocus", dojo.hitch(this, this.eventInputFocus));

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
            callback : dojo.hitch(this, function (obj) {
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
        dojo.addClass(this.inputBox, "MxClient_formFocus");
    },
    eventOnChange : function() {
        this.obj.set(this.name, this.inputBox.value);
        mx.data.save({
            mxobj : this.obj,
            callback : dojo.hitch(this, function () {
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
            this.delay_timer = setTimeout(dojo.hitch(this, this.onChangeMicroflow), this.delay); // in milliseconds, seconds * 1000 !
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
                error       : function() {
                    logger.error("OnChangeInputbox.widget.OnChangeInputbox.triggerMicroFlow: XAS error executing microflow");
                },
                actionname  : mf,
                applyto     : 'selection',
                guids       : [this.obj.getGuid()]
            });
        }
    },
    uninitialize : function(){
    }
});
