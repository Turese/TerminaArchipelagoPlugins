# Overview

This is a collection of plugins making up the game client for the Fear and Hunger: Termina AP randomizer.

## archipelago.js

2.1 build of [archipelago.js](https://archipelago.js.org/stable/)

## TerminaAPClient.js

connects to archipelago js and manages  ap state

## TerminaAPConnectionStatus.js

Manages connection status indicator that appears in the corner of most game maps

## TerminaAPNewGameMenu.js

Overwrites character select screen to facilitate connection to AP multiworld and using info from options for character selection + difficulty

# Installing

Add the following lines to the bottom of Fear and Hunger: Termina's `plugins.js` file

```
{"name":"archipelago","status":true,"description": "archipelago.js build","parameters":{}},
{"name":"TerminaAPClient","status":true,"description": "Termina AP Client","parameters":{}},
{"name":"TerminaAPConnectionStatus","status":true,"description": "Termina AP Connection","parameters":{}},
{"name":"TerminaAPNewGameMenu","status":true,"description": "Termina AP Character Select","parameters":{}}
```