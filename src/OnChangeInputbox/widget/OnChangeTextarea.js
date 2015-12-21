dojo.provide("OnChangeInputbox.widget.OnChangeTextarea");

dojo.declare('OnChangeInputbox.widget.OnChangeTextarea', mxui.widget._WidgetBase, {
	/*
	attr 			: '',
	onchangemf		: '',
	onleavemf 		: '',
	delay			: 0,
	chartreshold	: 0,
	placeholder 	: '',
	maxLength 		: 0,
	rows 			: 0,
	textTooLongMsg 	: '',
	counterMsg 		: ''
	*/
	
	//CACHES
	_hasStarted 		: false,
	divNode 			: '',
	inputBox 			: '',
	handle				: '',
	delay_timer			: '',
	currValue 			: '',
	objId				: null,
	textarea 			: null,
	_textLocked			: false,
	
	startup : function () {
		if (this._hasStarted)
			return;

		this._hasStarted = true;

		var taNode = mxui.dom.div();
		this.domNode.appendChild(taNode);
		this.textarea = new mxui.widget.TextArea({
			attributePath : this.entity+"/"+this.attr,
			placeholder : this.placeholder,
			maxLength : this.maxLength,
			rows : 0,
			textTooLongMsg : '',
			counterMsg : ''
		}, taNode);
		this.textarea.startup();

		var self = this;
		this.textarea._setValueAttr = function () {
			if (!self._textLocked)
				this.editNode.value = arguments[0];

			this.resize();
		};

		this.connect(this.textarea.domNode, "onkeyup", dojo.hitch(this, this.eventOnChange));
		this.connect(this.textarea.domNode, "onfocus", dojo.hitch(this, this.eventInputFocus));

		this.actLoaded();
	},

	update : function(obj, callback) {
		this.obj = obj;
		this.textarea.update(obj, callback);
	},
	eventInputFocus : function () {
		dojo.addClass(this.inputBox, "MxClient_formFocus");
	},
	eventOnChange : function() {
        if (this.obj.get(this.attr) !== this.textarea.editNode.value) {
            this._textLocked = true;
            this.obj.set(this.attr, this.textarea.editNode.value);
            mx.data.save({
                mxobj : this.obj,
                callback : dojo.hitch(this, function () {
                    // CHECK TRESHOLD HERE.
                    if (this.chartreshold > 0) {
                        if (this.textarea.editNode.value.length > this.chartreshold)
                            this.eventCheckDelay();
                        else
                            clearTimeout(this.delay_timer);
                    } else
                        this.eventCheckDelay();
                })
            });
        }
	},
	eventCheckDelay : function () {
		if (this.delay > 0) {
			if (this.delay_timer) {
				clearTimeout(this.delay_timer);
				this.delay_timer = setTimeout(dojo.hitch(this, this.onChangeMicroflow), this.delay); // in milliseconds, seconds * 1000 !
			}
			else
				this.delay_timer = setTimeout(dojo.hitch(this, this.onChangeMicroflow), this.delay); // in milliseconds, seconds * 1000 !
		} else {
			this.onChangeMicroflow();
		}
		
	},
	onChangeMicroflow : function () {
		this.delay_timer = null
		this.executeMicroflow(this.onchangemf);
	},
	executeMicroflow : function (mf) {
		if (mf && this.obj) {
            mx.processor.xasAction({
                error       : function() {
                    logger.error("OnChangeInputbox.widget.OnChangeTextarea.triggerMicroFlow: XAS error executing microflow")
                },
                actionname  : mf,
                applyto     : 'selection',
                callback : dojo.hitch(this, function () {
                	this._textLocked = false;
                }),
                guids       : [this.obj.getGuid()]
            });
		}
	},
	uninitialize : function(){
	}
});