'use strict'

const MINE = '💣'
const EMPTY = '&nbsp;'
const FLAG = '🚩'
const HEART = '❤'
const BROKEN_HEART = '💔'

var gTimerInterval

var gBoard

const gLevel = {
    SIZE: 12,
    MINES: 32,
    hearts: 3,
}

const gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: gLevel.MINES,
    secsPassed: 0,
    lives: gLevel.hearts,
    hint: 3,
    bigHint: 3,
    selectCorners: 3,
    isLost: false,
}

const gModes = {
    bigHint: false,
    twoCorners: false,
    sevenBoom: false,
    usersBoard: false,
    userMarks: 0
}

function initGame() {
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)
    unableHints()
}

function buildBoard(rows, cols = rows) {
    const board = []
    for (var i = 0; i < rows; i++) {
        board[i] = []
        for (var j = 0; j < cols; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board
}

function renderBoard(board, selector = '.board') {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < board.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]

            const isMine = (cell.isMine) ? MINE : (cell.minesAroundCount) ? cell.minesAroundCount : EMPTY

            ///// change last isMine to empty
            const content = cell.isShown ? isMine : (cell.isMarked) ? FLAG : EMPTY
            const flipped = cell.isShown ? 'flipped' : ''
            const isLost = gGame.isLost && cell.isMine ? 'lose' : ''
            const className = `cell cell-${i}-${j} ${flipped} ${isLost}`
            const color = returnColor(cell.minesAroundCount)


            strHTML += `<td><div class="${className}" onclick="cellClicked(this)" oncontextmenu="cellRightClicked(this), event.preventDefault();" data-i=${i} data-j=${j}
            style="color:${color} ;">${content} </div></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
    var flag = document.querySelector('.flags span')
    flag.innerText = gGame.markedCount
}

function placeMines(board, num, cell) {
    var copy = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine || board[i][j] === cell) continue
            copy.push(board[i][j])
        }
    }
    for (var j = 0; j < num; j++) {
        var chosenCell = drawRandom(copy)
        chosenCell.value[0].isMine = true
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var negsCount = countNeg(gBoard, i, j)
            gBoard[i][j].minesAroundCount = negsCount
        }
    }
}

function cellClicked(cell) {
    const curCell = gBoard[cell.dataset.i][cell.dataset.j]

    if (!gGame.isOn) return

    if (gModes.bigHint) {
        reveal3x3(cell)
        gModes.bigHint = false
        return
    }

    if (gModes.twoCorners) {
        twoCorners(cell)
        return
    }

    if (gModes.usersBoard) {
        userMarks(curCell)

        return
    }
    gGame.isOn = true
    startTimer(curCell)

    if (curCell.isShown || curCell.isMarked) return

    curCell.isShown = true

    if (!curCell.minesAroundCount) {
        expandShown(gBoard, +cell.dataset.i, +cell.dataset.j)

    } else if (curCell.isMine) {
        checkGameOver()
    }
    cell.classList.add('flipped')
    gGame.shownCount++
    checkVictory()
    renderBoard(gBoard)
}

function cellRightClicked(cell) {
    if (!gGame.isOn || gModes.bigHint || gModes.twoCorners || gModes.usersBoard) return
    const curCell = gBoard[cell.dataset.i][cell.dataset.j]
    startTimer(curCell)

    if (curCell.isShown) return

    if (curCell.isMarked) {
        curCell.isMarked = false
        gGame.markedCount += 1

    } else {
        if (!gGame.markedCount) return
        curCell.isMarked = true
        gGame.markedCount -= 1
    }
    checkVictory()
    renderBoard(gBoard)
}

function onMode(mode) {
    var flag = document.querySelector('.flags span')
    var hearts = document.querySelector('.life')
    flag.innerText = mode.dataset.m
    gLevel.SIZE = mode.dataset.r
    gLevel.MINES = mode.dataset.m
    gGame.markedCount = mode.dataset.m
    gLevel.hearts = mode.dataset.h
    hearts.innerText = HEART.repeat(gLevel.hearts)


    restart()
}

function startTimer(cell) {
    const timer = document.querySelector('.game-info h3')
    if (gTimerInterval) return
    refreshModes()
    //// add mode condition here/ normal modeV
    if (!gModes.sevenBoom && !gModes.userMarks) placeMines(gBoard, gLevel.MINES, cell)
    setMinesNegsCount()
    gTimerInterval = setInterval(() => {
        ++gGame.secsPassed
        var displayMins = Math.floor(gGame.secsPassed / 60)
        var displaySecs = gGame.secsPassed % 60

        if (displaySecs < 10) {
            displaySecs = '0' + displaySecs
        }
        if (displayMins < 10) {
            displayMins = '0' + displayMins
        }

        timer.innerText = `${displayMins}:${displaySecs}`
    }, 1000)
}

function restart() {
    const endScreen = document.querySelector('.end-screen')
    const hearts = document.querySelector('.life')
    endScreen.style.display = 'none'
    hearts.innerText = HEART.repeat(gLevel.hearts)
    gModes.sevenBoom = false
    gModes.usersBoard = false
    gModes.userMarks = 0
    refreshGgame()
    initGame()
}

function expandShown(board, rowIdx, colIdx) {
    const negs = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (!board[i][j].isShown) gGame.shownCount++
            if (!board[i][j].isMine && !board[i][j].isShown) {
                board[i][j].isShown = true
                if (!board[i][j].minesAroundCount) {
                    negs.push({ i, j })

                }
            }
        }
    }

    if (!negs.length) return

    for (var k = 0; k < negs.length; k++) {
        expandShown(board, negs[k].i, negs[k].j)
    }
    return negs
}

function checkGameOver() {
    const hearts = document.querySelector('.life')
    const greet = document.querySelector('.greet')
    const endScreen = document.querySelector('.end-screen')
    gGame.lives--
    gGame.markedCount--
    hearts.innerText = HEART.repeat(gGame.lives)
    if (!gGame.lives) {
        clearInterval(gTimerInterval)
        greet.innerText = 'Solid effort'
        endScreen.style.display = 'flex'
        revealMines(gBoard)
        hearts.innerText = BROKEN_HEART
        gGame.isOn = false
        gGame.isLost = true

    }
    renderBoard(gBoard)
}

function checkVictory() {
    const endScreen = document.querySelector('.end-screen')
    const greet = document.querySelector('.greet')
    if (!gGame.markedCount &&
        gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES + (gLevel.hearts - gGame.lives)) {
        clearInterval(gTimerInterval)
        greet.innerText = 'Victory!'
        endScreen.style.display = 'flex'


    }
}

function revealMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
}

function returnColor(num) {
    switch (num) {
        case 1:
            return 'steelblue'
        case 2:
            return '#339720'
        case 3:
            return 'olive'
        case 4:
            return '#ad8332'
        case 5:
            return '#FF6B6B'
        case 6:
        case 7:
        case 8:
            return '#f21717'
        default:
            return ''
    }
}

/////hints menu
function toggleMenu() {
    const nav = document.querySelector('.nav-hints')
    const menu = nav.querySelector('.menu')
    nav.classList.toggle('active')
    menu.classList.toggle('active')

}

function hint(op) {
    toggleMenu()
    const hint = document.querySelector('.hint')
    const count = document.querySelector('.normal span')
    if (!gGame.hint || !gTimerInterval) return
    hint.style.animation = 'bulb 1s linear forwards'
    gGame.hint--
    count.innerText = gGame.hint
    if (!gGame.hint) op.classList.add('used')
    const safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) safeCells.push({ i, j })
        }
    }
    const drawn = drawRandom(safeCells)
    const selector = `.cell-${drawn.value[0].i}-${drawn.value[0].j}`
    const cell = document.querySelector(selector)
    cell.classList.add('safe')
}

function bigHint() {
    toggleMenu()
    if (!gTimerInterval) return
    if (!gGame.bigHint) return
    if (gModes.twoCorners) return
    gModes.bigHint = true
}

function reveal3x3(cell) {
    const row = +cell.dataset.i
    const col = +cell.dataset.j
    if (gBoard[row][col].isShown) return
    gGame.bigHint--
    document.querySelector('.big-hint span').innerText = gGame.bigHint
    if (!gGame.bigHint) document.querySelector('.big-hint').classList.add('used')


    const negs = []
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j > gBoard.length) continue
            if (!gBoard[i][j].isShown) {
                negs.push(gBoard[i][j])
                gBoard[i][j].isShown = true
            }
        }
    }
    renderBoard(gBoard)

    setTimeout(() => {
        for (var i = 0; i < negs.length; i++) {
            negs[i].isShown = false

        }
        renderBoard(gBoard)
    }, 1000);

}

function cornersHint(op) {
    toggleMenu()
    if (!gTimerInterval) return
    if (!gGame.selectCorners) return
    if (gModes.bigHint) return
    gModes.twoCorners = true
    gGame.selectCorners--
    document.querySelector('.corners span').innerText = gGame.selectCorners
    if (!gGame.selectCorners) op.classList.add('used')
}

function twoCorners(cell) {
    if (!gGame.lastCell) {
        gGame.lastCell = cell
        cell.classList.add('safe')
        return
    }
    const lastCellCoord = { i: gGame.lastCell.dataset.i, j: gGame.lastCell.dataset.j }
    const curCellCoord = { i: cell.dataset.i, j: cell.dataset.j }

    const startRow = (lastCellCoord.i > curCellCoord.i) ? curCellCoord.i : lastCellCoord.i
    const endRow = (lastCellCoord.i > curCellCoord.i) ? lastCellCoord.i : curCellCoord.i

    const startCol = (lastCellCoord.j > curCellCoord.j) ? curCellCoord.j : lastCellCoord.j
    const endCol = (lastCellCoord.j > curCellCoord.j) ? lastCellCoord.j : curCellCoord.j

    const revealed = []
    for (var i = startRow; i <= endRow; i++) {
        for (var j = startCol; j <= endCol; j++) {
            if (!gBoard[i][j].isShown) {
                revealed.push(gBoard[i][j])
                gBoard[i][j].isShown = true
            }
        }
    }

    renderBoard(gBoard)

    setTimeout(() => {
        for (var i = 0; i < revealed.length; i++) {
            revealed[i].isShown = false

        }
        renderBoard(gBoard)
    }, 1500);

    gGame.lastCell = null
    gModes.twoCorners = false
}

function refreshModes() {
    const modes = document.querySelectorAll('li')
    for (var i = 0; i < modes.length; i++) {
        modes[i].classList.remove('used')
    }

    gGame.hint = 3
    gGame.bigHint = 3
    gGame.selectCorners = 3

    document.querySelector('.normal span').innerText = gGame.hint
    document.querySelector('.big-hint span').innerText = gGame.bigHint
    document.querySelector('.corners span').innerText = gGame.selectCorners
}

function refreshGgame() {
    const timer = document.querySelector('.game-info h3')
    clearInterval(gTimerInterval)
    timer.innerText = '00:00'
    gTimerInterval = null
    gGame.lives = gLevel.hearts
    gGame.isOn = true
    gGame.secsPassed = 0
    gGame.shownCount = 0
    gGame.isLost = false
    gGame.markedCount = gLevel.MINES
}

function unableHints() {
    const hints = document.querySelectorAll('.hint')
    for (let i = 0; i < hints.length; i++) {
        hints[i].classList.add('used')
    }
}

function sevenBoom() {
    restart()
    gModes.sevenBoom = true
    var k = 0
    var minesCount = 0
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            k++
            const kStr = k + ''
            if (k % 7 === 0 || (k + 3) % 10 === 0 || +kStr.slice(0, 1) === 7) {
                gBoard[i][j].isMine = true
                minesCount++
            }
        }
    }
    console.log(minesCount);
    gLevel.MINES = minesCount
    gGame.markedCount = minesCount
    renderBoard(gBoard)
    toggleMenu()
}

function usersBoard() {
    restart()
    toggleMenu()
    gModes.usersBoard = true
}

function userMarks(cell) {
    if (cell.isMine) return
    gModes.userMarks++
    cell.isMine = true
    cell.isShown = true
    if (gModes.userMarks === +gLevel.MINES) {
        gModes.usersBoard = false
        flipMines()
    }
    renderBoard(gBoard)
}

function flipMines() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = false
            }
        }
    }
}

/// dark mode

function darkMode() {
    document.querySelector('.toggle').classList.toggle('active')

    document.querySelector('.choose-level').classList.toggle('dark-mode')
    document.querySelector('.game-conainer').classList.toggle('dark-mode')
    // document.querySelector('.nav-hints.active ul').classList.toggle('dark-mode')

    
}

