#!/usr/bin/env node
//define o caminho do node

/*
    chmod +x index.js
*/
//define a permissão 
/*
dar a opção de mais formas de executar
bash node index.js
bash ./index.js
*/
/*
    -- para colocar projeto no npm como pacote:
        npm login
        npm publish --access public
    --pra tirar esse comando do global: npm unlink -g @julianop099/hacker-chat-client
    -- para tirar o projeto de produção: npm unpublish --force
    hacker-chat \
    --username juliano \
    --room sala01 \
*/
/*
    ./index.js \
    --username juliano \
    --room sala01 \
*/
/*
    //npm run user01 (está no json)
    (cola tudo junto no terminal)
    node index.js \
    --username juliano \
    --room sala01 \
    --hostUri localhost
*/


import Events from 'events'
import CliConfig from './src/cliConfig.js';
import EventManager from './src/eventManager.js';
import SocketClient from './src/socket.js';
import TerminalController from "./src/terminalController.js";

const [nodePath, filePath, ...commands] = process.argv

const config = CliConfig.parseArguments(commands)

//console.log('config', config)

const componentEmitter = new Events()
const socketClient = new SocketClient(config)
await socketClient.initialize()
const eventManager = new EventManager({ componentEmitter, socketClient })

const events = eventManager.getEvents()

socketClient.attachEvents(events)

const data = {
    roomId: config.room,
    userName: config.username
}
eventManager.joinRoomAndWaitForMessages(data)



const controller = new TerminalController()
await controller.initializeTable(componentEmitter)

