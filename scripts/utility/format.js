export default class Format {
    static displayNumber(number, digits = 2) {
        return Math.abs(number) >= 1e6 ? number.toExponential(2).replace("+", "") : number.toFixed(digits)
    }
    
    static displayTime(time) {
        return `${time / 3600000 | 0}:${`0${time / 60000 % 60| 0}`.slice(-2)}:${`0${time / 1000 % 60| 0}`.slice(-2)}.${time / 100 % 10| 0}`
    }
}