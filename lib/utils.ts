// Utility functions and helpers
// This file will contain shared utilities

export function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
