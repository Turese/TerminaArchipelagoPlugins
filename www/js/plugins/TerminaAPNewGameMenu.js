//=============================================================================
// TerminaAPNewGameMenu.js
//=============================================================================

/*
 * @plugindesc Termina Archipelago connector plugin.
 * @author 0palite
 * Overrides the new game menu to fill in difficulty and character info from the archipelago server
 */

var TerminaAPNewGameMenu = TerminaAPNewGameMenu || {};

// mapping from name to character info for the 8 playables
// PCId: id of switch that determines whether player has chosen them as their character
//          Levi is main character by default, so his switch has to be toggled off if anyone else is selected
// soulId: id of switch that determines whether player has this character's soul
// genderId: 239 = male, 240 = female, this switch is also set on character select
// actorId: id of the actor associated with this character;
//          Levi is in party as default, so he has to be swapped out if anyone else is selected
// portraitId: id of the large character portrait

const CHARACTER_MAPPINGS = {
  Levi: {
    PCId: 246,
    soulId: 494,
    genderId: 239,
    actorId: 1,
    portraitId: "Actor1_1",
  },
  Marina: {
    PCId: 242,
    soulId: 495,
    genderId: 240,
    actorId: 2,
    portraitId: "Actor1_3",
  },
  Daan: {
    PCId: 243,
    soulId: 496,
    genderId: 239,
    actorId: 4,
    portraitId: "Actor1_5",
  },
  Abella: {
    PCId: 244,
    soulId: 497,
    genderId: 240,
    actorId: 5,
    portraitId: "Actor1_6",
  },
  "O'saa": {
    PCId: 2401,
    soulId: 500,
    genderId: 239,
    actorId: 6,
    portraitId: "Actor2_1",
  },
  Olivia: {
    PCId: 2402,
    soulId: 493,
    genderId: 240,
    actorId: 15,
    portraitId: "Actor1_8",
  }, // olivia is given a bonus one winged necklace here too
  Marcoh: {
    PCId: 2403,
    soulId: 499,
    genderId: 239,
    actorId: 13,
    portraitId: "Actor1_7",
  },
  Karin: {
    PCId: 2404,
    soulId: 498,
    genderId: 240,
    actorId: 14,
    portraitId: "Actor2_2",
  },
};

const DIFFICULTY_MAPPINGS = {
  easy: "difficulty_easy",
  funger: "difficulty_fear",
  maso: "difficulty_solo",
};

// we're overriding the character select event, so we must repeat the variable initialization
TerminaAPNewGameMenu.initializeCharacterState = function (characterName) {
  const character = CHARACTER_MAPPINGS[characterName];
  if (!character) return;

  // clear out Levi default info

  $gameSwitches.setValue(CHARACTER_MAPPINGS["Levi"].PCId, false);
  $gameParty.removeActor(CHARACTER_MAPPINGS["Levi"].actorId); // bye Levi o7

  // set the new character's info
  $gameSwitches.setValue(character.PCId, true);
  $gameSwitches.setValue(character.soulId, true);
  $gameSwitches.setValue(character.genderId, true);
  $gameParty.addActor(character.actorId); // if the player is cool then welcome back levi :)
};

// todo: fill out
// grant NG+ items and spells to a new save
TerminaAPNewGameMenu.initializeNGPlusState = function () {};

// todo: fill out
// we're overriding the difficulty select event, so we must repeat the
// variable initialization

// this is also where we set randomized values like where the mob and death masks show up later in the game

// this is also where we set the maso mode day3 state
TerminaAPNewGameMenu.initializeDifficultyState = function (difficultyId) {};

// Name input scene that saves archipelago connection values into ConfigManager[key]

function APNameScene() {
  this.initialize(...arguments);
}

APNameScene.prototype = Object.create(Scene_Name.prototype);
APNameScene.prototype.constructor = APNameScene;

APNameScene.prototype.initialize = function () {
  this._actor = {
    name: () => ConfigManager[this._key] || "",
    faceName: () => "",
    faceIndex: () => 0,
    setName: (name) => {
      ConfigManager.applyData({ [this._key]: name });
    },
  };
  Scene_MenuBase.prototype.initialize.call(this);
};

