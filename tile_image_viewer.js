(function(){

    let viewer = new Object({

        // The selector id of the zoombox
        selId : 'div#viewer',

        // Its position
        position : 'right',

        // Multiplier of drawingWidth to get width of tiles
        zoomLevel : 2,

        // The size of the drawing in the background
        drawingWidth : 5000,
        drawingHeight : 500,        

        // path + filename to the tiles
        tilesStem : 'image_part_',
        tilesExt : 'png',
        tilesFolder : 'tiles',

        // Number of tiles
        nTilesWidth : 4,
        nTilesHeight : 4,

        // For use when coordinates need to be calculated in zoombox
        marginLeft : 0,
        marginRight : 0,
        marginTop : 0,
        marginBottom : 0,

        // Information to show on click
        rectangles : [{
            rect: {x: 0, y: 0, width: 100, height: 100},
            textNL: 'Circle 1',
            textEN: ''
        },
        {
            rect: {x:0, y: 400, width: 100, height: 100},
            textNL: 'Circle 2',
            textEN: ''
        },
        {
            rect: {x:2450, y: 200, width: 100, height: 100},
            textNL: 'Circle 3',
            textEN: ''
        },
        {
            rect: {x: 4900, y: 0, width: 100, height: 100},
            textNL: 'Circle 4',
            textEN: ''
        }],

        /*
            Padds str to the left with 0's needed to get length n of str
        */
        padd : function(str, n){                
                if(str.length < n){
                    str = this.padd('0' + str, n)
                }
                return str
            
            },

        pointInRect : function(x, y, rect){
            if( rect.x <= x && x < rect.x + rect.width
                && rect.y <= y && y < rect.y + rect.height)
                return true
        },

        displayTextOfPoint : function(x, y){
            var found = false;
            this.rectangles.forEach( (rect) => {
                if(this.pointInRect(x, y, rect.rect)){
                    this.displayText(rect.textNL)
                    found = true
                }
            })
            if( ! found)
                this.displayText()
        },

        displayText : function(str){
            var el = document.querySelector(this.selId + ' div div#text')
            if(el && str){
                el.innerHTML = str
                el.style='display:block;'
            }
            else if(el){
                el.style='display:none;'
            }
        },

        getScreenSize : function(){
            var el =  document.querySelector('body')
            return {
                width : el.getBoundingClientRect().width, 
                height: el.getBoundingClientRect().height
            }
        },

        setZoomboxPosition : function(position){
            var el = this.getZoomboxElement(),
                left = position == 'left'? true: false,
                style = '';

            if(left){
                style = 'left:1px;'
            }
            else{
                style = 'right:1px;'
            }

            el.setAttribute('style', style)
        },

        getZoomboxSVGElement : function(){
            return document.querySelector(this.selId + ' div img')
        },

        getZoomboxElement : function(){
            return document.querySelector(this.selId + ' > div')
        },

        getZoomboxMapElement : function(){
            return document.querySelector(this.selId + ' .zoombox')
        },

        getSVGElement : function(){
            return document.querySelector(this.selId + ' > svg')
        },

        getViewerElement : function(){
            return document.querySelector(this.selId)
        },

        getZoomboxWidth : function(){
            var el = this.getZoomboxMapElement()
            if(el)
                return el.getBoundingClientRect().width
        },

        getZoomboxHeight : function(){
            var el = this.getZoomboxMapElement()
            if(el)
                return el.getBoundingClientRect().height
        },

        getSVGWidth : function(){
            var el = this.getSVGElement()
            if(el){
                return el.getAttribute('width')
            }
        },

        getSVGHeight : function(){
            var el = this.getSVGElement()
            if(el){
                return el.getAttribute('height')/
            }
        },

        getZoomboxSVGWidth : function(){
            return this.drawingWidth * this.zoomLevel
        },

        getZoomboxSVGHeight : function(){
            return this.drawingHeight * this.zoomLevel
        },

        getContainerWidth : function(){
            var el = getViewerElement()
            if(el){
                return el.getBoundingClientRect().width
            }
        },

        getContainerHeight : function(){
            var el = this.getViewerElement()
            if(el){
                return el.getBoundingClientRect().height
            }
        },

        getScale : function(){
            var svgWidth = this.getSVGWidth(),
                sizes = this.getScreenSize();

            return sizes.width / svgWidth
        },

        calcPaddingTop : function(){
            var scale = this.getScale(),
                svgHeight = this.getSVGHeight(),
                height = scale * svgHeight;
            
            return (this.getContainerHeight() - height) / 2
        },

        canvasPointToDrawingCoords : function(x, y){
            var scale = this.getScale();

            return {
                left: x / scale,
                top: (y - this.calcPaddingTop()) / scale
            }
        },

        canvasPointToZoomboxDrawingCoords : function(x, y){
            return {
                left: x + -1 * this.marginLeft,
                top: y + -1 * this.marginTop
            }
        },

        devicePointToCanvasPoint : function(x, y){
            var rect = this.getViewerElement().getBoundingClientRect();

            return {
                x: x - rect.x,
                y: y - rect.y + 3
            }
        },

        devicePointToZoomboxCanvasPoint : function(x, y){
            var rect = this.getZoomboxElement().getBoundingClientRect();

            return {
                x: x - rect.x,
                y: y - rect.y + 3
            }
        },

        applyZoomboxViewBox : function(left, top){

            var props = this.initTiles(left, top);

            for(var r = 0; r < props.visibleHeight; r++){
                
                for(var c = 0; c < props.visibleWidth; c++ ){
                
                    var el = document.querySelector('.zoombox img:nth-child(' + (r*props.visibleWidth + c+1) + ')'),
                        mLeft = -1 * this.getZoomboxSVGWidth() / 2 - (left - (this.getZoomboxSVGWidth() / 2)) + this.getZoomboxWidth() / 2,
                        mRight = -1 * this.getZoomboxSVGWidth() / 2 + (left - (this.getZoomboxSVGWidth() / 2)) + this.getZoomboxWidth() / 2,
                        mTop = -1 * this.getZoomboxSVGHeight() / 2 - (top - (this.getZoomboxSVGHeight() / 2)) + this.getZoomboxHeight() / 2,
                        tileWidth = this.zoomLevel * this.drawingWidth  / this.nTilesWidth,
                        tileHeight = this.zoomLevel * this.drawingHeight / this.nTilesHeight,
                        stlMLeft = mLeft % tileWidth,
                        stlMRight = this.marginRight % tileWidth,
                        stlMTop = mTop % tileHeight;

                    // Set globals voor positioning on touch
                    this.marginLeft = mLeft
                    this.marginRight = mRight
                    this.marginTop =  mTop
                    this.marginBottom = 0
                    
                    // getZoomboxWidth = 5000 + marginLeft + marginRight
                    stlMRight = -1 * props.visibleWidth * tileWidth - stlMLeft + this.getZoomboxWidth()

                    if(c == 0){
                        stlMRight = 0;
                    }
                    else if(c == props.visibleWidth - 1){
                        stlMLeft = 0;
                    }
                    else{
                        stlMLeft = 0
                        stlMRight = 0
                    }    

                    if(r > 0){
                        stlMTop = 0;
                    }
                    else{
                        stlMBottom = 0;
                    }

                    el.setAttribute('style', 'float:left;' 
                        + 'margin-left:' + Math.floor(stlMLeft) + 'px; '
                        + 'margin-right:' + Math.floor(stlMRight) + 'px;'
                        + 'margin-top:' + Math.floor(stlMTop) + 'px; '
                        + 'margin-bottom:' + Math.floor(this.marginBottom) + 'px; '
                    )
                }
            }
        },

        touch : function(x, y){
            var cPos = this.devicePointToCanvasPoint(x, y),
                pos = this.canvasPointToDrawingCoords(cPos.x, cPos.y);

            if( pos.left / (this.getSVGWidth() + 100) < 0.5)
                position = 'right'
            else
                position = 'left'
            
            this.setZoomboxPosition(position)
            
            this.displayTextOfPoint(pos.left, pos.top)

            this.applyZoomboxViewBox(pos.left * this.zoomLevel, pos.top * this.zoomLevel)

        },

        touchZoombox : function(clientX, clientY){
                var cPos = this.devicePointToZoomboxCanvasPoint(clientX, clientY),
                    pos = this.canvasPointToZoomboxDrawingCoords(cPos.x, cPos.y);

            this.displayTextOfPoint(pos.left / this.zoomLevel, pos.top / this.zoomLevel)

            this.applyZoomboxViewBox(pos.left, pos.top)
        },

        intersects : function(r1, r2){
            return !(r2.left > r1.right || 
                r2.right < r1.left || 
                r2.top > r1.bottom ||
                r2.bottom < r1.top);
        },

        visibleTile : function(h, w, left, top){
            var tilesPixW = this.drawingWidth * this.zoomLevel / this.nTilesWidth,
                tilesPixH = this.drawingHeight * this.zoomLevel / this.nTilesHeight;
            
                return this.intersects(

                    // Rectangle zoombox
                    {
                        left: left - this.getZoomboxWidth() / 2, 
                        top: top - this.getZoomboxHeight() / 2, 
                        right: left + this.getZoomboxWidth() / 2, 
                        bottom: top + this.getZoomboxHeight() / 2}, 

                    // Rectangle tile
                    {
                        left: w * tilesPixW, 
                        top: h * tilesPixH, 
                        right: w * tilesPixW + tilesPixW, 
                        bottom: h * tilesPixH + tilesPixH}
                )
        },

        visibleTiles : function(left, top){
            var el = document.querySelector('.zoombox'),
                tilesPixW = this.drawingWidth * this.zoomLevel / this.nTilesWidth,
                tilesPixH = this.drawingHeight * this.zoomLevel / this.nTilesHeight,    
                visibleTilesWidth = Math.ceil(this.drawingWidth * this.zoomLevel / tilesPixW),
                visibleTilesHeight = Math.ceil(this.drawingHeight * this.zoomLevel / tilesPixH);
                
            var d = 0,
                w = 0;
                cntRow1 = -1;
                visible = 0,
                totLeft = 0,
                totTop = 0,
                ret = [];
                        
            var removeTags = document.querySelectorAll('.zoombox  img')
            for(var c = 0; c < removeTags.length; c++)
                removeTags[c].remove()
                
            for(var c = 0; c < visibleTilesHeight; c++){

                for(var cc = 0; cc < visibleTilesWidth; cc++){
                    
                    d++            
                    
                    if( this.visibleTile(c, cc, left, top)){
                        visible++
                        if(cntRow1 == -1)
                            w++                
                        this.appendImgTag(el, d)
                    }

                    totLeft += tilesPixW

                }

                totTop += tilesPixH

                if(w > 0)
                    cntRow1 = c

                totLeft = 0;
                
            }
            
            return {
                visible: visible,
                visibleWidth: w,
                visibleHeight: visible / w
            }
        },

        appendImgTag : function(el, c){
            var imgEl = document.createElement('img')
            imgEl.setAttribute('src', this.tilesFolder + '/' + this.tilesStem + this.padd(c + '', 3) + '.' + this.tilesExt)
            el.appendChild(imgEl)
        },

        initTiles : function(left, top){
                            
            return this.visibleTiles(left, top)	
        },

        getSVGSize : function(){
            var vb = document.querySelector('div#viewer > svg').getAttribute('viewBox');
            this.drawingWidth = vb.split(" ")[2]
            this.drawingHeight = vb.split(" ")[3]
        },         

        init : function(){
            this.getZoomboxElement().addEventListener('click', (e) => {
                this.touchZoombox(e.clientX, e.clientY, 2)
                e.stopPropagation()
            })
            
            document.querySelector('body').addEventListener('click', (e) => {
                this.touch(e.clientX, e.clientY)
            })
            
            //this.getSVGSize()

            this.setZoomboxPosition(this.position)
        
            this.displayTextOfPoint(this.drawingWidth / 2, this.drawingHeight / 2)
        
            this.applyZoomboxViewBox(this.getZoomboxSVGWidth() / 2, this.getZoomboxSVGHeight() / 2)               
        }

    })
    
    Object.create(viewer).init()

    
}())