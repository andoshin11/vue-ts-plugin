# Plugin Context

1. Plugin Context will be loaded lazily

Plugin Conext gets activated only after you call `PluginContext.load` with `info: ts.server.PluginCreateInfo`.
(Whay you may call as lazy-load instance!)

2. Plugin Context overrides TypeScript default behavior

Inside the `PluginContext.load` method, these TypeScript layers listed below are patched with custom behaviors.

- Server Host
- Project Service
- Language Service Host

Here's How & Why.

### Server Host

TS Server Host is responsible for overall system file accesses.(i.e. check file existence, and read/write files.)

Since the plugin handles virtual `.vue.ts` files along with actual `.vue` files, we need to somehow trick the Server Host to handle these virtual files as if they actually exist in the real world.

For the better performance sake, we also take advantages of overriding the Server Host behaviors to use on-memory cache and virtual wile watchers.

### Project Service

TS Project Service is responsible for the project specific system configurations.

We override this layer mainly because to make the TS Server to recognize `.vue` files, which she can't even access by default.

### Language Service Host
TBD
