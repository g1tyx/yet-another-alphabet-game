// noinspection JSUnusedLocalSymbols

import {priceText} from "../utility/utility.js"
import GameCells from "./game-cells.js"

const MENU_ITEMS = {
    buildResourceGenerator : {
        condition : (data) => !data.cell && game.resources.canAdd() && game.resources.tryPayDebt(),
        text: (data) => `资源 ${game.resources.getName(game.resources.nextResource())}\n生成器\n\n免费 / ${priceText(GameCells.ProducerCell.price(game.resources.nextResource()))}`,
        color: [0.5, 0.6, 0.0, 1],
        handler : (data) => game.spawnCell(data.position, GameCells.ProducerCell, game.resources.addResource()),
        hoverInfo: `Resource generators convert earlier
resource into new one at certain rate
depending on level and quality.

Resource Generators are free and can
be built when you have no active debt.
Resource Generators come with debt in
that generator's resource.`
    },
    buildPowerGenerator : {
        condition : (data) => !data.cell && game.resources.canPay(GameCells.PowerCell.price()),
        text: (data) => `能量\n生成器\n\n${priceText(GameCells.PowerCell.price())}`,
        color: [0.3, 0.5, 0.7, 1],
        handler : (data) => game.spawnCell(data.position, GameCells.PowerCell),
        hoverInfo: `Power Generator increases output of
adjacent Resource Generators and
lower depth Power Generators.

Power Generator's depth for speficic
resource is minimum number of Power
Generator cells connecting it to that
Resource cell. That depth can't exceed
Power Generator's level.`
    },
    buildQualityGenerator : {
        condition : (data) => !data.cell && game.resources.canPay(GameCells.QualityCell.price()),
        text: (data) => `Quality\nGenerator\n\n${priceText(GameCells.QualityCell.price())}`,
        color: [0.0, 0.5, 0.0, 1],
        handler : (data) => game.spawnCell(data.position, GameCells.QualityCell),
        hoverInfo: `Quality Generators improve adjacent
cells, boosting their quality, which
affects different aspects of those
cells, namely:

Resource Generators' conversion rate;
Power Generators' efficiency;
Timer Clickers' timeout;
Area Clickers' range;
Rapid Clickers' clicks;
other Quality Generators' effect.
.`
    },
    buildRapidClicker : {
        condition : (data) => !data.cell && game.resources.canPay(GameCells.RapidClickerCell.price()),
        text: (data) => `Rapid\nClicker\n\n${priceText(GameCells.RapidClickerCell.price())}`,
        color: [0.5, 0.2, 0.0, 1],
        handler : (data) => game.spawnCell(data.position, GameCells.RapidClickerCell),
        hoverInfo: `Rapid Clickers activate adjacent cells
multiple times.

Clickers can only be activated once per
event, even if other clickers try to
activate them more.`
    },
    buildTimerCell : {
        condition : (data) => !data.cell && game.resources.canPay(GameCells.TimerCell.price()),
        text: (data) => `Timed\nClicker\n\n${priceText(GameCells.TimerCell.price())}`,
        color: [0.5, 0.0, 0.0, 1],
        handler : (data) => game.spawnCell(data.position, GameCells.TimerCell),
        hoverInfo: `Timed Clickers activate adjacent cells
when they are activated, or on their timer
which starts at 5s interval. Chaining
several timers can result in high click
rate even with high timeouts.

Clickers can only be activated once per
event, even if other clickers try to
activate them more.`
    },
    buildWideCell : {
        condition : (data) => !data.cell && game.resources.canPay(GameCells.WideClickerCell.price()),
        text: (data) => `Area\nClicker\n\n${priceText(GameCells.WideClickerCell.price())}`,
        color: [0.5, 0.0, 0.2, 1],
        handler : (data) => game.spawnCell(data.position, GameCells.WideClickerCell),
        hoverInfo: `Area clicker activates cells within
given range which can be improved.

Unlike other clickers, Area Clicker
does NOT activate other clicker cells.

Clickers can only be activated once per
event, even if other clickers try to
activate them more.`
    },
    buildConductor : {
        condition : (data) => !data.cell && game.resources.canPay(GameCells.ConductorCell.price()),
        text : (data) => `Conductor\n\n${priceText(GameCells.ConductorCell.price())}`,
        color : [0.5,0.5,0.5,1],
        handler : (data) => game.spawnCell(data.position, GameCells.ConductorCell),
        hoverInfo: `Conductor cells can't be activated
but they connect cells across its
opposite edges, allowing for more
complex and efficient structures.`
    },
    move : {
        condition : (data) => data.cell,
        text: `移动`,
        color: [0.0, 0.0, 0.4, 1.0],
        hoverInfo: `Move cell or switch position
with other cell.

Map borders are expanded while
moving cells, don't get lost!`
    },
    disable : {
        condition : (data) => data.cell?.enabled,
        text: `禁用`,
        color: [0.2, 0.2, 0.2, 1.0],
        handler : (data) => data.cell.disable(),
        hoverInfo : `Disable cell's effect.

Disabled cells still gain power,
quality and experience if applicable.`,
    },
    enable : {
        condition : (data) => data.cell?.enabled === false,
        text: `启用`,
        color: [0.0, 0.2, 0.2, 1.0],
        handler : (data) => data.cell.enable(),
        hoverInfo : `Enable cell's effect.`,
    },
    reset : {
        condition : (data) => data.cell && (data.cell instanceof GameCells.ProducerCell || data.cell instanceof GameCells.PowerCell),
        text: `重置`,
        color: [0.4, 0.2, 0.2, 1.0],
        handler : (data) => data.cell.reset?.(),
        hoverInfo : `Reset cell's level and power.
Quality and experience is retained.

Sometimes cell get too high power
or level to be efficiently used,
and this tool allows to rebuild
their power to desired level from
scratch without losing quality
and experience gained over time.`
    },
    toggleLayer : {
        condition : (data) => data.cell && data.cell instanceof GameCells.ProducerCell,
        text: (data) => game.map.glyphLayer === data.cell?.resource?.id ? `显示全部\n字母` : `只显示\n此字母`,
        color: [0.3, 0.5, 0.7, 1.0],
        handler : (data) => game.map.toggleLayer(data.cell?.resource?.id),
        hoverInfo : `View only related power glyphs and gains.\n\nChoose this again to restore view.`,
    },
    levelUp : {
        condition : (data) => data.cell && data.cell.maxLevel > data.cell.level,
        text: (data) => `升级${game.rules.freeLevels?``:`
        
${priceText(data.cell?.levelUpPrice())}`}`,
        color: [0.2, 0.5, 0.2, 1.0],
        handler : (data) => data.cell.levelUp?.(),
        hoverInfo : (data) => `Level up cell.

${data.cell.levelUpInfo()}`
    },
    maximizeLevel : {
        condition : (data) => data.cell && data.cell.maxLevel - data.cell.level > 1,
        text: (data) => `Max Level${game.rules.freeLevels?``:`

${priceText(data.cell?.levelUpPrice(true))}`}`,
        color: [0.2, 0.7, 0.2, 1.0],
        handler : (data) => data.cell.maximizeLevel(),
        hoverInfo : `Level up cell to maximum level.
        
If you can't afford all levels,
as much as possible will be gained.`,
    },
}

export default MENU_ITEMS