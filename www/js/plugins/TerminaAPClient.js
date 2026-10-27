//=============================================================================
// TerminaAPClient.js
//=============================================================================

/*
 * @plugindesc Termina AP Client plugin.
 * @author 0palite
 * Termina AP Client Status
 */

var TerminaAPClient = TerminaAPClient || {};

TerminaAPClient.client =
  TerminaAPClient.client || new window.ArchipelagoModules.Client();

TerminaAPClient.connectionTimerFrames = null;

TerminaAPClient.resetClient = async function () {
  if (TerminaAPClient.client.authenticated) {
    TerminaAPClient.client.socket.off("disconnected");
    TerminaAPClient.client.socket.disconnect();
  }
  TerminaAPClient.startAPClient();
};

TerminaAPClient.initializeSlotData = function (slotData) {
  if (!$gamePlayer) return;
  if (!slotData) return $gamePlayer.slotData;
  $gamePlayer.slotData = slotData;
};

TerminaAPClient.startAPClient = async function () {
  if (TerminaAPClient.connecting) return;
  const slotName = ConfigManager.slotName || "";
  const roomId = ConfigManager.roomId || "";
  const password = ConfigManager.password || "";

  if (!slotName.length) {
    TerminaAPClient.errorMessage =
      "AP Client not connected: missing slot name.";
    TerminaAPClient.connectionTimerFrames = null;
    return;
  }

  if (!roomId.length) {
    TerminaAPClient.errorMessage = "AP Client not connected: missing room id.";
    TerminaAPClient.connectionTimerFrames = null;
    return;
  }

  TerminaAPClient.client.items.on("itemsReceived", (_m) => {
    // todo: multiworld item grant handling
  });

  TerminaAPClient.client.deathLink.on("deathReceived", (_m) => {
    // todo: multiworld deathlink handling
  });

  TerminaAPClient.client.socket.on("disconnected", (_m) => {
    TerminaAPClient.errorMessage = "Disconnected from server";
    TerminaAPClient.connectionTimerFrames = TIMER_RETRY_SECONDS * 60;
  });

  const args = {};

  if (password.length) {
    args.password = password;
  }

  if (!TerminaAPClient.client.authenticated) {
    TerminaAPClient.connecting = true;
    TerminaAPClient.connectionTimerFrames = null;
    TerminaAPClient.client
      .login(roomId, slotName, "Look Outside", args) // todo: termina APWorld name!
      .then((slotData) => {
        TerminaAPClient.connecting = false;
        // todo: call other game loaded AP setup functions
        TerminaAPClient.initializeSlotData(slotData);
      })
      .catch((e) => {
        TerminaAPClient.connecting = false;
        console.error(e);
        
        TerminaAPClient.errorMessage = e.message;
      });
  } else if ($gamePlayer && !$gamePlayer.slotData) {
    // this is the failed to connect and no preexisting AP slot data case
  } else {
    // this is the failed to connect but has connected in past case
    // assumed this will be during a save file load scenario
    // so do whatever setup we need for that here
  }
};
