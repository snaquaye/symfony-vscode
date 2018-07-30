import * as vscode from "vscode"
import * as path from "path"

import { ContainerProviderInterface } from "./ContainerProviderInterface";
import { ServiceDefinition } from "../ServiceDefinition";
import { execSync, ExecSyncOptions } from "child_process";
import { ComposerJSON } from "../ComposerJSON";
import { RouteDefinition } from "../RouteDefinition";

class CommandOptions implements ExecSyncOptions {
    cwd: string = ""
    constructor(rootDirectory: string) {
        this.cwd = rootDirectory
    }
}

export class ConsoleProvider implements ContainerProviderInterface {

    private _configuration = vscode.workspace.getConfiguration("symfony-vscode")
    private _composerJson: ComposerJSON = new ComposerJSON()

    provideServiceDefinitions(): Promise<ServiceDefinition[]> {
        let showErrors = this._configuration.get("showConsoleErrors")
        return new Promise((resolve, reject) => {
            this._getDebugCommand("debug:container --show-private").then(infos => {
                let result: ServiceDefinition[] = []
                let collection: Object = {}
                try {
                    let buffer = execSync(infos.cmd, this._configuration.get("detectCwd") ? new CommandOptions(infos.cwd) : undefined).toString()
                    let obj = JSON.parse(buffer)
                    if(obj.definitions !== undefined) {
                        Object.keys(obj.definitions).forEach(key => {
                            collection[key] = (new ServiceDefinition(key, obj.definitions[key].class, obj.definitions[key].public, null))
                        })
                    }
                    if(obj.aliases !== undefined) {
                        Object.keys(obj.aliases).forEach(key => {
                            let alias = obj.aliases[key].service
                            let className = collection[alias] ? collection[alias].className : null
                            collection[key] = (new ServiceDefinition(key, className, obj.aliases[key].public, alias))
                        })
                    }
                    Object.keys(collection).forEach(key => {
                        result.push(collection[key])
                    });
                    resolve(result)
                } catch (e) {
                    if(showErrors) {
                        reject(e.message)
                    } else {
                        resolve([])
                    }
                }
            }).catch(reason => reject(reason))
        })
    }

    provideRouteDefinitions(): Promise<RouteDefinition[]> {
        let showErrors = this._configuration.get("showConsoleErrors")
        let showAsseticRoutes = this._configuration.get("showAsseticRoutes")
        return new Promise((resolve, reject) => {
            this._getDebugCommand("debug:router").then(infos => {
                let result: RouteDefinition[] = []
                try {
                    let buffer = execSync(infos.cmd, this._configuration.get("detectCwd") ? new CommandOptions(infos.cwd) : undefined).toString()
                    let obj = JSON.parse(buffer)
                    Object.keys(obj).forEach(key => {
                        if(!(!showAsseticRoutes && key.match(/^_assetic_/))) {
                            result.push(new RouteDefinition(key, obj[key].path, obj[key].method, obj[key].defaults._controller))
                        }
                    })
                    result.sort((a, b) => {
                        if(a.id < b.id) {
                            return -1
                        }
                        if(a.id > b.id) {
                            return 1
                        }
                        return 0
                    })
                    resolve(result)
                } catch(e) {
                    if(showErrors) {
                        reject(e.message)
                    } else {
                        resolve([])
                    }
                }
            }).catch(reason => reject(reason))
        })
    }

    private _getDebugCommand(symfonyCommand: string): Promise<{cmd: string, cwd: string}> {
        return new Promise((resolve, reject) => {
            this._composerJson.initialize()
                .then(infos => {
                    let cmd = this._getPhpExecutablePath() + " "

                    let customConsolePath = this._configuration.get("consolePath")
                    if(customConsolePath) {
                        cmd += customConsolePath + " "
                    } else {
                        switch (infos.symfonyVersion) {
                            case 2:
                                cmd += "app/console "
                                break;
                            case 3:
                            default:
                                cmd += "bin/console "
                                break;
                        }
                    }

                    cmd += symfonyCommand + " --format=json"
                    resolve({
                        cmd: cmd,
                        cwd: path.dirname(infos.uri.fsPath)
                    })
                }).catch(reason => reject(reason))
        })
    }

    private _getPhpExecutablePath(): string {
        return this._configuration.get("phpPath")
    }
}