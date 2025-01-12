export const SDG_COLORS = {
    colors: [
        '#e5243b',
        '#DDA63A',
        '#4C9F38',
        '#C5192D',
        '#FF3A21',
        '#26BDE2',
        '#FCC30B',
        '#A21942',
        '#FD6925',
        '#DD1367',
        '#FD9D24',
        '#BF8B2E',
        '#3F7E44',
        '#0A97D9',
        '#56C02B',
        '#00689D',
        '#19486A',
    ]
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
    hex = hex.replace(/^#/, '');

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    const delta = max - min;

    if (delta !== 0) {
        s = l < 0.5 ? delta / (max + min) : delta / (2 - max - min);

        if (max === rNorm) {
            h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        } else if (max === gNorm) {
            h = (bNorm - rNorm) / delta + 2;
        } else {
            h = (rNorm - gNorm) / delta + 4;
        }
        h /= 6;
    }

    return {
        h: h * 360,
        s,
        l,
    };
}

function hslToHex(h: number, s: number, l: number): string {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    const to255 = (val: number) => Math.round((val + m) * 255);
    const rVal = to255(r);
    const gVal = to255(g);
    const bVal = to255(b);

    const toHex = (val: number) => {
        const hexString = val.toString(16);
        return hexString.length === 1 ? '0' + hexString : hexString;
    };

    return `#${ toHex(rVal) }${ toHex(gVal) }${ toHex(bVal) }`.toUpperCase();
}

function generateShades(
    baseHex: string,
    numberOfShades: number,
    minLightness: number,
    maxLightness: number
): string[] {
    const { h, s } = hexToHsl(baseHex);
    const shades: string[] = [];

    for (let i = 0; i < numberOfShades; i++) {
        const t = i / (numberOfShades - 1);
        const newLightness = minLightness + t * (maxLightness - minLightness);
        shades.push(hslToHex(h, s, newLightness));
    }

    return shades.reverse();
}

export const SDG_COLOR_SHADES = {
    colors: SDG_COLORS.colors.map((baseColor) => generateShades(baseColor, 10, 0.95, 0.3))
};
