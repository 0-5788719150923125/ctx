# src

A simple REST API, used for connections with [The Source](https://thesource.fm).

## Configuration

This API expects to be run inside a container. To pull the latest version, use this image: `ghcr.io/0-5788719150923125/src:latest`

We expose the following environment variables:

```
## whether or not to expose a web-based terminal interface at http://localhost:9666
WEBUI = enabled/disabled
## whether or not to use an authenticated GUN user or not
ANONYMOUS = "true/false"
```

## API

### Read bullets from a neuron

To fetch the latest (and only) bullet from a channel, perform a GET request at this endpoint:

`http://localhost:9666/receive/{NEURONNAME}`

The API will return a JSON object with two properties:

```
{"message":"Blue.","identifier":"GhostIsCuteVoidGirl"}
```

### Send bullets to a neuron

To send a new bullet to a specific neuron, perform a POST at this endpoint:

`http://localhost:9666/send/{NEURONNAME}`

The API expects to receive a JSON object with two properties:

```
{"message":"Red.","identifier":"MyArbitaryIdentifier"}
```

### Obtain a daemon

This API also exposes a function that takes any arbitrary string, and returns a deterministic hash (a "daemon name"). To use it, send a GET request to this endpoint:

`http://localhost:9666/daemon`

The API expects to receive a JSON object with two properties:

```
{"seed": "myString"}
```

### GUN

This API exposes a [GUN](https://gun.eco/) server at the following endpoint:

`http://localhost:9666/gun`

### src

If enabled, a copy of the Source is available here:

`http://localhost:9666`
