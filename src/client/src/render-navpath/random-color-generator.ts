// List of colors to choose from
let colors = [
    '#00aaff', // Blue
    '#ff9500', // Orange
    '#90f56e', // Green
    '#db6581', // Pink
    '#b35db3', // Purple
];

/**
 * Generate a random color from the list of colors
 */
function getRandomColor(): string {
    return colors[Math.floor(Math.random() * colors.length)];
}

export { getRandomColor };