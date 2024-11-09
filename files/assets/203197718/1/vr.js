var Vr = pc.createScript('vr');

Vr.attributes.add('buttonVr', {
    type: 'entity',
    title: 'VR Button'
});

Vr.attributes.add('elementUnsupported', {
    type: 'entity',
    title: 'Unsupported Message'
});

Vr.attributes.add('elementHttpsRequired', {
    type: 'entity',
    title: 'HTTPS Required Message'
});

Vr.attributes.add('cameraEntity', {
    type: 'entity',
    title: 'Camera'
});

Vr.prototype.initialize = function () {
    this.buttonVr.element.on('click', function () {
        this.sessionStart();
    }, this);

    // esc - end session
    this.app.keyboard.on('keydown', function (evt) {
        if (evt.key === pc.KEY_ESCAPE && this.app.xr.active) {
            this.app.xr.end();
        }
    }, this);

    this.checkButton(false);

    this.setEvents('on');
    this.on('destroy', function () {
        this.setEvents('off');
    }, this);
};

Vr.prototype.setEvents = function (offOn) {
    this.app.xr[offOn]('available:' + pc.XRTYPE_VR, this.onAvailable, this);
    this.app.xr[offOn]('start', this.onStart, this);
    this.app.xr[offOn]('end', this.onEnd, this);
};

Vr.prototype.checkButton = function (enteringVr) {
    if (this.app.xr.supported) {
        this.elementHttpsRequired.enabled = false;
        this.elementUnsupported.enabled = false;

        if (enteringVr) {
            // hide button in XR session
            this.buttonVr.enabled = false;
        } else {
            // show button outside of XR sessiom
            this.buttonVr.enabled = true;

            // check if session type is available
            var available = this.app.xr && !this.app.xr.active && this.app.xr.isAvailable(pc.XRTYPE_VR);

            // set button opacity accordingly
            this.buttonVr.element.opacity = available ? 0.2 : 0.1;
            this.buttonVr.children[0].element.opacity = available ? 1.0 : 0.2;
        }
    } else {
        // WebXR is not supported
        this.buttonVr.enabled = false;

        // Check if we are on HTTPS
        if (window.location.protocol == "https:") {
            this.elementUnsupported.enabled = true;
            this.elementHttpsRequired.enabled = false;
        } else {
            this.elementUnsupported.enabled = false;
            this.elementHttpsRequired.enabled = true;
        }
    }
};

Vr.prototype.sessionStart = function () {
    if (!this.app.xr.supported) {
        // WebXR is not supported
        return;
    }

    if (this.app.xr.active) {
        // session already active
        return;
    }

    if (!this.app.xr.isAvailable(pc.XRTYPE_VR)) {
        // this session type is not available
        return;
    }

    // start session
    this.cameraEntity.camera.startXr(pc.XRTYPE_VR, pc.XRSPACE_LOCAL);
};

Vr.prototype.onAvailable = function () {
    this.checkButton(false);
};

Vr.prototype.onStart = function () {
    this.checkButton(true);
};

Vr.prototype.onEnd = function () {
    this.checkButton(false);
};