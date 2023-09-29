import express from 'express'
import { WebSocketServer } from 'ws'
import Gun from 'gun'
import SEA from 'gun/sea.js'

// User config options
const port = process.env.PORT || 9666
const UI = process.env.WEBUI || 'enabled'
const anonymous = process.env.ANONYMOUS || 'true'

// Start the web server
const app = express()
const server = app.listen(port, () => {
    console.log(`CTX is exposed on port: ${port}`)
})

// Connect to GUN
const bootstrapPeers = ['wss://59.src.eco/gun', 'wss://95.src.eco/gun']
const gun = Gun({
    peers: bootstrapPeers,
    file: `./gun`,
    localStorage: false,
    radisk: false,
    axe: false
})

// Enable the web UI
if (UI === 'enabled') {
    app.use(express.static('/src/public/dist'))
    app.get('/', (req, res) => {
        res.sendFile('/src/public/dist/index.html')
    })
}

// // Serve a local websockets API
const ws = new WebSocketServer({ server, path: '/ws' })
ws.on('connection', async (ws, request) => {
    ws.on('message', async (message) => {
        await handleMessage(ws, message)
    })
    ws.on('close', (code, reason) => {
        ws.close()
    })
})

gun.get('src').on((data) => {})

async function managePeers() {
    const peers = gun.back('opt.peers')
    for (const i of bootstrapPeers) {
        const state = peers[i]?.wire?.readyState
        if (state === 0 || state === null || typeof state === 'undefined') {
            gun.opt({ peers: [...bootstrapPeers] })
        }
    }
    setTimeout(managePeers, 15000)
}

managePeers()

const listeners = {}
async function handleMessage(ws, message) {
    const payload = JSON.parse(message.toString())
    if (payload.seed) {
        return ws.send(
            JSON.stringify({ name: ng.generateOne(payload.seed.toString()) })
        )
    }
    if (payload.message) {
        try {
            // Destructure and sign message
            let { message, identifier, mode } = payload
            let pubKey = null
            if (user) {
                try {
                    let signed = null
                    if (anonymous === 'false') {
                        signed = await SEA.sign(message, pair)
                        pubKey = pair.pub
                    }
                    message = signed
                } catch {
                    // pass
                }
            }
            // Send message to GUN
            const bullet = JSON.stringify({
                focus: payload.focus,
                identifier,
                message,
                pubKey,
                mode
            })
            listeners[payload.focus].put(bullet)
        } catch (err) {
            console.error(err)
            authenticateUser(identity, identifier)
        }
        return
    }
    if (payload.focus) {
        listeners[payload.focus] = gun
            .get('src')
            .get('bullets')
            .get(payload.focus)
            .on(async (node, key) => {
                try {
                    if (typeof node === 'string') {
                        const bullet = JSON.parse(node)
                        let message = 'ERROR: Me Found.'
                        if (
                            bullet.pubKey !== null &&
                            typeof bullet.pubKey !== 'undefined'
                        ) {
                            const sender = await gun.user(bullet.pubKey)
                            if (typeof sender === 'undefined') {
                                message = bullet.message
                            } else
                                message = await SEA.verify(
                                    bullet.message,
                                    sender.pub
                                )
                        } else {
                            message = bullet.message
                        }
                        ws.send(
                            JSON.stringify({
                                focus: key,
                                message: message.toString(),
                                identifier: bullet.identifier
                            })
                        )
                    } else {
                        ws.send(
                            JSON.stringify({
                                focus: key,
                                message: 'ERROR: Me Found.',
                                identifier: 'GhostIsCuteVoidGirl'
                            })
                        )
                    }
                } catch {
                    // Pass
                }
            })
    }
}

// All following routes will use JSON
app.use(express.json())

// Get a random number between two others
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

// Generate credentials
let user = null
const identity = randomString(randomBetween(96, 128))
const identifier = randomString(64)

// Create a GUN user
let pair = null
async function authenticateUser(identity, identifier) {
    console.log('identity :> [REDACTED]')
    console.log('identifier :> ' + identifier)
    console.log('loading into CTX')
    if (anonymous === 'true') return
    try {
        user = gun.user()
        user.auth(identifier, identity, async (data) => {
            if (data.err) {
                user.create(identifier, identity, async (data) => {
                    console.log('Creating GUN user: ~' + data.pub)
                    await authenticateUser(identity, identifier)
                })
            } else {
                pair = user.pair()
                console.log('Authenticated GUN user: ~' + pair.pub)
            }
        })
    } catch (err) {
        console.error(err)
    }
}

// Authenticate with GUN
authenticateUser(identity, identifier)

// Generate a random string
function randomString(length) {
    let result = ''
    const characters = 'abcdef0123456789'
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
        counter += 1
    }
    return result
}
