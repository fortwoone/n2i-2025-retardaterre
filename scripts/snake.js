(function () {
    'use strict'

    // Game settings
    const settings = {
        gridSize: 15,
        tileSize: 20,
        speedMs: 200
    }

    // Game state
    let canvas, ctx
    let snake = []
    let score = 0

    function init() {
        canvas = document.getElementById('game-canvas')
        if (!canvas) {
            console.error('Canvas not found')
            return
        }

        ctx = canvas.getContext('2d')
        
        // Initialize snake with 4 segments
        snake = [
            { x: 7, y: 7 },
            { x: 6, y: 7 },
            { x: 5, y: 7 },
            { x: 4, y: 7 }
        ]

        score = 0
        updateScore()
        draw()
    }

    function updateScore() {
        const scoreEl = document.getElementById('score')
        if (scoreEl) scoreEl.textContent = String(score).padStart(3, '0')
    }

    function draw() {
        if (!ctx) return

        // Clear canvas (white background)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw grid
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1
        for (let i = 0; i <= settings.gridSize; i++) {
            const pos = i * settings.tileSize
            ctx.beginPath()
            ctx.moveTo(pos, 0)
            ctx.lineTo(pos, canvas.height)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(0, pos)
            ctx.lineTo(canvas.width, pos)
            ctx.stroke()
        }

        // Draw snake
        snake.forEach((segment, index) => {
            const x = segment.x * settings.tileSize
            const y = segment.y * settings.tileSize
            const color = index === 0 ? '#9ef4c9' : '#41d17b' // head is lighter

            ctx.fillStyle = color
            ctx.fillRect(x + 1, y + 1, settings.tileSize - 2, settings.tileSize - 2)
        })
    }

    // Expose to window for your implementation
    window._snakeGame = {
        snake,
        settings,
        draw,
        updateScore,
        getState: () => ({ snake, score })
    }

    // Initialize on page load
    init()
})()
