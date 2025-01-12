export function sortBySdg(a: string, b: string): number {
    const [ , aNumStr ] = a.split(' ');
    const [ , bNumStr ] = b.split(' ');

    const aNum = parseInt(aNumStr, 10);
    const bNum = parseInt(bNumStr, 10);

    return aNum - bNum;
}
