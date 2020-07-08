import React, { PureComponent } from 'react'
import { LazyBrush } from 'lazy-brush'
import { Catenary } from 'catenary-curve'
import ResizeObserver from 'resize-observer-polyfill'
import drawImage from './drawImage'

function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  }
}

const canvasStyle = {
  display: 'block',
  position: 'absolute'
}

const canvasTypes = [
  {
    name: 'interface',
    zIndex: 15
  },
  {
    name: 'drawing',
    zIndex: 11
  },
  {
    name: 'temp',
    zIndex: 12
  },
  {
    name: 'grid',
    zIndex: 10
  }
]

export default class extends PureComponent {

  static defaultProps = {
    onChange: null,
    loadTimeOffset: 5,
    brushRadius: 10,
    brushColor: '#444',
    catenaryColor: '#0a0302',
    gridColor: 'rgba(150,150,150,0.17)',
    backgroundColor: '#FFF',
    canvasWidth: 400,
    canvasHeight: 400,
    disabled: false,
    imgSrc: '',
    saveData: '',
    immediateLoading: false,
  }

  constructor(props) {
    super(props)

    this.canvas = {}
    this.ctx = {}

    this.catenary = new Catenary()

    this.points = []
    this.lines = []

    this.mouseHasMoved = true
    this.valuesChanged = true
    this.isDrawing = false
    this.isPressing = false
    this.startPoint = {x: 0, y: 0}
    this.endPoint = [0, 0]
  }

  componentDidMount() {
    this.lazy = new LazyBrush({
      radius: 0,
      enabled: true,
      initialPoint: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }
    })
    this.chainLength = 0

    this.canvasObserver = new ResizeObserver((entries, observer) =>
      this.handleCanvasResize(entries, observer)
    )
    this.canvasObserver.observe(this.canvasContainer)

    this.drawImage()
    this.loop()

