# Symfony for VS Code

This extension aims to help developing Symfony2+ projects, by showing services and routes of your current project.

## Features

This extension add a new view, the *Symfony Debug View*, to visualize the status of your project container and routes. With this, you can :
* know which controller action is binded to a route
* know which class is binded to a service
* see all services aliases
* ...

## How does it works ?

To detect Symfony projects, this extension rely on `composer.json` files with `symfony/symfony` as one of its dependencies.

The `composer.json` file is supposed to be at the root of your Symfony project.

When the project is detected, it simply uses the `debug:container` and `debug:router` console commands to hydrate the views.

## Extension Settings

This extension contributes the following settings:

* `symfony-vscode.showConsoleErrors`: Set this to false if you don't want to be annoyed by the extension everytime command calls fails.
* `symfony-vscode.phpPath`: the path of the PHP executable.
* `symfony-vscode.consolePath`: when the console is somewhere else than `bin/console` (or `app/console` for Symfony 2), override this setting.
* `symfony-vscode.showAsseticRoutes`: By default, the route view doesn't show routes generated by AsseticBundle. Set this to true if you want to see them.
* `symfony-vscode.detectCwd`: By default, the extension guess the root directory of your Symfony project to execute console commands from. Set this to false if you don't want that.

## Troubleshooting

Q: I run my Symfony project on Docker. How do I configure the extension ?

A: You have to override the PHP executable path, and disable the root directory auto-detection, like this :
```json
{
    "symfony-vscode.detectCwd": false,
    "symfony-vscode.phpPath": "docker exec -it docker_php_1 /bin/sh -c \"cd /app/www && /usr/bin/php\""
}
```

## Release Notes

### 0.0.2

* Added the `detectCwd` setting to help with Symfony projects on Docker
* Added more logging of errors
    * Added the `showConsoleErrors` setting to hide errors from the Symfony console

### 0.0.1

Initial preview release