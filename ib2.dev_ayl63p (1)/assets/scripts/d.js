function setup() {
    const target = document.querySelector(".backgroundImage");
    if (!target)
        return;

    noCanvas();
    let artBuffer = createGraphics(2560, 1440);

    generateArt(artBuffer);

    const dataURL = artBuffer.elt.toDataURL("image/png");

    target.style.backgroundImage = `url(${dataURL})`;
    artBuffer.remove();
}

function generateArt(buffer) {
    let cols = 1 + floor(buffer.width / 8);
    let rows = 1 + floor(buffer.height / 8);
    let resolution = 8;
    let field = [];

    buffer.background(20, 22, 28);
    
    const z = random(100);
    for (let i = 0; i < cols; i++) {
        field[i] = [];
        for (let j = 0; j < rows; j++) {
            field[i][j] = getFieldValue(i * resolution, j * resolution, z);
        }
    }

    const contourInterval = .045;
    const epsilon = .00001;

    for (let i = 0; i < cols - 1; i++) {
        for (let j = 0; j < rows - 1; j++) {
            const x = i * resolution;
            const y = j * resolution;
            
            const aVal = field[i][j];
            const bVal = field[i+1][j];
            const cVal = field[i+1][j+1];
            const dVal = field[i][j+1];

            const minVal = min(aVal, bVal, cVal, dVal);
            const maxVal = max(aVal, bVal, cVal, dVal);

            let startLevel = floor(minVal / contourInterval) * contourInterval;
            if (startLevel < minVal) startLevel += contourInterval;

            for (let level = startLevel; level < maxVal; level += contourInterval) {
                const isMajor = abs((level / contourInterval) % 5) < 0.01;
                
                if (isMajor) {
                    buffer.stroke(180, 200, 230, 200);
                    buffer.strokeWeight(1.5);
                } else {
                    buffer.stroke(150, 170, 200, 150);
                    buffer.strokeWeight(1.0);
                }

                let state = 0;
                if (aVal < level) state |= 8;
                if (bVal < level) state |= 4;
                if (cVal < level) state |= 2;
                if (dVal < level) state |= 1;

                let ax = 0, ay = 0, bx = 0, by = 0, cx = 0, cy = 0, dx = 0, dy = 0;
                
                if (abs(dVal - aVal) > epsilon) { let t = (level - aVal) / (dVal - aVal); ax = x; ay = y + resolution * t; }
                if (abs(bVal - aVal) > epsilon) { let t = (level - aVal) / (bVal - aVal); bx = x + resolution * t; by = y; }
                if (abs(cVal - bVal) > epsilon) { let t = (level - bVal) / (cVal - bVal); cx = x + resolution; cy = y + resolution * t; }
                if (abs(cVal - dVal) > epsilon) { let t = (level - dVal) / (cVal - dVal); dx = x + resolution * t; dy = y + resolution; }

                switch (state) {
                    case 1: buffer.line(ax, ay, dx, dy); break;
                    case 2: buffer.line(cx, cy, dx, dy); break;
                    case 3: buffer.line(ax, ay, cx, cy); break;
                    case 4: buffer.line(bx, by, cx, cy); break;
                    case 5: buffer.line(ax, ay, bx, by); buffer.line(cx, cy, dx, dy); break;
                    case 6: buffer.line(bx, by, dx, dy); break;
                    case 7: buffer.line(ax, ay, bx, by); break;
                    case 8: buffer.line(ax, ay, bx, by); break;
                    case 9: buffer.line(bx, by, dx, dy); break;
                    case 10: buffer.line(ax, ay, dx, dy); buffer.line(bx, by, cx, cy); break;
                    case 11: buffer.line(bx, by, cx, cy); break;
                    case 12: buffer.line(ax, ay, cx, cy); break;
                    case 13: buffer.line(cx, cy, dx, dy); break;
                    case 14: buffer.line(ax, ay, dx, dy); break;
                }
            }
        }
    }
}

function fractalNoise(x, y, z, octaves, persistence) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
        total += noise(x * frequency, y * frequency, z) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }
    return total / maxValue;
}

function getFieldValue(x, y, z) {
    const warpScale = 0.0035;
    const valueScale = 0.006;
    const warpAmount = 300;
    const octaves = 5;
    const persistence = .6;

    const warpX = noise(x * warpScale + 10.2, y * warpScale + 4.3, z + 50);
    const warpY = noise(x * warpScale + 2.4, y * warpScale + 15.1, z + 150);
    
    const valX = x + (warpX - 0.5) * warpAmount;
    const valY = y + (warpY - 0.5) * warpAmount;
    
    return fractalNoise(valX * valueScale, valY * valueScale, z, octaves, persistence);
}