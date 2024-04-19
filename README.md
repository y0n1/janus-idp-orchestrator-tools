# janus-idp-scripts

Builds the orchestrator packages in backstage-plugins and copies the artifacts into backstage-showcase.

## Instruction
1. [Install Deno](https://docs.deno.com/runtime/manual/getting_started/installation)
2. Clone this repo
3. Install the script:  
    ```sh
    deno install \
        --allow-write \
        --allow-read \
        --allow-run=yarn  \
        --allow-env=FORCE_COLOR,TF_BUILD,TERM,CI,TEAMCITY_VERSION,COLORTERM \
        cli/orchestrator-tools.ts
    ```
4. Cache dependencies, so they don't have to be fetched on every invocation:
    ```sh
    deno cache --lock=deno.lock cli/orchestrator
    ```
3. Execute it:
    ```sh
    $ orchestrator-tools --help
    Usage: orchestrator-tools-cli [options] <showcase-repo-dir> <plugins-repo-dir>

    Builds the Orchestrator FE+BE plugins and installs them in backstage-showcase

    Arguments:
    showcase-repo-dir  The path janus-idp backstage-showcase repository was cloned to
    plugins-repo-dir   The path janus-idp backstage-plugins repository was cloned to

    Options:
    -V, --version      output the version number
    -h, --help         display help for command
    ```
