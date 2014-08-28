dojo.provide("OnChangeInputbox.widget.OnChangeTextarea");

dojo.declare('OnChangeInputbox.widget.OnChangeTextarea', mxui.widget._WidgetBase, {
	//DECLARATION
	addons: [dijit._Templated],
    inputargs: {
		attr 			: '',
		onchangemf		: '',
		onleavemf 		: '',
		delay			: 0,
		chartreshold	: 0
    },
	
	//CACHES
	_hasStarted 		: false,
	divNode 			: '',
	inputBox 			: '',
	handle				: '',
	delay_timer			: '',
	currValue 			: '',
	objId				: 0,
	
	startup : function () {
		if (this._hasStarted)
			return;

		this._hasStarted = true;
		this.actLoaded();
	},

	update : function(obj, callback) {
		this.initInputbox(obj);
		this.objId = obj.getGuid();
		callback && callback();
	},

	initInputbox : function(obj) {
		var taNode = mxui.dom.div();
		this.domNode.appendChild(taNode);
		var textarea = new mxui.widget.TextArea({
			attributePath : this.attr,
			placeholder : 'My placeholder',
			maxLength : 0,
			rows : 0,
			textTooLongMsg : '',
			counterMsg : ''
		}, taNode);
		textarea.startup();
		textarea.update(obj, null);
		this.connect(textarea.domNode, "onkeyup", dojo.hitch(this, this.eventOnChange));
		this.connect(textarea.domNode, "onblur", dojo.hitch(this, this.onLeaveMicroflow));
		this.connect(textarea.domNode, "onfocus", dojo.hitch(this, this.eventInputFocus));
	},
	eventInputFocus : function () {
		dojo.addClass(this.inputBox, "MxClient_formFocus");
	},
	eventOnChange : function() {
		// CHECK TRESHOLD HERE.
		if (this.chartreshold > 0) {
			if (this.inputBox.value.length > this.chartreshold)
				this.eventCheckDelay();
			else
				clearTimeout(this.delay_timer);
		} else
			this.eventCheckDelay();
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
	onLeaveMicroflow : function () {
		this.delay_timer = null
        this.executeMicroflow(this.onleavemf);
	},
	executeMicroflow : function (mf) {
		if (mf && this.objId > 0) {
            mx.processor.xasAction({
                error       : function() {
                    logger.error("OnChangeInputbox.widget.OnChangeTextarea.triggerMicroFlow: XAS error executing microflow")
                },
                actionname  : mf,
                applyto     : 'selection',
                guids       : [this.objId]
            });
		}
	},
	uninitialize : function(){
	}
});