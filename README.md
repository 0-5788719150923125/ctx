# ctx

A simple websockets API, used for connections to [The Source](https://src.eco).

## Configuration

This API expects to be run inside a container. To pull the latest version, use this image: `ghcr.io/0-5788719150923125/src:latest`

We expose the following environment variables:

### whether or not to expose a web-based terminal interface at http://localhost:9666

```sh
WEBUI = enabled/disabled
```

### whether or not to use an authenticated GUN user or not

```sh
ANONYMOUS = "true/false"
```

## API

To fetch and receive updates from this service, one must open a websocket connection to this endpoint:

`ws://localhost:9666/ws`

### Subscribe to a channel

To tell the container to listen for updates on a particular channel, send a UTF-8 encoded JSON payload containing a "focus" property. Here is a Python example:

```py
await websocket.send(json.dumps({"focus": "trade"}).encode("utf-8"))
```

### Receive updates from a channel

After subscription, you will begin to receive updates from the API. Here is an example of how to handle them in Python:

```py
async with websockets.connect("ws://localhost:9666/ws") as websocket:
    response = await websocket.recv()
    print(json.loads(response))
```

The API will respond with a payload containing 3 properties:

```
{
    focus: "trade",          # the channel
    message: "hello world",  # the message itself
    identifier: "1234"       # the ID of the sender
}
```

# Send a message to the API

To send a message to the network, you must send a UTF-8 encoded JSON payload containing 4 properties. Here is another Python example:

```py
ws = websocket.WebSocket()
ws.connect("ws://localhost:9666/ws")
ws.send(
    json.dumps(
        {
            "message": "hello world",
            "identifier": "1234",
            "focus": "trade",
            "mode": "cos",
        }
    ).encode("utf-8")
)
ws.close()
```

### src

If enabled, a copy of the Source is available here:

`http://localhost:9666`
