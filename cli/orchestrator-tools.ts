import chalk from "npm:chalk";
import * as Commander from "npm:@commander-js/extra-typings";
import { copy, exists } from "jsr:@std/fs";
import { GenericError } from "../models/GenericError.ts";

type ExecuteTaskAsyncResult =
  | [string, null]
  | [null, GenericError<{ code: number }>];

async function executeTaskInPluginsRepo(
  task: "tsc" | "build" | "export-dynamic",
  pluginPath: string,
  pluginsRepoDir: string,
): Promise<ExecuteTaskAsyncResult> {
  const cmd = new Deno.Command(`yarn`, {
    args: [
      `--cwd=${pluginPath}`,
      task,
    ],
    cwd: pluginsRepoDir,
  });
  const child = cmd.spawn();
  const { code } = await child.output();
  if (code !== 0) {
    const error = new GenericError<{ code: number }>(
      `Task ${chalk.yellow(task)} ${chalk.red("failed")} for ${
        chalk.yellow(pluginPath)
      }`,
      {
        cause: { code },
      },
    );
    return [null, error];
  } else {
    return [
      `Task ${chalk.yellow(task)} ${chalk.green("succeeded")} for ${
        chalk.yellow(pluginPath)
      }`,
      null,
    ];
  }
}

function logOrExit([output, error]: ExecuteTaskAsyncResult): void {
  if (error) {
    console.error(error.message);
    Deno.exit(error.cause?.code ?? -1);
  } else {
    console.log(output);
  }
}

async function validateDirExistsSync(path: string) {
  if (!await exists(path, { isDirectory: true })) {
    throw new Deno.errors.NotFound(`Path not found: ${path}`);
  }
}

const { program } = Commander;
program
  .name("orchestrator-tools")
  .description(
    "Builds the Orchestrator FE+BE plugins and installs them in backstage-showcase",
  )
  .version("1.0.0")
  .argument(
    "<showcase-repo-dir>",
    "The path janus-idp backstage-showcase repository was cloned to",
  )
  .argument(
    "<plugins-repo-dir>",
    "The path janus-idp backstage-plugins repository was cloned to",
  )
  .action(async (showcaseRepoDir, pluginsRepoDir) => {
    const realShowcaseRepoDir = Deno.realPathSync(showcaseRepoDir);
    validateDirExistsSync(realShowcaseRepoDir);
    const realPluginsRepoDir = Deno.realPathSync(pluginsRepoDir);
    validateDirExistsSync(realPluginsRepoDir);

    const tasks = ["tsc", "build", "export-dynamic"] as const;
    let result: ExecuteTaskAsyncResult | undefined;

    for (const task of tasks) {
      result = await executeTaskInPluginsRepo(
        task,
        "plugins/orchestrator",
        realPluginsRepoDir,
      );
      logOrExit(result);
    }

    let path =
      `${realShowcaseRepoDir}/dynamic-plugins-root/janus-idp_backstage-plugin-orchestrator`;
    if (await exists(path)) {
      console.log(`Cleaning up: ${chalk.grey(path)}`);
      Deno.removeSync(path, { recursive: true });
    }

    Deno.mkdirSync(path);
    const assets = ["package.json", "dist", "dist-scalprum"];
    for (const asset of assets) {
      const from = `${realPluginsRepoDir}/plugins/orchestrator/${asset}`;
      const to = `${path}/${asset}`;
      console.log(
        `Copying ${chalk.cyanBright(from)} -> ${chalk.cyanBright(to)}`,
      );
      await copy(from, to, { overwrite: true });
    }

    for (const task of tasks) {
      result = await executeTaskInPluginsRepo(
        task,
        "plugins/orchestrator-backend",
        realPluginsRepoDir,
      );
      logOrExit(result);
    }

    path =
      `${realShowcaseRepoDir}/dynamic-plugins-root/janus-idp_backstage-plugin-orchestrator-backend-dynamic`;
    if (await exists(path)) {
      console.log(`Cleaning up: ${chalk.grey(path)}`);
      Deno.removeSync(path, { recursive: true });
    }

    Deno.mkdirSync(path);
    const from =
      `${realPluginsRepoDir}/plugins/orchestrator-backend/dist-dynamic`;
    const to = path;
    console.log(
      `Copying ${chalk.cyanBright(from)} -> ${chalk.cyanBright(to)}`,
    );
    await copy(from, to, { overwrite: true });
  });

await program.parseAsync(Deno.args, { from: "user" });
