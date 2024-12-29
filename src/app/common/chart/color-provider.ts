const sdgColors: Record<number, string> = {
    1: "#E5233D",
    2: "#DDA73A",
    3: "#4CA146",
    4: "#C5192D",
    5: "#EF402C",
    6: "#27BFE6",
    7: "#FBC412",
    8: "#A31C44",
    9: "#F26A2D",
    10: "#E01483",
    11: "#F89D2A",
    12: "#BF8D2C",
    13: "#407F46",
    14: "#1F97D4",
    15: "#59BA48",
    16: "#126A9F",
    17: "#13496B",
}

export class ColorProvider {

    public static getColorForSDG(sdg: number) {
        return sdgColors[sdg] || '#000';
    }
}