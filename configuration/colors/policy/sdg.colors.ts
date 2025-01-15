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

function generateShades(
    hexColor: string,
    shades: number,
    minLightness: number,
    maxLightness: number
): string[] {
    // Helper function to convert hex to HSL
    function hexToHsl(hex: string): { h: number; s: number; l: number } {
        let r = parseInt(hex.substring(1, 3), 16) / 255;
        let g = parseInt(hex.substring(3, 5), 16) / 255;
        let b = parseInt(hex.substring(5, 7), 16) / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let delta = max - min;

        let h = 0;
        if (delta !== 0) {
            if (max === r) {
                h = ((g - b) / delta) % 6;
            } else if (max === g) {
                h = (b - r) / delta + 2;
            } else {
                h = (r - g) / delta + 4;
            }
        }
        h = Math.round(h * 60);
        if (h < 0) h += 360;

        let l = (max + min) / 2;
        let s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        return { h, s: s * 100, l: l * 100 };
    }

    // Helper function to convert HSL to hex
    function hslToHex(h: number, s: number, l: number): string {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r = 0, g = 0, b = 0;
        if (h >= 0 && h < 60) {
            r = c;
            g = x;
        } else if (h >= 60 && h < 120) {
            r = x;
            g = c;
        } else if (h >= 120 && h < 180) {
            g = c;
            b = x;
        } else if (h >= 180 && h < 240) {
            g = x;
            b = c;
        } else if (h >= 240 && h < 300) {
            r = x;
            b = c;
        } else if (h >= 300 && h < 360) {
            r = c;
            b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${ ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase() }`;
    }

    const hsl = hexToHsl(hexColor);
    const shadesArray: string[] = [];
    const lightnessStep = (maxLightness - minLightness) / (shades - 1);

    for (let i = 0; i < shades; i++) {
        const currentLightness = minLightness + lightnessStep * i;
        shadesArray.push(hslToHex(hsl.h, hsl.s, currentLightness));
    }

    return shadesArray;
}

export const SDG_COLOR_SHADES = {
    colors: SDG_COLORS.colors.map((baseColor) => generateShades(baseColor, 10, 20, 85))
};
