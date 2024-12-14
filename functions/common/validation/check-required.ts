export function checkRequired(params: { [key: string]: any }): { missing: string[] } {
    return {
        missing: Object.keys(params).filter(param => params[param] === undefined)
    };
}