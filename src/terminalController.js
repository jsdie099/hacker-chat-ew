import { constants } from "./constants.js"
import ComponentBuilder from "./components.js"

export default class TerminalController {
    #usersCollors = new Map()
    constructor(){

    }

    #pickCollor(){
        return `#` + ((1 << 24) * Math.random() | 0).toString(16) + '-fg'
    }

    #getUserCollor(userName){
        if(this.#usersCollors.has(userName)) 
            return this.#usersCollors.get(userName)
        
        const collor = this.#pickCollor()
        this.#usersCollors.set(userName, collor)

        return collor
    }

    #onInputReceived(eventEmitter){
        return function(){
            const message = this.getValue()
            
            eventEmitter.emit(constants.events.app.MESSAGE_SENT, message)
            
            this.clearValue()
        }
    }

    #onMessageReceived({ screen, chat }){
        return msg => {
            const { userName, message} = msg
            const collor = this.#getUserCollor(userName)

            chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`)

            screen.render()
        }
    }

    #onlogChanged({ screen, activityLog }){

        return msg => {
            //juliano left
            //juliano join
            //separa a mensagem por espaços
            const [userName] = msg.split(/\s/)
            const collor =  this.#getUserCollor(userName)
            activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`)

            screen.render()
        }
    }

    #onStatusChanged({ screen, status }){
        // [ 'juliano', 'joao', 'alex']
        return users => {
        
            //vamos pegar o primeiro elemento da lista
            const {content} = status.items.shift()
            status.clearItems()
            status.addItem(content)

            users.forEach(userName => {
                const collor =  this.#getUserCollor(userName)
                status.addItem(`{${collor}}{bold}${userName}{/}`)
            })

            screen.render()
        }
    }

    #registerEvents(eventEmitter, components){
        /* eventEmitter.emit('turma01', 'hey')

        eventEmitter.on('turma01', msg => console.log(msg.toString())) */

        eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
        eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onlogChanged(components))
        eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChanged(components))
    }

    async initializeTable(eventEmitter){
        const components = new ComponentBuilder()
            .setScreen({ title: 'HackerChat - Juliano'})
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmitter))
            .setChatComponent()
            .setActivityLogComponent()
            .setStatusComponent()
            .build()
        
        this.#registerEvents(eventEmitter, components)

        components.input.focus()
        components.screen.render()

        /* setInterval(() => {
            const users = ['juliano']

            eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {message:'hey', userName: 'juliano'})
            eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {message:'ho', userName: 'joao'})
            eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, {message:'ho', userName: 'alex'})

            eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'juliano left')
            eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'juliano join')
            eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'joao join')
            eventEmitter.emit(constants.events.app.ACTIVITYLOG_UPDATED, 'alex left')

            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('alex')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('maria', 'zepovinho')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('claudio', 'trollbr')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
        }, 1000) */
    }
}