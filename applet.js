const Applet = imports.ui.applet;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

function runCommand(command) {
    try {
        let [res, out, err, status] = GLib.spawn_command_line_sync(command);
        if (res && out) return out.toString();
    } catch (e) {
        global.logError(e);
    }
    return null;
}

function getBytes(interfaceName) {
    let data = runCommand("cat /proc/net/dev");
    if (!data) return null;
    let lines = data.split("\n");
    for (let line of lines) {
        if (line.indexOf(interfaceName + ":") !== -1) {
            let parts = line.trim().split(/ +/);
            return {
                rx: parseInt(parts[1]),
                tx: parseInt(parts[9])
            };
        }
    }
    return null;
}

function formatSpeed(bytes) {
    let bps = (bytes / 3) * 8;
    let displayStr;

    if (bps < 1000) {
        displayStr = `${bps.toFixed(0)} bps`;
    } else {
        let kbps = bps / 1000;
        if (kbps < 1000) {
            displayStr = `${kbps.toFixed(1)} kbps`;
        } else {
            let mbps = kbps / 1000;
            if (mbps < 1000) {
                displayStr = `${mbps.toFixed(1)} Mbps`;
            } else {
                let gbps = mbps / 1000;
                displayStr = `${gbps.toFixed(2)} Gbps`;
            }
        }
    }
    return displayStr.padStart(10, ' ');
}

function MyApplet(metadata, orientation, panelHeight, instanceId) {
    this._init(metadata, orientation, panelHeight, instanceId);
}

MyApplet.prototype = {
    __proto__: Applet.Applet.prototype,

    _init: function(metadata, orientation, panelHeight, instanceId) {
        Applet.Applet.prototype._init.call(this, orientation, panelHeight, instanceId);

        this.set_applet_tooltip("Network Speed Monitor");

        let mainBox = new St.BoxLayout({ style_class: 'applet-box' });

        this.downArrowLabel = new St.Label({ text: '∇]', y_align: Clutter.ActorAlign.CENTER });
        this.rxLabel = new St.Label({ text: ' '.padStart(10, '.'), y_align: Clutter.ActorAlign.CENTER });
        this.upArrowLabel = new St.Label({ text: 'Δ', y_align: Clutter.ActorAlign.CENTER });
        this.txLabel = new St.Label({ text: ' '.padStart(10, '.'), y_align: Clutter.ActorAlign.CENTER });

        this.downArrowLabel.style = "font-size: 20px; font-weight: bold;";
        this.upArrowLabel.style = "font-size: 20px; font-weight: bold; margin-left: 10px;"; 

        const speedTextStyle = "font-family: monospace; font-size: 17px; font-weight: normal;";
        this.rxLabel.style = speedTextStyle;
        this.txLabel.style = speedTextStyle;

        mainBox.add_child(this.downArrowLabel);
        mainBox.add_child(this.rxLabel);
        mainBox.add_child(this.upArrowLabel);
        mainBox.add_child(this.txLabel);
        
        this.actor.add_child(mainBox);

        this.interfaceName = this.getActiveInterface();
        this.prev = getBytes(this.interfaceName);
        this.updateLoop();
    },

    getActiveInterface: function() {
        let output = runCommand("ip route get 8.8.8.8");
        if (!output) return "eth0";
        let match = output.match(/dev (\w+)/);
        return match ? match[1] : "eth0";
    },

    updateLoop: function() {
        this._timeout = Mainloop.timeout_add_seconds(3, Lang.bind(this, function() {
            let curr = getBytes(this.interfaceName);
            if (curr && this.prev) {

                let rxBytesOverInterval = curr.rx - this.prev.rx;
                let txBytesOverInterval = curr.tx - this.prev.tx;

                if (rxBytesOverInterval < 0) rxBytesOverInterval = 0;
                if (txBytesOverInterval < 0) txBytesOverInterval = 0;

                this.rxLabel.set_text(formatSpeed(rxBytesOverInterval));
                this.txLabel.set_text(formatSpeed(txBytesOverInterval));
            }
            this.prev = curr;
            return true; 
        }));
    },

    on_applet_removed_from_panel: function() {
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
        }
    }
};

function main(metadata, orientation, panelHeight, instanceId) {
    return new MyApplet(metadata, orientation, panelHeight, instanceId);
}