APNameScene.prototype.prepare = function (key, maxLength) {
  this._key = key;
  this._maxLength = maxLength;
};

// need to set up name input pieces here
APNameScene.prototype.create = function () {
  Scene_Base.prototype.create.call(this);
  this.createBackground();
  this.createWindowLayer();
  this.createEditWindow();
  this.createInputWindow();
};

const APConfigNames = {
  slotName: "Slot Name",
  roomId: "Server",
  password: "Password",
};

function getAPConfigName(key) {
  const configValue =
    key == "password"
      ? "●".repeat(ConfigManager[key].length)
      : ConfigManager[key];
  return `${APConfigNames[key]}${configValue.length ? " - " + configValue : ""}`;
}

const _onNameOk = Window_NameInput.prototype.onNameOk;
Window_NameInput.prototype.onNameOk = function () {
  if (SceneManager._scene instanceof APNameScene) {
    // dont call _onNameOk in this case since it
    // force reverts to last non-empty value
    // on empty input
    this.playOkSound();
    this.callOkHandler();
    ConfigManager.save();
  } else {
    _onNameOk.call(this);
  }
};

// opens name scene
window.openAPNameInput = function (key, maxLength) {
  SceneManager.push(APNameScene);
  SceneManager.prepareNextScene(key, maxLength);
};

TerminaAPNewGameMenu.APOptionIndex = 0;

var _Window_ChoiceList_start = Window_ChoiceList.prototype.start;

TerminaAPNewGameMenu.newGameAPOptions = function () {
  $gameMessage.setChoices(
    [
      getAPConfigName("slotName"),
      getAPConfigName("roomId"),
      getAPConfigName("password"),
      "Connect",
      "Start Game",
    ],
    TerminaAPNewGameMenu.APOptionIndex,
  );

  $gameMessage.setChoiceBackground(0);
  $gameMessage.setChoicePositionType(0);

  $gameMessage.setChoiceCallback(function (n) {
    if (n === 0) {
      TerminaAPNewGameMenu.APOptionIndex = 0;
      window.openAPNameInput("slotName", 16);
    } else if (n === 1) {
      console.log("SERVER");
      TerminaAPNewGameMenu.APOptionIndex = 1;
      window.openAPNameInput("roomId", 30);
    } else if (n === 2) {
      console.log("PASSWORD");
      TerminaAPNewGameMenu.APOptionIndex = 2;
      window.openAPNameInput("password", 12);
    } else if (n === 3) {
      console.log("CONNECT");
      TerminaAPClient.startAPClient();
      TerminaAPNewGameMenu.APOptionIndex = 3;
    } else if (n === 4) {
      if (!TerminaAPClient.client.authenticated) {
        console.log("Cannot start game without connecting first.");
        return;
      } else {
        console.log("Starting game...");
        const character = "Abella"; // todo: take character name from slotData
        const difficulty = "funger"; // todo: take difficulty from slotData
        TerminaAPNewGameMenu.initializeCharacterState(character);
        TerminaAPNewGameMenu.initializeNGPlusState();
        TerminaAPNewGameMenu.initializeDifficultyState(difficulty);
        $gameSelfSwitches.setValue([155, 1, "C"], true); // jump to last page of this event which boots player to the train
        return;
      }
    }
  });

  if (TerminaAPClient.client.authenticated) {
    const characterPortrait = CHARACTER_MAPPINGS["Abella"].portraitId; // todo: take character name from slotData and map onto CHARACTER_MAPPINGS[character].portraitId
    const difficultyPortrait = DIFFICULTY_MAPPINGS["funger"]; // todo: take difficulty from slotData and map onto DIFFICULTY_MAPPINGS[difficulty]
    $gameScreen.showPicture(
      7, // Picture number
      characterPortrait,
      1, // Origin: 0 = top-left, 1 = center
      625, // X
      300, // Y
      100, // Scale X (%)
      100, // Scale Y (%)
      255, // Opacity (0–255)
      0, // Blend mode: 0 = normal
    );
    $gameScreen.showPicture(
      8, // Picture number
      difficultyPortrait,
      1, // Origin: 0 = top-left, 1 = center
      625, // X
      475, // Y
      100, // Scale X (%)
      100, // Scale Y (%)
      255, // Opacity (0–255)
      0, // Blend mode: 0 = normal
    );
  } else {
    $gameScreen.erasePicture(7);
    $gameScreen.erasePicture(8);
  }
};

