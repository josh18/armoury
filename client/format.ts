import chalk from 'chalk';
import { StatsError } from 'webpack';

function uppercaseFirst(value: string) {
    return value[0].toUpperCase() + value.slice(1);
}

export function formatError(error: StatsError) {
    return chalk.red('Error') + '\n' + uppercaseFirst(error.message);
}

export function formatWarning(warning: StatsError) {
    return chalk.yellow('WARNING') + '\n' + uppercaseFirst(warning.message);
}

function wrapColor(code: number) {
    return (value: string) => `\x1B[${code}m${value}\x1B[0m`;
}

export const color = {
    red: wrapColor(31),
    green: wrapColor(32),
    yellow: wrapColor(33),
    cyan: wrapColor(36),
};

export function clearConsole() {
    process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
}
