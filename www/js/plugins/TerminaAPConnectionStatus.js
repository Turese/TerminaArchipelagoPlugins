//=============================================================================
// TerminaAPConnectionStatus.js
//=============================================================================

/*
 * @plugindesc Termina AP Connection Status plugin.
 * @author 0palite
 * Termina AP Connection Status
 */

/**
 * @target MZ
 * @name ConnectionStatus
 * @plugindesc client status display
 * @authors 0palite
 * @version 1.0
 * @license Unlicensed
 * @help
 *
 * displays client status in top left
 *
 **/

const TIMER_RETRY_SECONDS = 30;


function ConnectionStatus(
  xOffset,
  yOffset,
  align,
  fontSize,
  disconnectedMessage,
) {
  this.initialize(xOffset, yOffset, align, fontSize, disconnectedMessage);
}

ConnectionStatus.prototype = Object.create(Window_Base.prototype);
ConnectionStatus.prototype.constructor = ConnectionStatus;

ConnectionStatus.prototype.initialize = function (
  xOffset,
  yOffset,
  align,
  fontSize,
  disconnectedMessage,
) {
  Window_Base.prototype.initialize.call(
    this,
    0,
    0,
    Graphics.width,
    Graphics.height,
  );
  this.padding = 0;
  this.contents.padding = 0;
  this.opacity = 0; // no background window
  // arbitrary offsets for text placement
  this.xOffset = xOffset || 120;
  this.contents.fontSize = fontSize || 16;
  this.yOffset = yOffset || -8;
  this.align = align || "left";
  this.disconnectedMessage = disconnectedMessage || "AP: Not connected";
};

ConnectionStatus.prototype.update = function () {
  Window_Base.prototype.update.call(this);
  this.refresh();
};

ConnectionStatus.prototype.refresh = function () {
  this.contents.clear();

  let text = "";

  if (TerminaAPClient.client.authenticated) {
    this.changeTextColor("#6daa2c");
    const playerName = TerminaAPClient.client.players.self.alias;
    text = `Connected as ${playerName}`;
  } else if (TerminaAPClient.connecting) {
    this.changeTextColor("#d27d2c");
    text = "Connecting...";
  } else if (typeof TerminaAPClient.connectionTimerFrames !== "number") {
    this.changeTextColor("#ac3232");
    text = TerminaAPClient.errorMessage || this.disconnectedMessage;
  } else {
    // disconnected
    if (TerminaAPClient.connectionTimerFrames > 0) {
      TerminaAPClient.connectionTimerFrames--;
      if (TerminaAPClient.connectionTimerFrames == 0) {
        TerminaAPClient.connectionTimerFrames = null;
        TerminaAPClient.startAPClient();
      }
    }
    const sec = Math.ceil(TerminaAPClient.connectionTimerFrames / 60);
    this.changeTextColor("#ac3232");
    text = `${TerminaAPClient.errorMessage} (retrying in ${sec}s)`;
  }

  this.drawText(
    text,
    this.xOffset,
    this.yOffset,
    Graphics.width - this.xOffset,
    this.align,
  );
};

// make it show on the overworld
const _Scene_Map_createDisplayObjects =
  Scene_Map.prototype.createDisplayObjects;

// we usually blur background renderings for menu,
// but we dont want to blur the connection message on the character select screen
var _snapForBackground = SceneManager.snapForBackground;
SceneManager.snapForBackground = function () {
  if ($gameMap.mapId() == 155) {
    this._backgroundBitmap = this.snap();
    _snapForBackground.call(this);
  } else {
    this._backgroundBitmap = this.snap();
  }
};

Scene_Map.prototype.createDisplayObjects = function () {
  _Scene_Map_createDisplayObjects.call(this);
  if ($gameMap.mapId() === 155) {
    // move it down on character select
    this._clientStatusWindow = new ConnectionStatus(
      25,
      175,
      "left",
      25,
      "Archipelago: connect to start game",
    );
  } else if (!false) {
    // todo: dont show on the loading screen and content warning
    this._clientStatusWindow = new ConnectionStatus();
  }
  if (this._clientStatusWindow) this.addChild(this._clientStatusWindow);
};
