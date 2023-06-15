/*
x,y,z directions:

-----   0,+,+   -----
      \       /
-,0,+   -----   +,+,0
      /       \
-----   0,0,0   -----
      \       /
-,-,0   -----   +,0,-
      /       \
-----   0,-,-   -----

 */


const HALF_ROOT_3 = 0.866

export default class HexCells {
    static ADJACENT_POSITION_SHIFTS = [[1, 1], [0, 1], [-1, 0], [-1, -1], [0, -1], [1, 0]]
    
    static squareToHex(squareX, squareY) {
        squareX /= HALF_ROOT_3
        let x = Math.round(squareX)
        let dx = (squareX - x) * HALF_ROOT_3
    
        squareY += x * 0.5
        let y = Math.round(squareY)
        let dy = (squareY - y)
    
        const width = (0.5 - Math.abs(dy / 2)) / 0.866
    
        if (dx > width) {
            x += 1
        
            if (dy > 0)
                y += 1
        }
    
        if (dx < -width) {
            x -= 1
        
            if (dy < 0)
                y -= 1
        }
    
        return [x,y]
    }

    static hexToSquare(x, y) {
        return [x * 0.866, y - x/2]
    }
    
    static getHexDistance(x, y) {
        const z = x - y
        return Math.max(Math.abs(x), Math.abs(y), Math.abs(z))
    }
}
