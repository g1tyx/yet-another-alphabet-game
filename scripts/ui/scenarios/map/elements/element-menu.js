import MapScene from "../map-scene.js"

const MAX_MENU_ITEMS = 10

const RoundMenuElement = (base) => class extends base {
    
    constructor(...args) {
        super(...args)
        
        Object.assign(this.bufferData, {
            "menuItemIndex" : MAX_MENU_ITEMS,
            "menuItemColor" : MAX_MENU_ITEMS * 4,
        })
        
        this.textureData.menuItems = {}
    
        this.elementData.menu = {
            alpha : true,
            program : "menu",
            position : "a_position",
            attributeData : {
                a_item_index : {
                    buffer : "menuItemIndex",
                },
                a_image_index : {
                    buffer : "menuImageIndex",
                },
                a_item_color : {
                    buffer : "menuItemColor",
                },
            },
            count : 0,
            textures : ["menuItems"],
            renderOrder : Object.entries(this.elementData).length,
        }
    }
    
    updateMenuTexture() {
        this.textures.menuItems.assign(ui.roundMenu.prepareImage(this.textureQuality))
    }
    
    displayMenu(items = ui.roundMenu.items) {
        this.updateMenuTexture()
        
        for (let i = 0; i < items.length; i++) {
            this.setInstanceAttribute(i, "menuItemIndex", i)
            this.setInstanceAttribute(i, "menuItemColor", items[i].color)
        }
        this.elements.menu.uniforms.u_items = items.length
        this.elements.menu.uniforms.u_show = performance.now()
        
        this.setHighlightColor(MapScene.HIGHLIGHT_COLORS.MENU)
        
        this.elements.menu.count = items.length
        this.setMenuChoice(-1)
    }
    
    setMenuChoice(choice) {
        this.elements.menu.uniforms.u_choice = choice
    }
    
    hideMenu() {
        this.elements.menu.uniforms.u_hide = performance.now()
        this.setHighlightColor(MapScene.HIGHLIGHT_COLORS.SELECT)
    }

    reset() {
        super.reset()
        this.hideMenu()
    }
}

export default RoundMenuElement