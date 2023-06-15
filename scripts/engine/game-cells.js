import RapidClickerCell from "./cells/rapid-clicker-cell.js"
import PowerCell from "./cells/power-cell.js"
import ProducerCell from "./cells/producer-cell.js"
import QualityCell from "./cells/quality-cell.js"
import TimerCell from "./cells/timer-cell.js"
import WideClickerCell from "./cells/wide-clicker-cell.js"
import ClickerCell from "./cells/clicker-cell.js"
import ConductorCell from "./cells/conductor-cell.js"

const GameCells = {
    ClickerCell : ClickerCell,
    MultiClickerCell : RapidClickerCell,
    RapidClickerCell : RapidClickerCell,
    PowerCell : PowerCell,
    ProducerCell : ProducerCell,
    QualityCell : QualityCell,
    TimerCell : TimerCell,
    WideClickerCell : WideClickerCell,
    ConductorCell : ConductorCell,
}

export default GameCells