TerminaAPNewGameMenu.overrideCharacterSelectMap = function () {
  // $dataMap does not have access to last loaded map id, so we store it separately
  let lastLoadedMapId = null;

  const _loadMapData = DataManager.loadMapData;
  DataManager.loadMapData = function (mapId) {
    lastLoadedMapId = mapId;
    _loadMapData.call(this, mapId);
  };

  const _dataManagerOnLoad = DataManager.onLoad;
  DataManager.onLoad = function (object) {
    if (object === $dataMap && lastLoadedMapId == 155) {
      // map name = start_the_game
      // overriding page 2 hits the character select screen before
      // character image loading starts

      $dataMap.events[1].pages[2].list = [
        { code: 135, indent: 0, parameters: [0] }, // disables menu access
        { code: 121, indent: 0, parameters: [202, 202, 0] }, // in cutscene = on
        { code: 121, indent: 0, parameters: [410, 410, 0] }, // cannot use bow = on
        { code: 211, indent: 0, parameters: [0] }, // transparency on
        {
          code: 223,
          indent: 0,
          parameters: [[-255, -255, -255, 0], 5, true], // dark screen tint
        },
        {
          code: 231,
          indent: 0,
          parameters: [39, "blackscreen", 0, 0, 0, 0, 100, 100, 255, 0],
        }, // black screen cover
        { code: 121, indent: 0, parameters: [79, 79, 0] }, // START = on
        { code: 313, indent: 0, parameters: [0, 1, 0, 53] },
        { code: 313, indent: 0, parameters: [0, 3, 0, 53] },
        { code: 313, indent: 0, parameters: [0, 4, 0, 53] },
        { code: 313, indent: 0, parameters: [0, 5, 0, 53] },
        { code: 313, indent: 0, parameters: [0, 6, 0, 53] },
        { code: 313, indent: 0, parameters: [0, 13, 0, 53] },
        { code: 313, indent: 0, parameters: [0, 14, 0, 53] },
        { code: 313, indent: 0, parameters: [0, 15, 0, 53] },
        { code: 117, indent: 0, parameters: [34] }, // set starting hunger for all characters
        {
          code: 284,
          indent: 0,
          parameters: ["menu", true, false, 1, 0],
        }, // start termina banner scroll
        {
          code: 223,
          indent: 0,
          parameters: [[0, 0, 0, 0], 5, true], // dark screen tint
        }, // remove screen tint
        {
          code: 232,
          indent: 0,
          parameters: [39, 0, 0, 0, 0, 0, 100, 100, 0, 0, 20, true],
        }, // move black screen cover
        { code: 122, indent: 0, parameters: [1422, 1422, 0, 0, 1] }, // character_choose = 1 (next page)
        { code: 0, indent: 0, parameters: [] },
      ];

      $dataMap.events[1].pages[3].list = [
        {
          code: 355, // custom script code
          indent: 0,
          parameters: ["TerminaAPNewGameMenu.newGameAPOptions();"],
        },
      ];
    }

    _dataManagerOnLoad.call(this, object);
  };
};

TerminaAPNewGameMenu.overrideCharacterSelectMap();

TerminaAPNewGameMenu.overrideConfigManager = function () {
  const _applyData = ConfigManager.applyData;
  ConfigManager.applyData = function (config) {
    _applyData.call(this, config);
    if (config.slotName !== undefined) this.slotName = config.slotName;
    if (config.roomId !== undefined) this.roomId = config.roomId;
    if (config.password !== undefined) this.password = config.password;
  };

  const _makeData = ConfigManager.makeData;
  ConfigManager.makeData = function () {
    const config = _makeData.call(this);
    config.slotName = this.slotName || "";
    config.roomId = this.roomId || "archipelago.gg:";
    config.password = this.password || "";
    return config;
  };
};

TerminaAPNewGameMenu.overrideConfigManager();

function Window_AP() {
  this.initialize.apply(this, arguments);
}

