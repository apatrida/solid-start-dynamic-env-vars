# SolidStart - Load Env Variables dynamically for the client

SolidStart will load `VITE_*` env variables into the client if they are available at build time.
There is no support for <b>dynamic loading</b> of variables only at runtime. This is problematic if you 
are using docker containers and do not want to bake in the variables at build time but rather allow the
same container to run in various environments.

The main files to look at:
    * [`root.tsx`](src/root.tsx) (the context provider)
    * [`lib/EnvConfiguration.tsx`](src/lib/EnvConfiguration.tsx) (configuration loader, context provider, hook)
    * [`routes/index.tsx`](src/routes/index.tsx) (using the hook in all possible places on client-side for testing including effects, mount, route data, and route data refetch)

All other branches other than `main` are various attempts with different problems.  The final answer turns out to be the most straight forward and better code.

before running, set these variables to your console:

```shell
export VITE_SOME_VALUE="some_value from VITE prefix"
export VITE_OTHER_VALUE="other value from VITE prefix"
export SOMETHING="something directly references"
export WHATEVER="whateva"
```

then you can test in dev mode (but this works dynamically with `VITE_*` already in Solid Start using `import.env.VARNAME`)
```shell
npm run dev -- --open
```

the real test is to build the app in another terminal WITHOUT the above varaibles set:

```shell
npm run build
```

and then run in another terminal where they ARE set:
```shell
npm start
```
