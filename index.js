import { execSync } from 'child_process'
import express from 'express'
import { WebSocketServer } from 'ws'
import Gun from 'gun'
import SEA from 'gun/sea.js'
import 'gun/lib/webrtc.js'

// User config options
const port = process.env.PORT || 9666
const UI = process.env.WEBUI || 'enabled'
const anonymous = process.env.ANONYMOUS || 'true'
let pair = null

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
    radisk: true,
    axe: false
})

// Enable the web UI
if (UI === 'enabled') {
    try {
        execSync('rm -rf dist/*')
        execSync(
            'curl -sSL "https://gitlab.com/the-resistance/src.eco/-/jobs/5759914351/artifacts/download?file_type=archive" -o public.zip'
        )
        execSync('unzip public.zip -d dist')
        execSync('rm public.zip')
        app.use(express.static('/src/dist/public'))
        app.get('/', (req, res) => {
            res.sendFile('/src/dist/public/index.html')
        })
        console.log('Webserver bootstrap success: http://localhost:9666')
    } catch (error) {
        console.error('Error during webserver bootstrap:', error)
    }
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

// Generate credentials
let user = null
const identity = randomString(randomBetween(96, 128))
let identifier = randomString(64)

// Create a GUN user
async function authenticateUser(identity, identifier) {
    console.log('identity :> [REDACTED]')
    identifier = randomString(64)
    console.log('identifier :> ' + identifier)
    if (anonymous === 'true') return
    console.log('authenticating with CTX')
    try {
        user = gun.user()
        pair = user.pair()
        user.create(identifier, identity, async (data) => {
            console.log('Created new GUN user: ~' + data.pub)
        })
    } catch (err) {
        console.error(err)
    }
}

// Authenticate with GUN
authenticateUser(identity, identifier)