Window_AP.prototype = Object.create(Window_Command.prototype);
Window_AP.prototype.constructor = Window_AP;

Window_AP.prototype.initialize = function () {
  Window_Command.prototype.initialize.call(this, 0, 0);
  this.updatePlacement();
  this.openness = 0;
  this.open();
};

Window_AP.prototype.windowWidth = function () {
  return 640; // arbitrary width
};

Window_AP.prototype.updatePlacement = function () {
  this.x = (Graphics.boxWidth - this.width) / 2;
  this.y = (Graphics.boxHeight - this.height) / 2;
};

Window_AP.prototype.makeCommandList = function () {
  this.addCommand(getAPConfigName("slotName"), "slotName");
  this.addCommand(getAPConfigName("roomId"), "roomId");
  this.addCommand(getAPConfigName("password"), "password");
  this.addCommand(TextManager.cancel, "cancel");
};

function Scene_AP() {
  this.initialize.apply(this, arguments);
}

Scene_AP.prototype = Object.create(Scene_MenuBase.prototype);
Scene_AP.prototype.constructor = Scene_AP;

Scene_AP.prototype.initialize = function () {
  Scene_MenuBase.prototype.initialize.call(this);
};

Scene_AP.prototype.create = function () {
  Scene_MenuBase.prototype.create.call(this);
  this.createCommandWindow();

  // add connection status
  this._clientStatusWindow = new ConnectionStatus(0, 0, "center");
  this.addChild(this._clientStatusWindow);
};

Scene_AP.prototype.stop = function () {
  Scene_MenuBase.prototype.stop.call(this);
  this._commandWindow.close();
};

Scene_AP.prototype.createBackground = function () {
  Scene_MenuBase.prototype.createBackground.call(this);
  this.setBackgroundOpacity(128);
};

Scene_AP.prototype.createCommandWindow = function () {
  this._commandWindow = new Window_AP();
  this._commandWindow.setHandler("slotName", this.commandSlotName.bind(this));
  this._commandWindow.setHandler("roomId", this.commandRoomId.bind(this));
  this._commandWindow.setHandler("password", this.commandPassword.bind(this));
  this._commandWindow.setHandler("cancel", this.popScene.bind(this));
  this.addWindow(this._commandWindow);
};

Scene_AP.prototype.commandSlotName = function () {
  window.openAPNameInput("slotName", 16);
};
Scene_AP.prototype.commandRoomId = function () {
  window.openAPNameInput("roomId", 30);
};

Scene_AP.prototype.commandPassword = function () {
  window.openAPNameInput("password", 12);
};
Scene_Menu.prototype.commandArchipelago = function () {
  SceneManager.push(Scene_AP);
};

const _sceneMenucreateCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function () {
  _sceneMenucreateCommandWindow.call(this);
  this._commandWindow.setHandler(
    "archipelago",
    this.commandArchipelago.bind(this),
  );
  console.log(this._list);
};

const _makeCommandList = Window_MenuCommand.prototype.makeCommandList;
Window_MenuCommand.prototype.makeCommandList = function () {
  _makeCommandList.call(this);

  // temporarily remove the quit command so AP can be before it
  const quitCommand = this._list.pop();

  this.addCommand("Archipelago", "archipelago", true);
  this._list.push(quitCommand);
};

const _drawItem = Window_MenuCommand.prototype.drawItem;
Window_MenuCommand.prototype.drawItem = function (index) {
  if (this.commandSymbol(index) === "archipelago") {
    const rect = this.itemRectForText(index);
    const textAlign = this.itemTextAlign();
    // this might be a yanfly quirk but all the icons are drawn with the reduced opacity you get from them being unselectable
    this.changePaintOpacity(false);
    // icon 64 is the letter A icon
    // the x - 4 is completely arbitrary; when i dont have it the icon is too far to the right
    this.drawIcon(64, rect.x - 4, rect.y, rect.width, textAlign);
  } else {
    _drawItem.call(this, index);
  }
};

// we need a period in the allowed characters for the server domain
// adding a period permanently to the characterset shouldnt be too intrusive
// since latin1 already has a space
Window_NameInput.LATIN2[Window_NameInput.LATIN2.findIndex((c) => c === "")] =
  ".";