    window.setTimeout(() => {
      const initX = window.innerWidth / 2
      const initY = window.innerHeight / 2
      this.lazy.update(
        { x: initX - this.chainLength / 4, y: initY },
        { both: true }
      )
      this.lazy.update(
        { x: initX + this.chainLength / 4, y: initY },
        { both: false }
      )
      this.mouseHasMoved = true
      this.valuesChanged = true
      this.clear()

      // Load saveData from prop if it exists
      if (this.props.saveData) {
        this.loadSaveData(this.props.saveData)
      }
    }, 100)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.saveData !== this.props.saveData) {
      this.loadSaveData(this.props.saveData)
    }

    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      // Signal this.loop function that values changed
      this.valuesChanged = true
    }
  }

  componentWillUnmount = () => {
    this.canvasObserver.unobserve(this.canvasContainer)
  }

  drawImage = () => {
    if (!this.props.imgSrc) return

    // Load the image
    this.image = new Image()

    // Prevent SecurityError 'Tainted canvases may not be exported.' #70
    this.image.crossOrigin = 'anonymous'

    // Draw the image once loaded
    this.image.onload = () =>
      drawImage({ ctx: this.ctx.grid, img: this.image })
    this.image.src = this.props.imgSrc
  }

  undo = () => {
    const lines = this.lines.slice(0, -1)
    this.clear()
    this.simulateDrawingLines({ lines, immediate: true })
    this.triggerOnChange()
  }

  getSaveData = () => {
    // Construct and return the stringified saveData object
    return JSON.stringify({
      lines: this.lines,
      width: this.props.canvasWidth,
      height: this.props.canvasHeight
    })
  }

  loadSaveData = (saveData, immediate = this.props.immediateLoading) => {
    if (typeof saveData !== 'string') {
      throw new Error('saveData needs to be of type string!')
    }

    const { lines, width, height } = JSON.parse(saveData)

    if (!lines || typeof lines.push !== 'function') {
      throw new Error('saveData.lines needs to be an array!')
    }

    this.clear()

    if (
      width === this.props.canvasWidth &&
      height === this.props.canvasHeight
    ) {
      this.simulateDrawingLines({
        lines,
        immediate
      })
    } else {
      // we need to rescale the lines based on saved & current dimensions
      const scaleX = this.props.canvasWidth / width
      const scaleY = this.props.canvasHeight / height
      const scaleAvg = (scaleX + scaleY) / 2

      this.simulateDrawingLines({
        lines: lines.map(line => ({
          ...line,
          points: line.points.map(p => ({
            x: p.x * scaleX,
            y: p.y * scaleY
          })),
          brushRadius: line.brushRadius * scaleAvg
        })),
        immediate
      })
    }
  }

  simulateDrawingLines = ({ lines, immediate }) => {

    console.log('simulateDrawingLines', lines)

    // Simulate live-drawing of the loaded lines
    // TODO use a generator
    let curTime = 0
    let timeoutGap = immediate ? 0 : this.props.loadTimeOffset

    lines.forEach(line => {
      const { points, brushColor, brushRadius, type } = line

      // Draw all at once if immediate flag is set, instead of using setTimeout
      if (immediate) {
        // Draw the points
        if (type === 0) {
        this.drawPoints({
          points,
          brushColor,
          brushRadius
        })
        }
        if (type === 1) {
          this.drawRect(points[0], points[1], brushColor)
        }
        if (type === 2) {
          this.drawCircle(points[0], points[1], brushColor)
        }
        if (type === 3) {
          this.drawArrow(points[0], points[1], brushColor)
        }
        // Save line with the drawn points
        this.points = points
        this.saveLine({ brushColor, brushRadius, type })
        return
      }

      // Use timeout to draw
      for (let i = 1; i < points.length; i++) {
        curTime += timeoutGap
        window.setTimeout(() => {
          this.drawPoints({
            points: points.slice(0, i + 1),
            brushColor,
            brushRadius
          })
        }, curTime)
      }

      curTime += timeoutGap
      window.setTimeout(() => {
        // Save this line with its props instead of this.props
        this.points = points
        this.saveLine({ brushColor, brushRadius })
      }, curTime)
    })
  }

  handleDrawStart = e => {
    e.preventDefault()

    // Start drawing
    this.isPressing = true

    const { x, y } = this.getPointerPos(e)

    /*if (e.touches && e.touches.length > 0) {
      // on touch, set catenary position to touch pos
      this.lazy.update({ x, y }, { both: true })
    }*/

    //if (this.props.drawingTool === 0) {
      // Ensure the initial down position gets added to our line
      this.handlePointerMove(x, y)
    //}

    if ([1, 2, 3, 4].includes(this.props.drawingTool)) {
      this.startPoint = {x, y}
    }
  }

  handleDrawMove = e => {
    e.preventDefault()
    if (!this.isDrawing) return;

    const { x, y } = this.getPointerPos(e)

    if (this.props.drawingTool === 0) {
      this.handlePointerMove(x, y)
    }

    if (this.props.drawingTool === 1) {
      this.drawRect(this.startPoint, {x, y})
    }
    if (this.props.drawingTool === 2) {
      this.drawCircle(this.startPoint, {x, y});
    }
    if (this.props.drawingTool === 3) {
      this.drawArrow(this.startPoint, {x, y});
    }
  }

  handleDrawEnd = e => {
    e.preventDefault()

    // Draw to this end pos
    if (this.props.drawingTool === 0) {
      this.handleDrawMove(e)
      this.saveLine()
    }

    if (this.isDrawing && [1, 2, 3].includes(this.props.drawingTool)) {
      const { x, y } = this.getPointerPos(e)

      this.points = [this.startPoint, {x, y}]

      this.saveLine({type: this.props.drawingTool, brushColor: this.props.brushColor, brushRadius: this.props.brushRadius})
    }

    // Stop drawing & save the drawn line
    this.isDrawing = false
    this.isPressing = false

    }

  handleCanvasResize = (entries, observer) => {
    const saveData = this.getSaveData()
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      this.setCanvasSize(this.canvas.interface, width, height)
      this.setCanvasSize(this.canvas.drawing, width, height)
      this.setCanvasSize(this.canvas.temp, width, height)
      this.setCanvasSize(this.canvas.grid, width, height)

      this.drawGrid(this.ctx.grid)
      this.drawImage()
      this.loop({ once: true })
    }
    this.loadSaveData(saveData, true)
  }

  setCanvasSize = (canvas, width, height) => {
    canvas.width = width
    canvas.height = height
    canvas.style.width = width
    canvas.style.height = height
  }

  getPointerPos = e => {
    const rect = this.canvas.interface.getBoundingClientRect()

    // use cursor pos as default
    let clientX = e.clientX
    let clientY = e.clientY

    // use first touch if available
    if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX
      clientY = e.changedTouches[0].clientY
    }

    // return mouse/touch position inside canvas
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  handlePointerMove = (x, y) => {
    if (this.props.disabled) return

    this.lazy.update({ x, y })
    const isDisabled = !this.lazy.isEnabled()

    if (
      (this.isPressing && !this.isDrawing) ||
      (isDisabled && this.isPressing)
    ) {
      // Start drawing and add point
      this.isDrawing = true
      if (this.props.drawingTool === 0) {
        this.points.push(this.lazy.brush.toObject())
      }
    }

    if (this.isDrawing) {
      // Add new point
      this.points.push(this.lazy.brush.toObject())

      // Draw current points
      if (this.props.drawingTool === 0) {
        this.drawPoints({
          points: this.points,
          brushColor: this.props.brushColor,
          brushRadius: this.props.brushRadius
        })
      }
    }

    this.mouseHasMoved = true
  }

  drawPoints = ({ points, brushColor, brushRadius }) => {
    this.ctx.temp.lineJoin = 'round'
    this.ctx.temp.lineCap = 'round'
    this.ctx.temp.strokeStyle = brushColor

    this.ctx.temp.clearRect(
      0,
      0,
      this.ctx.temp.canvas.width,
      this.ctx.temp.canvas.height
    )
    this.ctx.temp.lineWidth = brushRadius * 2

    let p1 = points[0]
    let p2 = points[1]

    this.ctx.temp.moveTo(p2.x, p2.y)
    this.ctx.temp.beginPath()

    for (var i = 1, len = points.length; i < len; i++) {
      // we pick the point between pi+1 & pi+2 as the
      // end point and p1 as our control point
      var midPoint = midPointBtw(p1, p2)
      this.ctx.temp.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
      p1 = points[i]
      p2 = points[i + 1]
    }
    // Draw last line as a straight line while
    // we wait for the next point to be able to calculate
    // the bezier control point
    this.ctx.temp.lineTo(p1.x, p1.y)

    this.ctx.temp.stroke()
  }

  drawRect = (startPoint, endPoint, brushColor = this.props.brushColor) => {
    const width = this.canvas.temp.width
    const height = this.canvas.temp.height

    this.ctx.temp.clearRect(0, 0, width, height);
    this.ctx.temp.strokeStyle = brushColor;
    this.ctx.temp.beginPath();
    this.ctx.temp.strokeRect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
  }

  drawCircle = (startPoint, endPoint, brushColor = this.props.brushColor) => {
    const width = this.canvas.temp.width
    const height = this.canvas.temp.height
    // const radius = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y)

    this.ctx.temp.clearRect(0, 0, width, height);
    this.ctx.temp.strokeStyle = brushColor;
    this.ctx.temp.beginPath();
    // this.ctx.temp.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
    this.ctx.temp.ellipse(
      startPoint.x,
      startPoint.y,
      Math.abs(endPoint.x - startPoint.x),
      Math.abs(endPoint.y - startPoint.y),
      0,
      0,
      2 * Math.PI
    );
    this.ctx.temp.stroke();
  }

  drawArrow = (startPoint, endPoint, brushColor = this.props.brushColor) => {
    const width = this.canvas.temp.width
    const height = this.canvas.temp.height

    this.ctx.temp.clearRect(0, 0, width, height);
    this.ctx.temp.strokeStyle = brushColor;
    this.ctx.temp.fillStyle = brushColor;
    this.ctx.temp.beginPath();
    this.ctx.temp.moveTo(startPoint.x, startPoint.y)
    this.ctx.temp.lineTo(endPoint.x, endPoint.y)
    this.ctx.temp.stroke();

    const arrowLength = 20;
    const arrowAngle = 0.3;
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    this.ctx.temp.beginPath();
    this.ctx.temp.moveTo(endPoint.x, endPoint.y)
    this.ctx.temp.lineTo(
      endPoint.x-arrowLength*Math.cos(angle - arrowAngle),
      endPoint.y-arrowLength*Math.sin(angle-arrowAngle)
    )
    this.ctx.temp.lineTo(
      endPoint.x-arrowLength*Math.cos(angle + arrowAngle),
      endPoint.y-arrowLength*Math.sin(angle+arrowAngle)
    )
    this.ctx.temp.lineTo(endPoint.x, endPoint.y)
    this.ctx.temp.fill();
    this.ctx.temp.stroke();
  }

  saveLine = ({ brushColor, brushRadius, type = 0 } = {}) => {
    if (this.points.length < 2) return

    // Save as new line
    this.lines.push({
      type,
      points: [...this.points],
      brushColor: brushColor || this.props.brushColor,
      brushRadius: brushRadius || this.props.brushRadius
    })

    // Reset points array
    this.points.length = 0

    const width = this.canvas.temp.width
    const height = this.canvas.temp.height

    // Copy the line to the drawing canvas
    this.ctx.drawing.drawImage(this.canvas.temp, 0, 0, width, height)

    // Clear the temporary line-drawing canvas
    this.ctx.temp.clearRect(0, 0, width, height)

    this.triggerOnChange()
  }

  triggerOnChange = () => {
    this.props.onChange && this.props.onChange(this)
  }

  clear = () => {
    this.lines = []
    this.valuesChanged = true
    this.ctx.drawing.clearRect(
      0,
      0,
      this.canvas.drawing.width,
      this.canvas.drawing.height
    )
    this.ctx.temp.clearRect(
      0,
      0,
      this.canvas.temp.width,
      this.canvas.temp.height
    )
  }

  loop = ({ once = false } = {}) => {
    if (this.mouseHasMoved || this.valuesChanged) {
      this.mouseHasMoved = false
      this.valuesChanged = false
    }

    if (!once) {
      window.requestAnimationFrame(() => {
        this.loop()
      })
    }
  }

  drawGrid = ctx => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.beginPath()
    ctx.setLineDash([5, 1])
    ctx.setLineDash([])
    ctx.strokeStyle = this.props.gridColor
    ctx.lineWidth = 0.5

    const gridSize = 25

    let countX = 0
    while (countX < ctx.canvas.width) {
      countX += gridSize
      ctx.moveTo(countX, 0)
      ctx.lineTo(countX, ctx.canvas.height)
    }
    ctx.stroke()

    let countY = 0
    while (countY < ctx.canvas.height) {
      countY += gridSize
      ctx.moveTo(0, countY)
      ctx.lineTo(ctx.canvas.width, countY)
    }
    ctx.stroke()
  }

  render() {
    return (
      <div
        className={this.props.className}
        style={{
          display: 'block',
          background: this.props.backgroundColor,
          touchAction: 'none',
          width: this.props.canvasWidth,
          height: this.props.canvasHeight,
          ...this.props.style
        }}
        ref={container => {
          if (container) {
            this.canvasContainer = container
          }
        }}
      >
        {canvasTypes.map(({ name, zIndex }) => {
          const isInterface = name === 'interface'
          return (
            <canvas
              key={name}
              ref={canvas => {
                if (canvas) {
                  this.canvas[name] = canvas
                  this.ctx[name] = canvas.getContext('2d')
                }
              }}
              style={{ ...canvasStyle, zIndex }}
              onMouseDown={isInterface ? this.handleDrawStart : undefined}
              onMouseMove={isInterface ? this.handleDrawMove : undefined}
              onMouseUp={isInterface ? this.handleDrawEnd : undefined}
              onMouseOut={isInterface ? this.handleDrawEnd : undefined}
              onTouchStart={isInterface ? this.handleDrawStart : undefined}
              onTouchMove={isInterface ? this.handleDrawMove : undefined}
              onTouchEnd={isInterface ? this.handleDrawEnd : undefined}
              onTouchCancel={isInterface ? this.handleDrawEnd : undefined}
            />
          )
        })}
      </div>
    )
  }
}
