const RoundMenu = {
    Back : class {
        constructor(itemData, dataProcessor) {
            this.itemData = itemData
            this.dataProcessor = dataProcessor
        }

        getItems(data) {
            if (this.dataProcessor !== undefined)
                this.data = this.dataProcessor(data)
            else
                this.data = data

            const result = []

            for (let [id, item] of Object.entries(this.itemData))
                if (item.condition(data))
                    result.push(this.getItem(id, data))

            return result
        }

        getItem(id, data) {
            const item = this.itemData[id]
            return {
                id,
                value : item.value,
                text : item.text?.call?.(item, data) ?? item.text ?? "",
                color : item.color,
                hoverInfo : item.hoverInfo?.call?.(item, data) ?? item.hoverInfo ?? "",
            }
        }

        execute(id) {
            this.itemData[id].handler?.(this.data)
        }
    },

    Front : class {
        items = []

        constructor(backend) {
            this.backend = backend
        }

        prepareImage(itemSize = 256) {
            const canvas = document.createElement("canvas")
            canvas.width = itemSize * 4
            canvas.height = itemSize * 4
            const c = canvas.getContext("2d")
            if ((this.items?.length ?? 0) === 0)
                return canvas
            c.textAlign = "center"
            c.fillStyle = "white"

            c.scale(itemSize / 96, itemSize / 96)

            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i]
                c.save()
                const x = 96 * (i % 4)
                const y = 96 * (i / 4 | 0)
                const lines = item.text.split("\n").map(x => x.trim())
                let step = 12
                const height = lines.reduce((v,x) => x === "" ? v + (step = 8) : v + step, 0)

                c.translate(x + 48, y + 48)
                step = 12
                c.font = `${step}px Share Tech Mono`
                let ty = - height / 2
                for (let j = 0; j < lines.length; j++) {
                    if (lines[j] === "") {
                        step = 8
                        c.font = `${step}px Share Tech Mono`
                    }
                    ty += step
                    c.fillText(lines[j], 0, ty)
                }
                c.restore()
            }
            return canvas
        }

        async setData(data) {
            this.items = await this.backend.getItems(data)
        }

        getChoiceAt(x,y) {
            const distance = Math.hypot(x, y)
            const radius = 0.2 + 0.05 * this.items.length

            if (Math.abs(radius - distance) > 0.25)
                return -1

            const angle = -Math.atan2(y, x)
            const sectorStep = Math.PI * 2 / this.items.length

            const optionIndex = Math.floor(angle / sectorStep + 0.5 + this.items.length) % this.items.length

            const optionAngle = sectorStep * optionIndex
            const optionDistance = Math.hypot(x - radius * Math.cos(optionAngle), y + radius * Math.sin(optionAngle))

            if (optionDistance < 0.25)
                return optionIndex

            return -1
        }

        select(choice = -1) {
            const item = this.items[choice]
            if (item === undefined)
                return

            this.backend.execute(item.id)
            return item.id
        }

        cancel() {
            return this.select(-1)
        }

        getHint(itemIndex) {
            return this.items[itemIndex]?.hoverInfo
        }

        hoverObject(itemIndex) {
            if (this.items?.[itemIndex] === undefined)
                return

            return {
                hoverInfo : this.getHint.bind(this, itemIndex)
            }
        }
    },
}

export default RoundMenu